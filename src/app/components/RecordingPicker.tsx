import { ChevronDown, Phone, Play } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "./ui/utils";
import { Recording } from "../data/mockData";

interface RecordingPickerProps {
  recordings: Recording[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * RecordingPicker · multi-recording selector for conversations that
 * went through IVR transfers. Visually matches Figma DS file
 * `Dle87qs0Pjq0OjIaaCfmm7` (toast vecindad) — dark popover with badge
 * count + chevron trigger, recording rows with play icon + start time
 * + duration + leg label.
 *
 * Scrolls internally past 4 visible items (Figma altura máxima).
 */
export function RecordingPicker({
  recordings,
  selectedId,
  onSelect,
}: RecordingPickerProps) {
  const total = recordings.length;
  const selected =
    recordings.find((r) => r.id === selectedId) ?? recordings[0];
  const selectedIdx = recordings.findIndex((r) => r.id === selected.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Grabación ${selectedIdx + 1} de ${total}`}
          className={cn(
            "flex items-center gap-2 rounded-sc-md border border-sc-border bg-sc-surface px-3 py-1.5 text-sc-sm transition-colors",
            "cursor-pointer hover:bg-sc-border-soft",
          )}
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-sc-info-strong text-[10px] font-semibold leading-none tabular-nums text-white">
            {total}
          </span>
          <Phone size={14} className="text-sc-muted" strokeWidth={1.75} />
          <span className="font-medium text-sc-heading">
            Grabación {selectedIdx + 1}
          </span>
          {selected.label && (
            <span className="text-sc-muted">· {selected.label}</span>
          )}
          <span className="tabular-nums text-sc-muted">
            · {selected.duration}
          </span>
          <ChevronDown size={14} className="text-sc-muted" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className={cn(
          // Dark popover per Figma — overrides the default light dropdown surface.
          "w-[320px] max-h-[280px] overflow-y-auto p-1",
          "border-0 bg-[#3C434D] text-white shadow-sc-popover",
        )}
      >
        {recordings.map((rec, idx) => {
          const isSelected = rec.id === selected.id;
          return (
            <DropdownMenuItem
              key={rec.id}
              onSelect={() => onSelect(rec.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-sc-sm px-2 py-2 focus:bg-white/10",
                isSelected && "bg-white/10",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-sc-md bg-white text-sc-heading",
                  "transition-transform group-hover:scale-105",
                )}
              >
                <Play size={12} strokeWidth={2} />
              </span>
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <p className="truncate text-sc-sm font-medium leading-tight text-white">
                  {idx + 1}. {rec.label ?? `Grabación ${idx + 1}`}
                </p>
                <p className="text-xs leading-tight tabular-nums text-white/65">
                  Hora: {rec.startTime} · Duración: {rec.duration}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
