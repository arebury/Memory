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
 * Layout (v26): 720×200 body, two equal cells split by a hairline
 * divider. Both cells share `padding-top` so labels "TOTAL A PROCESAR"
 * and "ANÁLISIS" sit on the same baseline. Below each label, a flex-1
 * wrapper centers the cell's main content vertically. Hero number is
 * 88px; on toggle the hero and the caption pulse together (same
 * `animate-sc-pulse`). Caption is muted gray when toggle OFF, teal
 * accent only when ON.
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
      // Clear any leftover delta flash from a previous open. The
      // CSS animation isn't `forwards` so a stale flash element keeps
      // rendering in DOM until next toggle. Resetting on open prevents
      // ghost "+N" deltas next time the modal mounts.
      setFlash(null);
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
  // Subtitle: tell the supervisor what we ARE going to act on, with a
  // delta cue if some of their selection isn't actionable. Avoids the
  // mismatch between "5 seleccionadas" up here and "3" in the hero.
  const nCalls = selectedConversations.filter((c) => c.channel === "llamada").length;
  const nChats = nSel - nCalls;
  const subtitle = (() => {
    if (nSel === 0) return "Sin selección";
    const breakdownBits: string[] = [];
    if (nCalls > 0) breakdownBits.push(`${nCalls} ${nCalls === 1 ? "llamada" : "llamadas"}`);
    if (nChats > 0) breakdownBits.push(`${nChats} ${nChats === 1 ? "chat" : "chats"}`);
    const breakdown = breakdownBits.join(", ");
    const head = nSel === 1
      ? "1 conversación seleccionada"
      : `${nSel} conversaciones seleccionadas`;
    return breakdown && (nCalls > 0 && nChats > 0) ? `${head} · ${breakdown}` : head;
  })();
  // Optional delta line under the hero number when not everything in
  // the selection ends up being processed (typical case: chats can't
  // be transcribed, so they drop out of nTrans/heroCount).
  const heroDeltaHint =
    !isAllProcessed && heroCount !== nSel
      ? `de ${nSel} ${nSel === 1 ? "seleccionada" : "seleccionadas"}`
      : null;

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
          subtitle={subtitle}
        />

        <Modal.Body className="!p-0">
          {/* Body frame: 720×200, two equal cells split by a hairline
              divider. Both cells use `justify-start` with the same
              padding-top so labels share a baseline. The remaining
              vertical space below each label is owned by a flex-1
              wrapper that centers the cell's main content vertically. */}
          <div className="flex h-[var(--sc-bulk-cell-height)] w-full">
            {/* ── Hero cell · Total a procesar ── */}
            <section
              className="flex flex-1 flex-col items-start border-r border-[var(--sc-bulk-divider-color)]"
              style={{
                padding: `var(--sc-bulk-cell-padding-top) var(--sc-bulk-cell-padding-x) var(--sc-bulk-cell-padding-bottom)`,
              }}
            >
              <span className="text-sc-base font-bold uppercase leading-[var(--sc-line-height-body2)] text-sc-body">
                Total a procesar
              </span>
              <div className="relative flex w-full flex-1 flex-col justify-center gap-1">
                <div className="flex items-baseline gap-[var(--sc-space-300)]">
                  <span
                    key={bumpKey}
                    /* font-size + line-height applied via `style` to bypass
                       tailwind-merge: it groups `text-sc-display` (font-size)
                       and `text-sc-emphasis` (color) under the same `text-*`
                       bucket and silently drops the first. */
                    style={{
                      fontSize: "var(--sc-font-size-display)",
                      lineHeight: "var(--sc-line-height-display)",
                    }}
                    className={cn(
                      "relative inline-block font-semibold tabular-nums text-sc-emphasis",
                      bumpKey > 0 && "animate-sc-pulse",
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
                  {/* Cost cue: always reserves a single body line so
                      flipping `isAllProcessed` (e.g. transcribing
                      everything mid-modal) doesn't shift the layout.
                      When all is done, the slot stays but stays empty. */}
                  <span
                    aria-hidden={isAllProcessed}
                    className={cn(
                      "min-h-[var(--sc-line-height-body2)] text-sc-base font-normal leading-[var(--sc-line-height-body2)] transition-opacity duration-200",
                      isAllProcessed
                        ? "opacity-0 text-sc-cost-warn"
                        : "opacity-100 text-sc-cost-warn",
                    )}
                  >
                    genera coste
                  </span>
                </div>
                {/* Delta hint slot — always renders to reserve a single
                    line; content swaps based on whether the hero
                    differs from the selection size. Toggling the
                    "Incluir análisis" switch flips this content but
                    can't shift the layout. */}
                <span className="min-h-[var(--sc-line-height-body2)] text-sc-xs leading-[var(--sc-line-height-body2)] text-sc-muted">
                  {heroDeltaHint ?? " "}
                </span>
              </div>
            </section>

            {/* ── Decision cell · Análisis ──
                Mirror layout to hero: label at top (same padding-top),
                rest of the content centered in the remaining space.
                Inside that center block, the Title+switch row sits above
                the Caption with a 12px gap. */}
            <section
              key={shakeKey}
              className={cn(
                "flex flex-1 flex-col items-stretch",
                shakeKey > 0 && "animate-sc-shake",
              )}
              style={{
                padding: `var(--sc-bulk-cell-padding-top) var(--sc-bulk-cell-padding-x) var(--sc-bulk-cell-padding-bottom)`,
              }}
            >
              <span className="text-sc-base font-bold uppercase leading-[var(--sc-line-height-body2)] text-sc-body">
                Análisis
              </span>
              <div className="flex w-full flex-1 flex-col justify-center gap-[var(--sc-bulk-decision-caption-gap)]">
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

                {/* Caption — muted gray when toggle OFF / disabled,
                    teal accent only when toggle ON. Reserves a single
                    body line so it never collapses in C1. */}
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
                          "inline-block tabular-nums font-normal transition-colors duration-200",
                          toggleOn ? "text-sc-accent-strong" : "text-sc-muted",
                          pulseKey > 0 && "animate-sc-pulse",
                        )}
                      >
                        {nTrans + nAnBase}
                      </span>
                      <span
                        key={`pred-${pulseKey}`}
                        className={cn(
                          "inline-block font-normal transition-colors duration-200",
                          toggleOn ? "text-sc-accent-strong" : "text-sc-muted",
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
          {/* Pre-submit the dismiss action is just "Cerrar" (we have
              nothing to cancel yet). While `isLoading` we keep the
              same button disabled — the SC modal already blocks
              outside-click and ESC during loading. */}
          <Modal.Cancel disabled={isLoading}>Cerrar</Modal.Cancel>
          <Modal.Action
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="min-w-[120px] transition-transform active:scale-[0.98] disabled:active:scale-100"
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
