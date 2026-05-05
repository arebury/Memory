import { Play, Pause, RotateCcw, RotateCw } from "lucide-react";

import { cn } from "./ui/utils";
import { FOCUS_RING } from "./ui/focus";
import { Recording } from "../data/mockData";

interface MultiRecordingPlayerProps {
  recordings: Recording[];
  selectedId: string;
  onSelectRecording: (id: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  totalDuration: number;
  onSeek: (t: number) => void;
  playerEnabled: boolean;
}

/**
 * MultiRecordingPlayer · single audio surface for calls split across N legs.
 *
 * Replaces the (RecordingTimeline strip + standalone audio bar) pair. Three
 * stacked rows in one bordered surface so the supervisor reads transport,
 * progress and leg context as one thing:
 *
 *   1. Transport (back10 · play · fwd10) + cumulative time of the active leg.
 *   2. A single horizontal bar partitioned proportionally by leg duration.
 *      Active segment carries the progress fill + playhead; clicking inside
 *      it seeks within the leg. Inactive segments are visual-only — leg
 *      switching happens via the labels row below to keep the bar
 *      semantics single-purpose.
 *   3. Leg labels aligned with segment widths. Active label is colored
 *      `text-sc-info-strong`; arrow keys navigate + select the radiogroup.
 *
 * Geometry-from-15.29 preserved (proportional widths). The label-truncation
 * problem is solved by lifting labels OUT of the bar so each label has its
 * full segment width plus vertical room — no more "IV…" / "C…".
 */
export function MultiRecordingPlayer({
  recordings,
  selectedId,
  onSelectRecording,
  isPlaying,
  onTogglePlay,
  currentTime,
  totalDuration,
  onSeek,
  playerEnabled,
}: MultiRecordingPlayerProps) {
  const durations = recordings.map((r) => parseDurationSec(r.duration));
  const total = durations.reduce((a, b) => a + b, 0) || 1;
  const fractions = durations.map((d) => d / total);

  const selectedIndex = Math.max(
    0,
    recordings.findIndex((r) => r.id === selectedId),
  );

  // Cumulative left% for the active segment within the bar. Used both to
  // place the seek-overlay and to drive the global playhead position.
  const activeLeftPct = fractions
    .slice(0, selectedIndex)
    .reduce((a, b) => a + b, 0) * 100;
  const activeWidthPct = fractions[selectedIndex] * 100;
  const progressFracInSeg =
    totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;
  const playheadPct = activeLeftPct + activeWidthPct * progressFracInSeg;

  const moveSelection = (fromIdx: number, dir: -1 | 1) => {
    const next = fromIdx + dir;
    if (next < 0 || next >= recordings.length) return;
    onSelectRecording(recordings[next].id);
  };

  return (
    <section
      aria-label="Reproductor multi-tramo"
      className="flex flex-col gap-[var(--sc-space-300)] border-b border-sc-border-soft bg-sc-surface-muted px-[var(--sc-space-600)] py-[var(--sc-space-400)]"
    >
      {/* ── Row 1 · transport + cumulative time of the active leg ── */}
      <div className="flex items-center gap-[var(--sc-space-300)]">
        <button
          type="button"
          onClick={() => onSeek(currentTime - 10)}
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
          onClick={onTogglePlay}
          disabled={!playerEnabled}
          className={cn(
            "flex size-10 cursor-pointer items-center justify-center rounded-full bg-sc-primary text-sc-on-primary shadow-sc-sm transition-colors",
            "hover:bg-sc-primary-hover active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40",
            FOCUS_RING,
          )}
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onSeek(currentTime + 10)}
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

        <span className="ml-auto font-mono text-sc-sm tabular-nums text-sc-body">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
      </div>

      {/* ── Row 2 · segmented bar + active scrub overlay + playhead ── */}
      <div className="relative h-3 w-full">
        {/* Bar visual: rounded-full clip, segments inside divided by hairlines.
            The clip lives on the inner div so the playhead (rendered in the
            relative wrapper above this) stays visible above the rounded edge. */}
        <div className="absolute inset-x-0 top-1/2 flex h-1.5 -translate-y-1/2 overflow-hidden rounded-full">
          {recordings.map((rec, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <div
                key={rec.id}
                style={{ flexGrow: fractions[idx], flexBasis: 0 }}
                className={cn(
                  "relative h-full",
                  idx > 0 && "border-l-2 border-sc-surface-muted",
                  isActive ? "bg-sc-info-soft" : "bg-sc-border-soft",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 origin-left bg-sc-accent transition-[width] duration-150 will-change-[width]"
                    style={{ width: `${progressFracInSeg * 100}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Click-to-seek overlay · only spans the active segment area. The
            larger 12px-tall hit target sits above the 6px visible bar. */}
        <button
          type="button"
          role="slider"
          aria-label="Buscar posición en el tramo activo"
          aria-valuemin={0}
          aria-valuemax={totalDuration}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={formatTime(currentTime)}
          disabled={!playerEnabled}
          tabIndex={playerEnabled ? 0 : -1}
          onClick={(e) => {
            if (!playerEnabled) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const fracInSeg = (e.clientX - rect.left) / rect.width;
            onSeek(Math.max(0, Math.min(1, fracInSeg)) * totalDuration);
          }}
          style={{ left: `${activeLeftPct}%`, width: `${activeWidthPct}%` }}
          className={cn(
            "absolute inset-y-0 cursor-pointer rounded-full",
            "disabled:cursor-not-allowed disabled:opacity-50",
            FOCUS_RING,
          )}
        />

        {/* Playhead · positioned globally, visible only when active leg is
            playable. opacity bumps to 1 when playing or hovered, mirroring the
            single-leg player's behaviour. */}
        {playerEnabled && (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sc-accent shadow-sc-sm transition-opacity",
              isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
            style={{ left: `${playheadPct}%` }}
          />
        )}
      </div>

      {/* ── Row 3 · labels aligned with segments (radiogroup, full-width) ── */}
      <div
        role="radiogroup"
        aria-label="Selecciona un tramo"
        className="flex w-full gap-[var(--sc-space-100)]"
      >
        {recordings.map((rec, idx) => {
          const isActive = idx === selectedIndex;
          const label = rec.label ?? `Grabación ${idx + 1}`;
          return (
            <button
              key={rec.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`Tramo ${idx + 1}: ${label}, ${rec.duration}, comienza a las ${rec.startTime}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => {
                if (!isActive) onSelectRecording(rec.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  moveSelection(idx, 1);
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  moveSelection(idx, -1);
                }
              }}
              title={label}
              style={{ flexGrow: fractions[idx], flexBasis: 0, minWidth: 48 }}
              className={cn(
                "flex min-w-0 cursor-pointer flex-col items-start gap-[2px] rounded-sc-sm px-[var(--sc-space-200)] py-[var(--sc-space-100)] text-left transition-colors",
                isActive
                  ? "bg-sc-info-soft/60"
                  : "hover:bg-sc-surface",
                FOCUS_RING,
              )}
            >
              <span
                className={cn(
                  "w-full truncate text-sc-sm font-medium leading-tight transition-colors",
                  isActive ? "text-sc-info-strong" : "text-sc-heading",
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  "font-mono text-sc-xs tabular-nums transition-colors",
                  isActive ? "text-sc-info-strong/80" : "text-sc-muted",
                )}
              >
                {rec.duration}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function parseDurationSec(d: string): number {
  const parts = d.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatTime(s: number): string {
  const safe = Math.max(0, Math.floor(s));
  const m = Math.floor(safe / 60).toString().padStart(2, "0");
  const sec = (safe % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}
