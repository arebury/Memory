import { useEffect, useMemo, useRef, useState } from "react";
import {
  Phone,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Download,
  Search,
  FileText,
  Sparkles,
  Loader2,
  FileX,
  TrendingUp,
} from "lucide-react";

import { Modal } from "./ui/modal";
import { cn } from "./ui/utils";
import { Conversation } from "../data/mockData";

/* Shared focus-ring utility — applied to every interactive element so
   keyboard navigation always has a visible target. Tied to the SC
   accent so it reads as part of the design system. */
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sc-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sc-surface";

interface ConversationPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  isTranscribing?: boolean;
  isAnalyzing?: boolean;
  onRequestTranscription?: (id: string) => void;
  onRequestAnalysis?: (id: string) => void;
}

/**
 * ConversationPlayerModal · single-conversation viewer.
 *
 * Mirrors the structural concept of Figma node 325:10103 (compact player
 * with transcript/analysis tabs) but adapts the surface to the SC design
 * system so the experience matches BulkTranscriptionModal: white surface,
 * Modal shell from `ui/modal`, SC tokens for type and spacing.
 *
 * Anatomy:
 *   Header  ─ icon + "Conversación · {id}" + meta (service · date · hour)
 *   Body
 *     ├ Audio player row  ── compact transport (back10 · play · fwd10 ·
 *     │                       elapsed · scrub · total · download)
 *     └ Tabs              ── Transcripción / Análisis with empty-state
 *                            CTAs that hand back to the parent for
 *                            individual transcription / analysis requests.
 *   Footer  ─ single "Cerrar" action.
 */
export function ConversationPlayerModal({
  isOpen,
  onClose,
  conversation,
  isTranscribing = false,
  isAnalyzing = false,
  onRequestTranscription,
  onRequestAnalysis,
}: ConversationPlayerModalProps) {
  const [activeTab, setActiveTab] = useState<"transcription" | "analysis">(
    "transcription",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestingTranscription, setRequestingTranscription] = useState(false);
  const [requestingAnalysis, setRequestingAnalysis] = useState(false);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  /* ── Reset transient state when the modal opens or conversation changes ── */
  useEffect(() => {
    if (!isOpen) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setSearchTerm("");
    setRequestingTranscription(false);
    setRequestingAnalysis(false);
    // Default tab: analysis if no transcription but analysis exists; else transcription.
    if (conversation && !conversation.hasTranscription && conversation.hasAnalysis) {
      setActiveTab("analysis");
    } else {
      setActiveTab("transcription");
    }
  }, [isOpen, conversation?.id]);

  /* ── Duration parsing & playback simulation ── */
  const parseDuration = (dur?: string) => {
    if (!dur) return 0;
    const parts = dur.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const totalDuration = useMemo(
    () => parseDuration(conversation?.duration) || 103,
    [conversation?.duration],
  );

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPlaying, totalDuration]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${Math.floor(s % 60)
      .toString()
      .padStart(2, "0")}`;

  const handleSeek = (t: number) =>
    setCurrentTime(Math.max(0, Math.min(totalDuration, t)));

  /* ── Per-conversation request handlers ── */
  const handleTranscriptionRequest = async () => {
    if (!conversation || !onRequestTranscription) return;
    setRequestingTranscription(true);
    try {
      await Promise.resolve(onRequestTranscription(conversation.id));
    } finally {
      // Parent owns the timer; we just unblock the local button quickly.
      setTimeout(() => setRequestingTranscription(false), 600);
    }
  };

  const handleAnalysisRequest = async () => {
    if (!conversation || !onRequestAnalysis) return;
    setRequestingAnalysis(true);
    try {
      await Promise.resolve(onRequestAnalysis(conversation.id));
    } finally {
      setTimeout(() => setRequestingAnalysis(false), 600);
    }
  };

  if (!conversation) return null;

  const isChat = conversation.channel === "chat";
  const canRequestAnalysis = conversation.hasTranscription || isChat;
  const playerEnabled = !isChat && !!conversation.hasRecording;
  const progressPct = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  /* ── Derived view models ── */
  const filteredLines = (conversation.transcription ?? []).filter((line) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      line.text.toLowerCase().includes(q) ||
      line.speaker.toLowerCase().includes(q)
    );
  });

  const subtitle = `${conversation.service} · ${conversation.date} ${conversation.hour} · Duración ${conversation.duration}`;
  const headerIcon = isChat ? (
    <MessageSquare className="size-full" strokeWidth={1.75} />
  ) : (
    <Phone className="size-full" strokeWidth={1.75} />
  );
  const conversationLabel = isChat ? "Chat" : "Llamada";

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <Modal open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Modal.Content width={720}>
        <Modal.Header
          icon={headerIcon}
          title={
            <span className="flex items-center gap-[var(--sc-space-200)]">
              <span>{conversationLabel}</span>
              <span className="font-mono text-sc-base font-normal text-sc-muted">
                #{conversation.id}
              </span>
            </span>
          }
          subtitle={subtitle}
        />

        <Modal.Body className="!p-0">
          {/* ── Audio player ─ only for calls; chats have no audio.
                For calls without recording, the same row renders with
                disabled controls so the structure stays consistent. ── */}
          {!isChat && (
            <div className="flex items-center gap-[var(--sc-space-300)] border-b border-sc-border-soft bg-sc-surface-muted px-[var(--sc-space-600)] py-[var(--sc-space-400)]">
              <button
                type="button"
                onClick={() => handleSeek(currentTime - 10)}
                disabled={!playerEnabled}
                className={cn(
                  "flex size-9 cursor-pointer items-center justify-center rounded-full text-sc-body transition-colors",
                  "hover:bg-sc-border-soft disabled:cursor-not-allowed disabled:opacity-40",
                  FOCUS_RING,
                )}
                aria-label="Retroceder 10 segundos"
              >
                <RotateCcw size={16} />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                disabled={!playerEnabled}
                className={cn(
                  "flex size-10 cursor-pointer items-center justify-center rounded-full bg-sc-primary text-sc-on-primary shadow-sc-sm transition-colors",
                  "hover:bg-sc-primary-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40",
                  FOCUS_RING,
                )}
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleSeek(currentTime + 10)}
                disabled={!playerEnabled}
                className={cn(
                  "flex size-9 cursor-pointer items-center justify-center rounded-full text-sc-body transition-colors",
                  "hover:bg-sc-border-soft disabled:cursor-not-allowed disabled:opacity-40",
                  FOCUS_RING,
                )}
                aria-label="Avanzar 10 segundos"
              >
                <RotateCw size={16} />
              </button>

              <span className="w-12 text-right font-mono text-sc-sm tabular-nums text-sc-body">
                {formatTime(currentTime)}
              </span>

              {/* Scrub bar — bigger hit target than the visible track,
                  thumb appears on hover/focus so the resting state stays
                  flat per DS minimalism. */}
              <button
                type="button"
                onClick={(e) => {
                  if (!playerEnabled) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  handleSeek(((e.clientX - rect.left) / rect.width) * totalDuration);
                }}
                disabled={!playerEnabled}
                aria-label="Buscar posición"
                aria-valuemin={0}
                aria-valuemax={totalDuration}
                aria-valuenow={currentTime}
                role="slider"
                className={cn(
                  "group relative flex h-5 flex-1 cursor-pointer items-center rounded-full",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  FOCUS_RING,
                )}
              >
                <span className="relative h-1.5 w-full overflow-visible rounded-full bg-sc-border-soft">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-sc-accent transition-[width] duration-150"
                    style={{ width: `${progressPct}%` }}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sc-accent shadow-sc-sm transition-opacity",
                      "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                      isPlaying && "opacity-100",
                    )}
                    style={{ left: `${progressPct}%` }}
                  />
                </span>
              </button>

              <span className="w-12 font-mono text-sc-sm tabular-nums text-sc-body">
                {formatTime(totalDuration)}
              </span>

              <span className="mx-1 h-5 w-px bg-sc-border-soft" />

              <button
                type="button"
                disabled={!playerEnabled}
                className={cn(
                  "flex size-9 cursor-pointer items-center justify-center rounded-sc-md text-sc-body transition-colors",
                  "hover:bg-sc-border-soft disabled:cursor-not-allowed disabled:opacity-40",
                  FOCUS_RING,
                )}
                aria-label="Descargar audio"
                title="Descargar audio"
              >
                <Download size={15} />
              </button>
            </div>
          )}

          {/* ── Tabs ─────────────────────────────────────────────────── */}
          <div className="flex items-center gap-[var(--sc-space-500)] border-b border-sc-border-soft px-[var(--sc-space-600)]">
            <TabButton
              active={activeTab === "transcription"}
              onClick={() => setActiveTab("transcription")}
              icon={<FileText size={14} />}
              label="Transcripción"
            />
            <TabButton
              active={activeTab === "analysis"}
              onClick={() => setActiveTab("analysis")}
              icon={<Sparkles size={14} />}
              label="Análisis"
            />
          </div>

          {/* ── Tab body — min-h for breathing room (taste-skill VISUAL_DENSITY 4) ── */}
          <div className="flex min-h-[360px] flex-col">
            {activeTab === "transcription" ? (
              <TranscriptionTab
                conversation={conversation}
                isProcessing={isTranscribing}
                requesting={requestingTranscription || isTranscribing}
                onRequest={handleTranscriptionRequest}
                lines={filteredLines}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                scrollRef={transcriptScrollRef}
              />
            ) : (
              <AnalysisTab
                conversation={conversation}
                canRequest={canRequestAnalysis}
                requesting={requestingAnalysis || isAnalyzing}
                isAnalyzing={isAnalyzing}
                onRequest={handleAnalysisRequest}
              />
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Cancel>Cerrar</Modal.Cancel>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Tab button — accent underline when active, matches DS Modal hairlines.
   ───────────────────────────────────────────────────────────────── */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex cursor-pointer items-center gap-[var(--sc-space-200)] py-[var(--sc-space-300)]",
        "text-sc-base font-medium transition-colors",
        FOCUS_RING,
        "rounded-sc-sm focus-visible:ring-offset-1",
        active ? "text-sc-heading" : "text-sc-muted hover:text-sc-body",
      )}
    >
      {icon}
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 -bottom-px h-[2px] rounded-full transition-colors",
          active ? "bg-sc-accent" : "bg-transparent",
        )}
      />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Transcription tab
   ───────────────────────────────────────────────────────────────── */

function TranscriptionTab({
  conversation,
  isProcessing,
  requesting,
  onRequest,
  lines,
  searchTerm,
  onSearchChange,
  scrollRef,
}: {
  conversation: Conversation;
  isProcessing: boolean;
  requesting: boolean;
  onRequest: () => void;
  lines: { time: string; speaker: string; text: string }[];
  searchTerm: string;
  onSearchChange: (v: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}) {
  /* Empty states ───────────────────────────────────────────── */
  if (isProcessing) {
    return (
      <EmptyState
        icon={<Loader2 size={28} className="animate-spin text-sc-accent" />}
        title="Transcripción en proceso"
        description="La transcripción se está generando. Estará disponible en breve."
      />
    );
  }

  if (!conversation.hasRecording && conversation.channel === "llamada") {
    return (
      <EmptyState
        icon={<FileX size={28} className="text-sc-muted" />}
        title="Sin grabación disponible"
        description="Esta conversación no tiene grabación de audio asociada."
      />
    );
  }

  if (!conversation.hasTranscription) {
    return (
      <EmptyState
        icon={<FileText size={28} className="text-sc-muted" />}
        title="Sin transcripción disponible"
        description={
          conversation.channel === "chat"
            ? "Este chat aún no se ha procesado para extraer texto estructurado."
            : "Esta grabación no ha sido transcrita. Puedes solicitarla individualmente."
        }
        action={{
          label: requesting ? "Solicitando…" : "Solicitar transcripción",
          icon: requesting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileText size={14} />
          ),
          onClick: onRequest,
          disabled: requesting,
        }}
      />
    );
  }

  if (!conversation.transcription || conversation.transcription.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={28} className="text-sc-muted" />}
        title="Transcripción vacía"
        description="No hay líneas de transcripción para mostrar."
      />
    );
  }

  /* Active transcription ───────────────────────────────────── */
  return (
    <>
      <div className="flex items-center justify-between gap-[var(--sc-space-300)] px-[var(--sc-space-600)] py-[var(--sc-space-300)]">
        <span className="text-sc-sm text-sc-muted">
          {lines.length} {lines.length === 1 ? "intervención" : "intervenciones"}
        </span>
        <div className="relative w-full max-w-[260px]">
          <Search
            size={12}
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sc-muted"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar en transcripción"
            aria-label="Buscar en la transcripción"
            /* font-size via style — twMerge collapses `text-sc-sm` (size)
               with `text-sc-body` (color) into one bucket and drops the
               size silently. Keeping color in className lets state-based
               color switches still merge correctly. */
            style={{ fontSize: "var(--sc-font-size-sm)" }}
            className={cn(
              "h-8 w-full rounded-full border border-sc-border bg-sc-surface pl-7 pr-3",
              "text-sc-body placeholder:text-sc-muted",
              "transition-colors hover:border-sc-border-default",
              "focus:border-sc-accent focus:outline-none focus:ring-2 focus:ring-sc-accent/20",
            )}
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="modal-scrollbar flex-1 overflow-y-auto px-[var(--sc-space-600)] pb-[var(--sc-space-400)]"
      >
        {/* Chat-style bubble layout · same visual treatment for calls
            and chats (the user requested both render as a diarized
            chat conversation). Agent / Speaker 1 sits on the right
            with an accent bubble; client / Speaker 2 sits on the left
            with a muted bubble. */}
        <div className="flex flex-col gap-[var(--sc-space-400)]">
          {lines.map((line, idx) => {
            const isAgent = isAgentSpeaker(line.speaker, conversation);
            return (
              <div
                key={`${line.time}-${idx}`}
                className={cn(
                  "flex w-full",
                  isAgent ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[78%] flex-col gap-1",
                    isAgent ? "items-end" : "items-start",
                  )}
                >
                  <div className="flex items-baseline gap-[var(--sc-space-200)] px-1">
                    <span className="text-sc-xs font-medium text-sc-body">
                      {line.speaker}
                    </span>
                    <span className="font-mono text-sc-xs text-sc-muted">
                      {line.time}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-[var(--sc-space-400)] py-[var(--sc-space-300)] text-sc-base leading-[var(--sc-line-height-body2)]",
                      isAgent
                        ? "rounded-br-md bg-sc-accent-soft text-sc-heading"
                        : "rounded-bl-md bg-sc-border-soft text-sc-body",
                    )}
                  >
                    {line.text}
                  </div>
                </div>
              </div>
            );
          })}
          {lines.length === 0 && (
            <p className="py-6 text-center text-sc-sm text-sc-muted">
              No hay coincidencias para «{searchTerm}».
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* Heuristic to decide which side a transcript line sits on. The
   generator labels chats as "Speaker 1" (agent-side) / "Speaker 2"
   (other side); calls use real names. The conversation's `origin`
   often is the agent's name when it's a person, otherwise we fall
   back to the literal "Agente" label. */
function isAgentSpeaker(speaker: string, conversation: Conversation): boolean {
  const s = speaker.toLowerCase().trim();
  if (s === "agente" || s === "speaker 1") return true;
  if (s === "cliente" || s === "speaker 2") return false;
  if (conversation.channel === "llamada") {
    const origin = conversation.origin.toLowerCase().trim();
    if (origin && origin === s) return true;
  }
  return false;
}

/* ─────────────────────────────────────────────────────────────────
   Analysis tab
   ───────────────────────────────────────────────────────────────── */

function AnalysisTab({
  conversation,
  canRequest,
  requesting,
  isAnalyzing,
  onRequest,
}: {
  conversation: Conversation;
  canRequest: boolean;
  requesting: boolean;
  isAnalyzing: boolean;
  onRequest: () => void;
}) {
  if (isAnalyzing && !conversation.hasAnalysis) {
    return (
      <EmptyState
        icon={<Loader2 size={28} className="animate-spin text-sc-accent" />}
        title="Análisis en proceso"
        description="Estamos generando el análisis IA. Estará disponible en breve."
      />
    );
  }

  if (!conversation.hasAnalysis) {
    if (!canRequest) {
      return (
        <EmptyState
          icon={<Sparkles size={28} className="text-sc-muted" />}
          title="Análisis no disponible"
          description="Necesitas transcribir esta llamada antes de poder analizarla."
        />
      );
    }
    return (
      <EmptyState
        icon={<Sparkles size={28} className="text-sc-muted" />}
        title="Sin análisis disponible"
        description="Aún no se ha generado análisis IA para esta conversación. Puedes solicitarlo individualmente."
        action={{
          label: requesting ? "Solicitando…" : "Solicitar análisis",
          icon: requesting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          ),
          onClick: onRequest,
          disabled: requesting,
        }}
      />
    );
  }

  /* Análisis = sólo Resumen + Sentimiento. El resumen se deriva del
     contenido de la transcripción (los templates determinan el dominio,
     el sentimiento se infiere del léxico negativo / patterns). */
  const summary = summarizeTranscript(conversation);
  const sentiment = pickSentiment(conversation);

  return (
    <div className="modal-scrollbar flex-1 overflow-y-auto px-[var(--sc-space-600)] pb-[var(--sc-space-400)] pt-[var(--sc-space-400)]">
      <div className="flex max-w-prose flex-col gap-[var(--sc-space-500)]">
        <Section
          title="Resumen"
          icon={<FileText size={13} />}
          aside={
            <span
              className="inline-flex items-center gap-1 text-sc-xs font-normal normal-case tracking-normal text-sc-muted"
              title="Generado automáticamente a partir de la transcripción"
            >
              <Sparkles size={10} className="text-sc-accent-strong" />
              Generado por IA
            </span>
          }
        >
          {summary ? (
            <p className="text-sc-base leading-[var(--sc-line-height-body2)] text-sc-body">
              {summary}
            </p>
          ) : (
            <p className="text-sc-sm text-sc-muted">
              No hay transcripción suficiente para generar un resumen.
            </p>
          )}
        </Section>

        <Section title="Sentimiento" icon={<TrendingUp size={13} />}>
          <div className="flex items-baseline gap-[var(--sc-space-200)]">
            <span
              aria-hidden
              className="relative top-[1px] inline-block size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: sentiment.color }}
            />
            <span className="text-sc-base font-medium text-sc-heading">
              {sentiment.label}
            </span>
            <span className="text-sc-sm text-sc-muted">
              · {sentiment.summary}
            </span>
          </div>
        </Section>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Reusable bits
   ───────────────────────────────────────────────────────────────── */

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[var(--sc-space-300)] px-[var(--sc-space-600)] text-center">
      {icon}
      <div className="flex flex-col gap-[var(--sc-space-100)]">
        <p className="text-sc-md font-medium text-sc-heading">{title}</p>
        <p className="max-w-sm text-sc-sm text-sc-muted">{description}</p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          /* See note above: font-size via style to bypass twMerge
             collapsing `text-sc-sm` and `text-sc-accent-strong`. */
          style={{ fontSize: "var(--sc-font-size-sm)" }}
          className={cn(
            "mt-1 inline-flex items-center gap-2 rounded-sc-md border border-sc-accent bg-sc-accent-soft px-4 py-2",
            "font-medium text-sc-accent-strong transition-colors",
            "hover:bg-sc-accent hover:text-sc-on-primary",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  aside,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-[var(--sc-space-200)]">
      <header className="flex items-center justify-between gap-[var(--sc-space-300)]">
        <span className="flex items-center gap-[var(--sc-space-200)] text-sc-xs font-bold uppercase tracking-wide text-sc-body">
          {icon}
          {title}
        </span>
        {aside}
      </header>
      {children}
    </section>
  );
}

/* Deterministic mock helpers — analysis values derived from the
   conversation id so the same row always shows the same payload. */

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickSentiment(c: Conversation) {
  const palette = [
    { label: "Positivo", color: "#10B981", summary: "tono general favorable" },
    { label: "Neutral",  color: "#9CA3AF", summary: "sin sesgo emocional" },
    { label: "Negativo", color: "#F59E0B", summary: "fricción detectada" },
  ];
  // Negative cue 1: transcript contains explicit complaint vocabulary.
  const transcriptText = (c.transcription ?? [])
    .map((l) => l.text)
    .join(" ")
    .toLowerCase();
  if (
    /molest|frustr|inadmis|reclam|queja|incidenc|problem|injust|enfad|inacept/i.test(
      transcriptText,
    )
  ) {
    return palette[2];
  }
  return palette[hashString(c.id) % palette.length];
}

/* Build a one-paragraph summary from the transcription. The 6 mock
   templates correspond to 6 narrative summaries; we pick by id-hash so
   the summary stays in sync with the dialogue actually shown. */
const SUMMARY_TEMPLATES: string[] = [
  "El cliente reporta una incidencia de servicio activa desde hace 48 horas. El agente identifica una avería de zona ya reportada, escala a prioridad alta y compromete una compensación en la próxima factura.",
  "Conversación comercial sobre el plan empresarial. El interesado pregunta por capacidad para 50 usuarios y precio; el agente recomienda Pro, propone descuento anual y agenda demo para el viernes.",
  "Soporte técnico urgente: el cliente describe un sistema sin arranque. Tras un protocolo de modo seguro, se restablece el acceso y la incidencia se escala a nivel 2 para limpieza de logs.",
  "Disputa de facturación. El cliente cuestiona un cargo de 45,50 € por finalización de promoción. El agente reconoce el malentendido, aplica una bonificación del 20 % durante tres meses y cierra acordada.",
  "Seguimiento de pedido número 4521. El agente confirma fecha y franja de entrega, indica que se enviará tracking en tiempo real y aclara que la instalación está incluida.",
  "Solicitud de baja del servicio premium por uso esporádico. El agente ofrece un plan reducido al 50 % con cupo mensual de 20 horas; el cliente acepta y se programa el cambio para el próximo periodo.",
];

function summarizeTranscript(c: Conversation): string | null {
  const lines = c.transcription ?? [];
  if (lines.length === 0) return null;
  const idx = hashString(c.id) % SUMMARY_TEMPLATES.length;
  return SUMMARY_TEMPLATES[idx];
}
