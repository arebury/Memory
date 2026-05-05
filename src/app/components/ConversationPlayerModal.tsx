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
  AlignLeft,
  Sparkles,
  Loader2,
  FileX,
  TrendingUp,
} from "lucide-react";

import { Modal } from "./ui/modal";
import { cn } from "./ui/utils";
import { FOCUS_RING } from "./ui/focus";
import { RetranscriptionConfirmModal } from "./RetranscriptionConfirmModal";
import { MultiRecordingPlayer } from "./MultiRecordingPlayer";
import { Conversation } from "../data/mockData";

interface ConversationPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  isTranscribing?: boolean;
  isAnalyzing?: boolean;
  onRequestTranscription?: (id: string) => void;
  onRequestAnalysis?: (id: string) => void;
  /** Combined handler for the analysis dead-end empty state. The
   *  parent owns the timing — when the transcription mutation lands,
   *  the parent's effect drains a queue and dispatches analysis.
   *  We pass the request through; we don't time it ourselves. */
  onRequestTranscriptionAndAnalysis?: (id: string) => void;
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
  onRequestTranscriptionAndAnalysis,
}: ConversationPlayerModalProps) {
  const [activeTab, setActiveTab] = useState<"transcription" | "analysis">(
    "transcription",
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [requestingTranscription, setRequestingTranscription] = useState(false);
  const [requestingAnalysis, setRequestingAnalysis] = useState(false);
  const [showRetranscriptionConfirm, setShowRetranscriptionConfirm] = useState(false);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
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
    // Default selected recording: first one (or null when none / single).
    if (conversation?.recordings && conversation.recordings.length > 1) {
      setSelectedRecordingId(conversation.recordings[0].id);
    } else {
      setSelectedRecordingId(null);
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

  // When a multi-recording conversation has a selected leg, the audio
  // bar timing reflects that leg, not the aggregated conversation
  // duration. Falls back to the conversation duration otherwise.
  const totalDuration = useMemo(() => {
    const selectedRec = selectedRecordingId
      ? conversation?.recordings?.find((r) => r.id === selectedRecordingId)
      : null;
    return parseDuration(selectedRec?.duration ?? conversation?.duration) || 103;
  }, [conversation?.duration, conversation?.recordings, selectedRecordingId]);

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

  /* ── Per-conversation request handlers ──
     First-time transcription dispatches directly: the cost cue lives
     inline under the CTA in DecisionState, so a confirm modal would be
     a redundant click. Re-transcription DOES gate (destructive — it
     overwrites transcript + derived analysis), via RetranscriptionConfirmModal. */
  const handleTranscriptionRequest = async () => {
    if (!conversation || !onRequestTranscription) return;
    setRequestingTranscription(true);
    try {
      await Promise.resolve(onRequestTranscription(conversation.id));
    } finally {
      setTimeout(() => setRequestingTranscription(false), 600);
    }
  };

  const confirmRetranscription = async () => {
    if (!conversation || !onRequestTranscription) return;
    // Re-uses the same dispatch; the parent will overwrite the
    // existing transcription/analysis when re-running.
    setRequestingTranscription(true);
    try {
      await Promise.resolve(onRequestTranscription(conversation.id));
    } finally {
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

  /* Combined CTA — delegates to the parent's chain handler, which
     owns the timing via an effect that drains a queue when the
     transcription mutation lands. The previous local setTimeout(6500)
     was brittle: it captured `onRequestAnalysis` at click-time and
     called it with stale `conversations` in the parent's closure,
     so the eligibility filter (`hasTranscription === true`) failed.
     Event-driven chain in the parent fixes both issues. */
  const handleTranscribeAndAnalyze = () => {
    if (!conversation || !onRequestTranscriptionAndAnalysis) return;
    setRequestingAnalysis(true);
    void Promise.resolve(
      onRequestTranscriptionAndAnalysis(conversation.id),
    );
    // Local "requesting" flag mirrors the parent's processing state;
    // we release it shortly after dispatch so the button doesn't sit
    // disabled forever — the table icon shows the rest of the lifecycle.
    setTimeout(() => setRequestingAnalysis(false), 600);
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
          {/* Audio surface · two variants:
              · multi-leg calls render `MultiRecordingPlayer` (transport +
                segmented bar + leg labels in one unified component);
              · single-leg calls keep the standalone audio bar below.
              Chats have no audio — the whole audio block is skipped. */}
          {!isChat &&
          conversation.recordings &&
          conversation.recordings.length > 1 ? (
            <MultiRecordingPlayer
              recordings={conversation.recordings}
              selectedId={selectedRecordingId ?? conversation.recordings[0].id}
              onSelectRecording={(id) => {
                setSelectedRecordingId(id);
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((p) => !p)}
              currentTime={currentTime}
              totalDuration={totalDuration}
              onSeek={handleSeek}
              playerEnabled={playerEnabled}
            />
          ) : null}

          {/* ── Audio player ─ only for single-leg calls; chats have no audio.
                For calls without recording, the same row renders with
                disabled controls so the structure stays consistent. ── */}
          {!isChat && !(conversation.recordings && conversation.recordings.length > 1) && (
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
                  {/* Fill via transform scaleX — full-width element
                      scaled along origin-left. Animating `width` would
                      trigger reflow on every tick of playback. The
                      thumb sits on top with `left: %` (no transition
                      on `left`, so no layout-property animation). */}
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-left rounded-full bg-sc-accent transition-transform duration-150 will-change-transform"
                    style={{ transform: `scaleX(${progressPct / 100})` }}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sc-accent shadow-sc-sm transition-opacity",
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

              {/* Download moved to the tab row (single afford for
                  calls + chats). The previous duplicate here was
                  redundant — the tab-row button covers both channels
                  and prevents asymmetry. */}
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
            {/* Right-aligned actions: Re-transcribe (when applicable) + Download.
                Re-transcribe is destructive (replaces transcript + derived
                analysis) — kept low-key as a neutral icon button to avoid
                accidental clicks; the modal has the CONFIRMAR gate. */}
            <span className="ml-auto flex items-center gap-1 pr-[var(--sc-space-300)] py-[var(--sc-space-200)]">
              {conversation.hasTranscription && (
                <button
                  type="button"
                  aria-label="Re-transcribir conversación"
                  title="Re-transcribir"
                  className={cn(
                    "flex size-8 cursor-pointer items-center justify-center rounded-sc-md text-sc-muted transition-colors",
                    "hover:bg-sc-border-soft hover:text-sc-heading",
                    FOCUS_RING,
                  )}
                  onClick={() => setShowRetranscriptionConfirm(true)}
                >
                  <RotateCcw size={15} />
                </button>
              )}
              <button
                type="button"
                aria-label={isChat ? "Descargar conversación como texto" : "Descargar audio y transcripción"}
                title={isChat ? "Descargar conversación" : "Descargar audio"}
                className={cn(
                  "flex size-8 cursor-pointer items-center justify-center rounded-sc-md text-sc-muted transition-colors",
                  "hover:bg-sc-border-soft hover:text-sc-heading",
                  FOCUS_RING,
                )}
                onClick={() => {
                  // Mock — wired by the parent in production. Keeping
                  // local until the real export endpoint exists.
                  // eslint-disable-next-line no-console
                  console.log("download", conversation.id);
                }}
              >
                <Download size={15} />
              </button>
            </span>
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
                onRequestBoth={handleTranscribeAndAnalyze}
              />
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Cancel>Cerrar</Modal.Cancel>
        </Modal.Footer>
      </Modal.Content>

      <RetranscriptionConfirmModal
        isOpen={showRetranscriptionConfirm}
        onClose={() => setShowRetranscriptionConfirm(false)}
        onConfirm={confirmRetranscription}
      />
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
  /* Empty states · single-column centered pattern. Title → description
     → CTA → cost cue. The skeleton-preview split was decorative — it
     never told the supervisor anything they didn't already know. */
  if (isProcessing) {
    return (
      <ProcessingState
        title="Transcribiendo"
        caption="Procesa el audio y separa los hablantes. Tarda unos segundos."
      />
    );
  }

  if (!conversation.hasRecording && conversation.channel === "llamada") {
    return (
      <TerminalNote
        icon={<FileX size={24} strokeWidth={1.5} />}
        title="No hay grabación de esta llamada"
        description="Sin audio no podemos transcribir. Revisa las reglas de grabación si esperabas que se hubiera guardado."
      />
    );
  }

  if (!conversation.hasTranscription) {
    return (
      <DecisionState
        icon={<FileText size={24} strokeWidth={1.5} />}
        title="Sin transcripción"
        description="Genera el texto para buscar dentro de la conversación y dejar el análisis disponible."
        action={{
          label: requesting ? "Solicitando…" : "Transcribir",
          icon: requesting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileText size={14} />
          ),
          onClick: onRequest,
          disabled: requesting,
        }}
        cost="Genera coste · ~30 s"
      />
    );
  }

  if (!conversation.transcription || conversation.transcription.length === 0) {
    return (
      <TerminalNote
        icon={<FileText size={24} strokeWidth={1.5} />}
        title="Transcripción vacía"
        description="El procesado terminó sin extraer líneas. Suele pasar con audios muy cortos o con silencios largos."
      />
    );
  }

  /* Active transcription ───────────────────────────────────── */
  return (
    <>
      <div className="flex items-center justify-between gap-[var(--sc-space-300)] px-[var(--sc-space-600)] py-[var(--sc-space-300)]">
        <span className="text-sc-sm text-sc-muted">
          <span className="tabular-nums">{lines.length}</span>{" "}
          {lines.length === 1 ? "intervención" : "intervenciones"}
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
  onRequestBoth,
}: {
  conversation: Conversation;
  canRequest: boolean;
  requesting: boolean;
  isAnalyzing: boolean;
  onRequest: () => void;
  /** Combined CTA used when there's no transcription yet — triggers
   *  transcription, then chains the analysis request once the
   *  transcription mutation has landed (~6.5 s later). */
  onRequestBoth: () => void;
}) {
  if (isAnalyzing && !conversation.hasAnalysis) {
    return (
      <ProcessingState
        title="Analizando"
        caption="Genera resumen y sentimiento a partir de la transcripción."
      />
    );
  }

  if (!conversation.hasAnalysis) {
    if (!canRequest) {
      // Dead-end fix: the analysis depends on transcription, but the
      // user landed on this tab without one. The CTA performs BOTH
      // steps in sequence (transcribe → analyze) so they don't have to
      // bounce to the other tab and click again.
      return (
        <DecisionState
          icon={<Sparkles size={24} strokeWidth={1.5} />}
          title="Pendiente de transcribir y analizar"
          description="El análisis necesita texto. Lanzamos la transcripción y, en cuanto termine, generamos resumen y sentimiento."
          action={{
            label: requesting ? "Procesando…" : "Transcribir y analizar",
            icon: requesting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            ),
            onClick: onRequestBoth,
            disabled: requesting,
          }}
          cost="Genera coste · transcripción + análisis"
        />
      );
    }
    return (
      <DecisionState
        icon={<Sparkles size={24} strokeWidth={1.5} />}
        title="Lista para analizar"
        description="Resumen accionable y valoración de sentimiento sobre la transcripción existente."
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
        cost="Genera coste · ~10 s"
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
          /* AlignLeft (líneas de texto) reserved for "this section
             contains a body of text". Sparkles is reserved exclusively
             for the "Generado por IA" pill aside. One icon = one
             meaning across the app. */
          icon={<AlignLeft size={13} />}
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
   DecisionState · single-column centered empty state. Icon → title →
   description → CTA → cost cue. Sibling of TerminalNote and
   ProcessingState; same vertical rhythm so the three empty surfaces
   feel like one family.
   ───────────────────────────────────────────────────────────────── */

function DecisionState({
  icon,
  title,
  description,
  action,
  cost,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  };
  cost?: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[var(--sc-space-400)] px-[var(--sc-space-600)] py-[var(--sc-space-500)] text-center">
      {icon && <span className="text-sc-muted">{icon}</span>}
      <div className="flex flex-col gap-[var(--sc-space-200)]">
        <h3 className="text-sc-md font-semibold leading-[var(--sc-line-height-md)] text-sc-heading">
          {title}
        </h3>
        <p className="max-w-[44ch] text-sc-sm leading-[18px] text-sc-body">
          {description}
        </p>
      </div>
      <div className="flex flex-col items-center gap-[var(--sc-space-200)]">
        <button
          type="button"
          onClick={action.onClick}
          disabled={action.disabled}
          style={{ fontSize: "var(--sc-font-size-sm)" }}
          className={cn(
            /* min-w-[200px] reserves enough width for the longest
               label variant ("Transcribir y analizar") so the button
               doesn't shrink when label switches to "Procesando…". */
            "inline-flex min-w-[200px] items-center justify-center gap-2 rounded-sc-md bg-sc-primary px-4 py-2 shadow-sc-sm",
            "font-medium text-sc-on-primary transition-all",
            "hover:bg-sc-primary-hover",
            "active:scale-[0.98] disabled:active:scale-100",
            "disabled:cursor-not-allowed disabled:opacity-60",
            FOCUS_RING,
          )}
        >
          {action.icon}
          {action.label}
        </button>
        {cost && (
          <span className="inline-flex items-center gap-1.5 text-sc-xs text-sc-cost-warn">
            <span aria-hidden className="size-1 rounded-full bg-sc-cost-warn" />
            {cost}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ProcessingState · centered status while a request is in-flight.
   Spinner + title + caption. No skeleton — the title carries the
   meaning and the modal already has a small footprint.
   ───────────────────────────────────────────────────────────────── */

function ProcessingState({
  title,
  caption,
}: {
  title: string;
  caption: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[var(--sc-space-300)] px-[var(--sc-space-600)] py-[var(--sc-space-500)] text-center">
      <Loader2
        size={24}
        strokeWidth={1.75}
        className="animate-spin text-sc-accent-strong"
      />
      <div className="flex flex-col gap-[var(--sc-space-200)]">
        <h3 className="text-sc-md font-semibold leading-[var(--sc-line-height-md)] text-sc-heading">
          {title}
        </h3>
        <p className="max-w-[44ch] text-sc-sm leading-[18px] text-sc-body">
          {caption}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TerminalNote · "no hay nada que hacer aquí". Centered text-only
   message used for terminal states ("no hay grabación",
   "transcripción vacía"). No skeleton, no action.
   ───────────────────────────────────────────────────────────────── */

function TerminalNote({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[var(--sc-space-200)] px-[var(--sc-space-600)] py-[var(--sc-space-500)] text-center">
      <span className="text-sc-muted">{icon}</span>
      <h3 className="text-sc-md font-medium leading-[var(--sc-line-height-md)] text-sc-heading">
        {title}
      </h3>
      <p className="max-w-[42ch] text-sc-sm leading-[18px] text-sc-body">
        {description}
      </p>
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
