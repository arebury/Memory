import { Filter } from "lucide-react";

import { cn } from "./ui/utils";
import { FOCUS_RING } from "./ui/focus";

interface TypeFilterButtonProps {
  isActive: boolean;
  hasActiveFilters: boolean;
  onClick: () => void;
}

/**
 * Trigger for the TypeFilterPanel dropdown. Three states:
 *   default       · neutral border + heading text + Filter icon
 *   isActive      · panel open · subtly tinted bg, no accent ring (the
 *                   panel itself is the focus signal)
 *   hasActiveFilters · accent-tinted border + soft accent bg + accent
 *                   text · plus a small dot in the corner so the filter
 *                   pressure is visible even when the panel is closed
 *
 * Updated 15.34: pre-DS hex codes replaced with `--sc-*` tokens, focus
 * ring shared with the rest of the app, lucide icon kept (no decorative
 * notification badge — a 6 px dot is enough).
 */
export function TypeFilterButton({
  isActive,
  hasActiveFilters,
  onClick,
}: TypeFilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={
        hasActiveFilters
          ? "Filtros de tipo y estado · activos"
          : "Filtros de tipo y estado"
      }
      className={cn(
        "relative inline-flex h-9 cursor-pointer items-center gap-[var(--sc-space-200)] rounded-sc-md border px-[var(--sc-space-400)]",
        "text-sc-sm font-medium transition-colors",
        FOCUS_RING,
        hasActiveFilters
          ? "border-sc-accent bg-sc-accent-soft text-sc-accent-strong hover:bg-sc-accent-soft/80"
          : isActive
            ? "border-sc-border-default bg-sc-bg-canvas text-sc-heading"
            : "border-sc-border-default bg-sc-surface text-sc-heading hover:bg-sc-bg-canvas",
      )}
    >
      <Filter
        size={15}
        className={hasActiveFilters ? "text-sc-accent-strong" : "text-sc-heading"}
      />
      Tipo
      {hasActiveFilters && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-sc-accent-strong"
        />
      )}
    </button>
  );
}
