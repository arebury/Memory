import { useEffect, useMemo, useRef, useState } from "react";
import { AlignLeft, Loader2 } from "lucide-react";

import { Switch } from "./ui/switch";
import { Modal } from "./ui/modal";
import { cn } from "./ui/utils";
import { Conversation } from "../data/mockData";

interface BulkTranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedConversations: Conversation[];
  onConfirm: (
    options: { includeAnalysis: boolean },
    eligibleIds: string[],
  ) => Promise<void>;
}

/**
 * BulkTranscriptionModal · v26 (Figma 297:2559 compact body)
 *
 * Body taxonomy (replaces v11's 3-destination breakdown):
 *
 *   nTrans   = readyToTranscribe       (calls with recording, no transcription)
 *   call_ea  = eligibleForAnalysisCalls (calls already transcribed, no analysis)
 *   chat_ea  = eligibleForAnalysisChats (chats with no analysis)
 *   ap       = alreadyAnalyzed          (calls + chats already done — skipped)
 *
 *   heroCount = on ? (nTrans + call_ea + chat_ea) : nTrans
 *
 *   6 cases driven by which counters are non-zero:
 *     C1  all zero except ap   → toggle disabled, "todo procesado"
 *     C2  call_ea>0 only       → toggle default-on (only-analysis)
 *     C3  nTrans>0 only        → toggle default-off (transcribe only)
 *     C4  nTrans>0, call_ea>0  → toggle default-off (mix calls)
 *     C5  chat_ea>0 only       → toggle default-on (only-analysis chats)
 *     C6  nTrans>0, ea>0       → toggle default-off (mix all)
 *
 * Layout (v26): 720×100 body, two equal cells, no internal divider.
 * Left = hero number + cost tag. Right = nested Decision (Label / Title+
 * switch row / Caption) with 24/12 nested gaps. Footer reuses Modal.Cancel
 * / Modal.Action from the SC design system.
 */
export function BulkTranscriptionModal({
  isOpen,
  onClose,
  selectedConversations,
  onConfirm,
}: BulkTranscriptionModalProps) {
  /* ── Counters derived from selection ──────────────────────────── */
  const counters = useMemo(() => {
    const calls = selectedConversations.filter((c) => c.channel === "llamada");
    const chats = selectedConversations.filter((c) => c.channel === "chat");

    const readyToTranscribe = calls.filter(
      (c) => c.hasRecording && !c.hasTranscription,
    );
    const callsTranscribed = calls.filter((c) => c.hasTranscription);
    const callEa = callsTranscribed.filter((c) => !c.hasAnalysis);
    const chatEa = chats.filter((c) => !c.hasAnalysis);

    return {
      readyToTranscribe,
      callEa,
      chatEa,
      nTrans: readyToTranscribe.length,
      nAnBase: callEa.length + chatEa.length,
      nSel: selectedConversations.length,
    };
  }, [selectedConversations]);

  const { readyToTranscribe, callEa, chatEa, nTrans, nAnBase, nSel } = counters;

  /* ── Toggle state ─────────────────────────────────────────────── */
  // Default ON only when transcription is impossible (nTrans=0) and there
  // are conversations that can be analyzed. Else OFF (or disabled).
  const naturalDefault = (t: number, a: number) => t === 0 && a > 0;
  const [userOn, setUserOn] = useState(() => naturalDefault(nTrans, nAnBase));
  const [isLoading, setIsLoading] = useState(false);

  // Reset toggle to its natural default whenever the modal opens or the
  // selection changes. Selection compared by id list (not array identity)
  // to avoid pointless resets when the parent recreates the array.
  const lastSelKey = useRef<string>("");
  const wasOpen = useRef(false);
  useEffect(() => {
    const key = selectedConversations.map((c) => c.id).join(",");
    const justOpened = isOpen && !wasOpen.current;
    if (justOpened || key !== lastSelKey.current) {
      lastSelKey.current = key;
      setUserOn(naturalDefault(nTrans, nAnBase));
      setIsLoading(false);
    }
    wasOpen.current = isOpen;
  }, [isOpen, selectedConversations, nTrans, nAnBase]);

  /* ── Derived render-time values ───────────────────────────────── */
  const canAnalyze = nTrans + nAnBase > 0;       // false only in C1
  const toggleDisabled = !canAnalyze;
  const toggleOn = toggleDisabled ? false : userOn;
  const heroCount = toggleOn ? nTrans + nAnBase : nTrans;
  const canSubmit = heroCount > 0 && !isLoading;
  const isAllProcessed = !canAnalyze;            // pure C1 (heroCount = 0)

  /* ── Animation triggers ───────────────────────────────────────── */
  // Each "Key" is a counter that we increment to remount the animated
  // element via React's `key` prop, restarting the CSS animation cleanly.
  const [bumpKey, setBumpKey] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [flash, setFlash] = useState<{ delta: number; key: number } | null>(
    null,
  );

  // Bump the hero number whenever it changes — but only while the modal
  // is visible (avoid firing on initial mount or while closed).
  const prevHero = useRef(heroCount);
  useEffect(() => {
    if (!isOpen) {
      prevHero.current = heroCount;
      return;
    }
    if (prevHero.current !== heroCount) {
      prevHero.current = heroCount;
      setBumpKey((k) => k + 1);
    }
  }, [heroCount, isOpen]);

  const handleToggle = (next: boolean) => {
    if (toggleDisabled) {
      setShakeKey((k) => k + 1); // C1 nudge
      return;
    }
    const delta = (next ? 1 : -1) * nAnBase;
    if (delta !== 0) setFlash({ delta, key: Date.now() });
    setPulseKey((k) => k + 1);
    setUserOn(next);
  };

  /* ── Confirm ──────────────────────────────────────────────────── */
  const handleConfirm = async () => {
    if (!canSubmit) return;

    const eligibleIds = toggleOn
      ? [
          ...readyToTranscribe.map((c) => c.id),
          ...callEa.map((c) => c.id),
          ...chatEa.map((c) => c.id),
        ]
      : readyToTranscribe.map((c) => c.id);

    setIsLoading(true);
    try {
      await onConfirm({ includeAnalysis: toggleOn }, eligibleIds);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <Modal.Content
        width={720}
        showClose={!isLoading}
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
        onPointerDownOutside={(e) => isLoading && e.preventDefault()}
      >
        <Modal.Header
          icon={<AlignLeft className="size-full" strokeWidth={1.75} />}
          title="Procesar conversaciones"
          subtitle={
            nSel === 1
              ? "1 conversación seleccionada"
              : `${nSel} conversaciones seleccionadas`
          }
        />

        <Modal.Body className="!p-0">
          {/* Body frame: 720×200, two equal cells, no internal divider
              (per Figma node 289:682 description). Hero on left,
              Decision on right. Both cells justify-center their content. */}
          <div className="flex h-[var(--sc-bulk-cell-height)] w-full">
            {/* ── Hero cell · Total a procesar ── */}
            <section className="flex flex-1 flex-col items-start justify-center gap-[var(--sc-bulk-cell-gap)] px-[var(--sc-bulk-hero-padding-x)] py-[var(--sc-bulk-hero-padding-y)]">
              <span className="text-sc-base font-bold uppercase leading-[var(--sc-line-height-body2)] text-sc-body">
                Total a procesar
              </span>
              <div className="relative flex items-center gap-[var(--sc-space-300)]">
                <span
                  key={bumpKey}
                  className={cn(
                    "relative inline-block text-sc-display font-semibold leading-[var(--sc-line-height-display)] tabular-nums text-sc-emphasis",
                    bumpKey > 0 && "animate-sc-bump",
                  )}
                >
                  {heroCount}
                  {flash && flash.delta !== 0 && (
                    <span
                      key={flash.key}
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute left-full top-0 ml-2 text-sc-xl font-semibold tabular-nums",
                        "animate-sc-delta-fly",
                        flash.delta < 0
                          ? "text-sc-muted"
                          : "text-sc-accent-strong",
                      )}
                    >
                      {flash.delta > 0 ? "+" : ""}
                      {flash.delta}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-sc-base leading-[var(--sc-line-height-body2)] transition-colors duration-200",
                    isAllProcessed
                      ? "font-normal text-sc-muted"
                      : "font-normal text-sc-cost-warn",
                  )}
                >
                  {isAllProcessed ? "todo procesado" : "Genera coste"}
                </span>
              </div>
            </section>

            {/* ── Decision cell · Análisis ──
                Nested per Figma 297:2559:
                  Decision (flex col, justify-center, padding-x 24, padding-y 0)
                  └ Group A (flex col, gap 12 = decision-gap-outer)
                    ├ Group B (flex col, gap 24 = decision-gap-inner)
                    │   ├ Label "ANÁLISIS"
                    │   └ Title+switch row (justify-between)
                    └ Caption ("X admiten análisis", always teal) */}
            <section
              key={shakeKey}
              className={cn(
                "flex flex-1 flex-col items-stretch justify-center px-[var(--sc-bulk-decision-padding-x)] py-[var(--sc-bulk-decision-padding-y)]",
                shakeKey > 0 && "animate-sc-shake",
              )}
            >
              <div className="flex w-full flex-col gap-[var(--sc-bulk-decision-gap-outer)]">
                <div className="flex w-full flex-col gap-[var(--sc-bulk-decision-gap-inner)]">
                  <span className="text-sc-base font-bold uppercase leading-[var(--sc-line-height-body2)] text-sc-body">
                    Análisis
                  </span>
                  <div className="flex w-full items-center justify-between gap-[var(--sc-space-300)]">
                    <span
                      className={cn(
                        "text-sc-md font-semibold leading-[var(--sc-line-height-md)] transition-colors duration-200",
                        toggleOn ? "text-sc-heading" : "text-sc-disabled",
                      )}
                    >
                      Incluir análisis
                    </span>
                    <Switch
                      checked={toggleOn}
                      onCheckedChange={handleToggle}
                      disabled={toggleDisabled}
                      aria-label="Incluir análisis"
                      className="data-[state=checked]:bg-sc-accent-strong shrink-0"
                    />
                  </div>
                </div>

                {/* Caption — always teal accent (per Figma C3 spec).
                    Reserves a single body line so it never collapses
                    even in C1 (todo procesado). */}
                <div className="flex min-h-[var(--sc-line-height-body2)] flex-wrap items-baseline gap-[var(--sc-space-100)] text-sc-base leading-[var(--sc-line-height-body2)]">
                  {toggleDisabled ? (
                    <span className="font-normal text-sc-muted">
                      todo procesado
                    </span>
                  ) : (
                    <>
                      <span
                        key={`num-${pulseKey}`}
                        className={cn(
                          "inline-block tabular-nums font-normal text-sc-accent-strong transition-colors duration-200",
                          pulseKey > 0 && "animate-sc-pulse",
                        )}
                      >
                        {nTrans + nAnBase}
                      </span>
                      <span
                        key={`pred-${pulseKey}`}
                        className={cn(
                          "inline-block font-normal text-sc-accent-strong transition-colors duration-200",
                          pulseKey > 0 && "animate-sc-pulse",
                        )}
                      >
                        admiten análisis
                      </span>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Cancel disabled={isLoading}>Cancelar</Modal.Cancel>
          <Modal.Action
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Procesando…
              </>
            ) : (
              "Procesar"
            )}
          </Modal.Action>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
