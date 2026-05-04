import { Play } from "lucide-react";

import { cn } from "./ui/utils";
import { FOCUS_RING } from "./ui/focus";
import { Recording } from "../data/mockData";

interface RecordingTimelineProps {
  recordings: Recording[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * RecordingTimeline · multi-recording selector for conversations
 * that went through IVR transfers. Replaces the dropdown picker:
 * recordings are visible inline as horizontal cards above the audio
 * bar. Each card shows the leg number, label, duration and a
 * relative-length bar so the supervisor reads the rhythm of the
 * conversation at a glance.
 *
 * For ≥ 5 recordings the rail scrolls horizontally inside its own
 * container — never wraps to a second row.
 */
export function RecordingTimeline({
  recordings,
  selectedId,
  onSelect,
}: RecordingTimelineProps) {
  const longest = Math.max(
    ...recordings.map((r) => parseDurationSec(r.duration)),
    1,
  );
  const selectedIdx = Math.max(
    recordings.findIndex((r) => r.id === selectedId),
    0,
  );

  return (
    <section
      aria-label="Tramos de la conversación"
      className="flex flex-col gap-[var(--sc-space-300)] border-b border-sc-border-soft bg-sc-surface px-[var(--sc-space-600)] pb-[var(--sc-space-300)] pt-[var(--sc-space-400)]"
    >
      {/* Header — count + IVR context + which leg is playing */}
      <div className="flex items-baseline justify-between gap-[var(--sc-space-300)]">
        <h2 className="text-sc-sm font-semibold leading-[var(--sc-line-height-body2)] text-sc-heading">
          {recordings.length} grabaciones
          <span className="ml-1.5 font-normal text-sc-muted">
            · transferencias entre grupos vía IVR
          </span>
        </h2>
        <span className="text-sc-xs tabular-nums text-sc-muted">
          Reproduciendo{" "}
          <span className="font-medium text-sc-heading">{selectedIdx + 1}</span>{" "}
          de {recordings.length}
        </span>
      </div>

      {/* Cards rail — horizontally scrollable for 5+ items */}
      <div
        role="radiogroup"
        aria-label="Selecciona un tramo"
        className="modal-scrollbar -mx-1 flex gap-[var(--sc-space-200)] overflow-x-auto px-1 pb-1"
      >
        {recordings.map((rec, idx) => (
          <RecordingCard
            key={rec.id}
            recording={rec}
            index={idx}
            isSelected={rec.id === selectedId}
            relativeWidth={parseDurationSec(rec.duration) / longest}
            onSelect={() => onSelect(rec.id)}
          />
        ))}
      </div>
    </section>
  );
}

function RecordingCard({
  recording,
  index,
  isSelected,
  relativeWidth,
  onSelect,
}: {
  recording: Recording;
  index: number;
  isSelected: boolean;
  relativeWidth: number;
  onSelect: () => void;
}) {
  const label = recording.label ?? `Grabación ${index + 1}`;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={`Tramo ${index + 1}: ${label}, ${recording.duration}, comienza a las ${recording.startTime}`}
      onClick={onSelect}
      className={cn(
        "group relative flex w-[148px] shrink-0 cursor-pointer flex-col gap-[var(--sc-space-150)] rounded-sc-md border px-[var(--sc-space-300)] py-[var(--sc-space-200)] text-left transition-all",
        isSelected
          ? "border-sc-info-strong bg-sc-info-soft shadow-sc-sm"
          : "border-sc-border bg-sc-surface hover:border-sc-info-strong/40 hover:bg-sc-surface-muted hover:shadow-sc-sm",
        FOCUS_RING,
      )}
    >
      {/* Top row — Tramo N (uppercase) + selected/hover play indicator */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-sc-xs font-semibold uppercase tracking-wide tabular-nums",
            isSelected ? "text-sc-info-strong" : "text-sc-muted",
          )}
        >
          Tramo {index + 1}
        </span>
        {isSelected ? (
          <span
            aria-hidden
            className="flex size-4 items-center justify-center rounded-full bg-sc-info-strong text-white"
          >
            <Play size={8} strokeWidth={3} className="ml-px" />
          </span>
        ) : (
          <Play
            size={11}
            strokeWidth={2}
            aria-hidden
            className="text-sc-muted opacity-0 transition-opacity group-hover:opacity-100"
          />
        )}
      </div>

      {/* Label — the leg's group/IVR step */}
      <p
        className={cn(
          "truncate text-sc-sm font-medium leading-tight",
          isSelected ? "text-sc-heading" : "text-sc-body",
        )}
      >
        {label}
      </p>

      {/* Duration bar (relative width) + duration text */}
      <div className="flex items-center gap-[var(--sc-space-200)]">
        <span
          aria-hidden
          className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-sc-border-soft"
        >
          <span
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all",
              isSelected ? "bg-sc-info-strong" : "bg-sc-border",
            )}
            style={{ width: `${Math.max(8, relativeWidth * 100)}%` }}
          />
        </span>
        <span className="font-mono text-sc-xs tabular-nums text-sc-muted">
          {recording.duration}
        </span>
      </div>
    </button>
  );
}

function parseDurationSec(d: string): number {
  const parts = d.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}
