import { useEffect, useMemo, useRef, useState } from "react";
import {
  Headphones,
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
  User,
  Tag,
  TrendingUp,
} from "lucide-react";

import { Modal } from "./ui/modal";
import { cn } from "./ui/utils";
import { Conversation } from "../data/mockData";

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

  const canRequestAnalysis = conversation.hasTranscription || conversation.channel === "chat";

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

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <Modal open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Modal.Content width={720}>
        <Modal.Header
          icon={<Headphones className="size-full" strokeWidth={1.75} />}
          title={
            <span className="flex items-center gap-[var(--sc-space-200)]">
              <span>Conversación</span>
              <span className="font-mono text-sc-base font-normal text-sc-muted">
                #{conversation.id}
              </span>
            </span>
          }
          subtitle={subtitle}
        />

        <Modal.Body className="!p-0">
          {/* ── Audio player ─────────────────────────────────────────── */}
          <div className="flex items-center gap-[var(--sc-space-300)] border-b border-sc-border-soft bg-sc-surface-muted px-[var(--sc-space-600)] py-[var(--sc-space-400)]">
            <button
              type="button"
              onClick={() => handleSeek(currentTime - 10)}
              disabled={!conversation.hasRecording}
              className="flex size-9 items-center justify-center rounded-full text-sc-body transition-colors hover:bg-sc-border-soft disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Retroceder 10 segundos"
            >
              <RotateCcw size={16} />
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              disabled={!conversation.hasRecording}
              className="flex size-10 items-center justify-center rounded-full bg-sc-primary text-sc-on-primary shadow-sc-sm transition-colors hover:bg-sc-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => handleSeek(currentTime + 10)}
              disabled={!conversation.hasRecording}
              className="flex size-9 items-center justify-center rounded-full text-sc-body transition-colors hover:bg-sc-border-soft disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Avanzar 10 segundos"
            >
              <RotateCw size={16} />
            </button>

            <span className="w-12 text-right font-mono text-sc-sm tabular-nums text-sc-body">
              {formatTime(currentTime)}
            </span>

            <button
              type="button"
              className="group relative h-2 flex-1 overflow-visible rounded-full bg-sc-border-soft"
              onClick={(e) => {
                if (!conversation.hasRecording) return;
                const rect = e.currentTarget.getBoundingClientRect();
                handleSeek(((e.clientX - rect.left) / rect.width) * totalDuration);
              }}
              disabled={!conversation.hasRecording}
              aria-label="Buscar posición"
            >
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-sc-accent"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
            </button>

            <span className="w-12 font-mono text-sc-sm tabular-nums text-sc-body">
              {formatTime(totalDuration)}
            </span>

            <span className="mx-1 h-5 w-px bg-sc-border-soft" />

            <button
              type="button"
              disabled={!conversation.hasRecording}
              className="flex size-9 items-center justify-center rounded-sc-md text-sc-body transition-colors hover:bg-sc-border-soft disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Descargar audio"
              title="Descargar audio"
            >
              <Download size={15} />
            </button>
          </div>

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

          {/* ── Tab body ─────────────────────────────────────────────── */}
          <div className="flex h-[320px] flex-col">
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
        "relative flex items-center gap-[var(--sc-space-200)] py-[var(--sc-space-300)]",
        "text-sc-base font-medium transition-colors",
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
          {lines.length} {lines.length === 1 ? "línea" : "líneas"}
        </span>
        <div className="relative">
          <Search
            size={12}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sc-muted"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar en transcripción"
            className={cn(
              "h-8 w-56 rounded-full border border-sc-border pl-7 pr-3",
              "text-sc-sm text-sc-body placeholder:text-sc-muted",
              "focus:border-sc-accent focus:outline-none",
            )}
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="modal-scrollbar flex-1 overflow-y-auto px-[var(--sc-space-600)] pb-[var(--sc-space-400)]"
      >
        <div className="flex flex-col gap-[var(--sc-space-300)]">
          {lines.map((line, idx) => {
            const isAgent =
              line.speaker.toLowerCase().includes("agente") ||
              line.speaker.toLowerCase().includes("oscar") ||
              line.speaker.toLowerCase().includes("garcía") ||
              line.speaker.toLowerCase().includes("lópez");
            return (
              <div
                key={`${line.time}-${idx}`}
                className="flex items-start gap-[var(--sc-space-300)]"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    isAgent
                      ? "bg-sc-accent-soft text-sc-accent-strong"
                      : "bg-sc-border-soft text-sc-body",
                  )}
                >
                  {isAgent ? (
                    <Headphones size={12} />
                  ) : (
                    <User size={12} />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-baseline gap-[var(--sc-space-200)]">
                    <span className="text-sc-sm font-medium text-sc-heading">
                      {line.speaker}
                    </span>
                    <span className="font-mono text-sc-xs text-sc-muted">
                      {line.time}
                    </span>
                  </div>
                  <p className="text-sc-base leading-[var(--sc-line-height-body2)] text-sc-body">
                    {line.text}
                  </p>
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

  /* Analysis content (mocked from data we have) ──────────────── */
  const categories = conversation.aiCategories ?? [];
  const sentiment = pickSentiment(conversation);
  const entities = mockEntitiesFor(conversation);

  return (
    <div className="modal-scrollbar flex-1 overflow-y-auto px-[var(--sc-space-600)] pb-[var(--sc-space-400)] pt-[var(--sc-space-300)]">
      <div className="flex flex-col gap-[var(--sc-space-500)]">
        <Section title="Categorías detectadas" icon={<Tag size={13} />}>
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-[var(--sc-space-200)]">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 rounded-full border border-sc-border bg-sc-surface px-2.5 py-1 text-sc-xs text-sc-body"
                >
                  <Sparkles size={10} className="text-sc-accent-strong" />
                  {cat}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sc-sm text-sc-muted">
              No se detectaron categorías para esta conversación.
            </p>
          )}
        </Section>

        <Section title="Sentimiento general" icon={<TrendingUp size={13} />}>
          <div className="flex items-center gap-[var(--sc-space-300)]">
            <span
              className="size-2.5 shrink-0 rounded-full"
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

        <Section title="Entidades clave" icon={<Sparkles size={13} />}>
          <div className="flex flex-col gap-[var(--sc-space-200)]">
            {entities.map((e) => (
              <div
                key={e.name}
                className="flex items-center justify-between gap-[var(--sc-space-300)] rounded-sc-md border border-sc-border-soft bg-sc-surface px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sc-xs uppercase tracking-wide text-sc-muted">
                    {e.name}
                  </span>
                  <span className="text-sc-base text-sc-heading">{e.value}</span>
                </div>
                <span className="font-mono text-sc-xs text-sc-muted">
                  {e.confidence}%
                </span>
              </div>
            ))}
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
          className={cn(
            "mt-1 inline-flex items-center gap-2 rounded-sc-md border border-sc-accent bg-sc-accent-soft px-4 py-2",
            "text-sc-sm font-medium text-sc-accent-strong transition-colors",
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
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-[var(--sc-space-200)]">
      <header className="flex items-center gap-[var(--sc-space-200)] text-sc-xs font-bold uppercase tracking-wide text-sc-body">
        {icon}
        {title}
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
  const has = (c.aiCategories ?? []).some((x) =>
    /queja|problem|incid/i.test(x),
  );
  if (has) return palette[2];
  return palette[hashString(c.id) % palette.length];
}

function mockEntitiesFor(c: Conversation) {
  const seed = hashString(c.id);
  const dni = `${10000000 + (seed % 89999999)}${"ABCDEFGHJ"[seed % 9]}`;
  const importe = `${(seed % 200) + 5},${((seed * 7) % 100).toString().padStart(2, "0")} €`;
  return [
    { name: "ID Cliente", value: c.id.slice(0, 8), confidence: 92 + (seed % 7) },
    { name: "DNI", value: dni, confidence: 84 + (seed % 12) },
    { name: "Importe", value: importe, confidence: 88 + (seed % 9) },
  ];
}
