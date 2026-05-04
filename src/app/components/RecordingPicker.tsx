import { cn } from "./ui/utils";
import { FOCUS_RING } from "./ui/focus";
import { Recording } from "../data/mockData";

interface RecordingTimelineProps {
  recordings: Recording[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * RecordingTimeline · single proportional strip showing the legs of
 * a multi-recording conversation. Each segment's width is the leg's
 * share of total duration, so the supervisor reads the rhythm of the
 * call (which leg dominates) from the geometry alone — no badges,
 * no cards, no relative-bar nested inside a card.
 *
 * Replaced the cards-rail in 15.29 because the cards encoded "Tramo N"
 * + label + relative bar + duration text per item — four signals for
 * three pieces of info, and three identical-sized cards hid the very
 * thing the rail was supposed to reveal (which leg is the longest).
 * One bar partitioned by duration says it without text.
 *
 * Each segment is a `role="radio"` inside a `role="radiogroup"`. Arrow
 * keys move + select (radiogroup convention). Active segment uses
 * `bg-sc-info-soft` + `text-sc-info-strong`; inactive ones rely on
 * label color and duration color contrast. No play icon — the bg
 * change carries the signal already, the icon would be ornament.
 */
export function RecordingTimeline({
  recordings,
  selectedId,
  onSelect,
}: RecordingTimelineProps) {
  const durations = recordings.map((r) => parseDurationSec(r.duration));
  const total = durations.reduce((a, b) => a + b, 0) || 1;

  const moveSelection = (fromIdx: number, dir: -1 | 1) => {
    const next = fromIdx + dir;
    if (next < 0 || next >= recordings.length) return;
    onSelect(recordings[next].id);
  };

  return (
    <section
      aria-label="Tramos de la conversación"
      className="border-b border-sc-border-soft bg-sc-surface px-[var(--sc-space-600)] py-[var(--sc-space-400)]"
    >
      <div
        role="radiogroup"
        aria-label="Selecciona un tramo"
        className="flex h-[56px] w-full overflow-hidden rounded-sc-md border border-sc-border bg-sc-surface"
      >
        {recordings.map((rec, idx) => (
          <RecordingSegment
            key={rec.id}
            recording={rec}
            index={idx}
            isSelected={rec.id === selectedId}
            fraction={durations[idx] / total}
            isLast={idx === recordings.length - 1}
            onSelect={() => onSelect(rec.id)}
            onArrowNav={(dir) => moveSelection(idx, dir)}
          />
        ))}
      </div>
    </section>
  );
}

function RecordingSegment({
  recording,
  index,
  isSelected,
  fraction,
  isLast,
  onSelect,
  onArrowNav,
}: {
  recording: Recording;
  index: number;
  isSelected: boolean;
  fraction: number;
  isLast: boolean;
  onSelect: () => void;
  onArrowNav: (dir: -1 | 1) => void;
}) {
  const label = recording.label ?? `Grabación ${index + 1}`;
  /* Below ~12% of total width the label gets cut to a useless 3-4
     chars. Fall back to just the index number; the full label still
     surfaces via tooltip and aria-label so the info isn't lost. */
  const showLabel = fraction >= 0.12;

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      onArrowNav(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      onArrowNav(-1);
    }
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`Tramo ${index + 1}: ${label}, ${recording.duration}, comienza a las ${recording.startTime}`}
      title={showLabel ? undefined : label}
      onClick={onSelect}
      onKeyDown={handleKey}
      tabIndex={isSelected ? 0 : -1}
      style={{ flexGrow: fraction, flexBasis: 0, minWidth: 56 }}
      className={cn(
        "group relative flex min-w-0 cursor-pointer flex-col items-start justify-center gap-[var(--sc-space-200)]",
        "px-[var(--sc-space-300)] py-[var(--sc-space-200)] text-left transition-colors",
        !isLast && "border-r border-sc-border",
        isSelected
          ? "bg-sc-info-soft"
          : "bg-sc-surface hover:bg-sc-surface-muted",
        FOCUS_RING,
      )}
    >
      {showLabel ? (
        <span
          className={cn(
            "w-full truncate text-sc-sm font-medium leading-tight",
            isSelected ? "text-sc-info-strong" : "text-sc-heading",
          )}
        >
          {label}
        </span>
      ) : (
        <span
          className={cn(
            "text-sc-sm font-semibold tabular-nums",
            isSelected ? "text-sc-info-strong" : "text-sc-heading",
          )}
        >
          {index + 1}
        </span>
      )}
      <span
        className={cn(
          "font-mono text-sc-xs tabular-nums",
          isSelected ? "text-sc-info-strong/80" : "text-sc-muted",
        )}
      >
        {recording.duration}
      </span>
    </button>
  );
}

function parseDurationSec(d: string): number {
  const parts = d.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}
