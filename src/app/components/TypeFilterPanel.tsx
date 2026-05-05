import { motion } from "motion/react";

import { Checkbox } from "./ui/checkbox";
import { cn } from "./ui/utils";
import { FOCUS_RING } from "./ui/focus";

export interface TypeFilterPanelFilters {
  types: {
    interna: boolean;
    externa: boolean;
  };
  channels: {
    llamada: boolean;
    chat: boolean;
  };
  directions: {
    entrante: boolean;
    saliente: boolean;
  };
  rules: {
    recording: boolean;
    transcription: boolean;
    classification: boolean;
  };
  status: {
    onlyFailed: boolean;
  };
}

interface TypeFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TypeFilterPanelFilters;
  onFiltersChange: (filters: TypeFilterPanelFilters) => void;
}

/**
 * TypeFilterPanel · dropdown of grouped checkboxes for the conversations
 * table.
 *
 * Five sections, two visual blocks separated by a hairline divider:
 *   1. Tipo de conversación     ──┐
 *   2. Canal                       │  · "What kind of conversation"
 *   3. Dirección                 ──┘
 *
 *   ─── divider ───
 *
 *   4. Procesamiento aplicado   ──┐  · "What happened to it"
 *   5. Estado                   ──┘
 *
 * `status.onlyFailed` (15.34) is the new addition: until then, the failed
 * filter could only be activated via the toast action that fires when a
 * batch ends with errors. Once dismissed, the user had no way back. The
 * status section closes that loop.
 *
 * DS pass also done in 15.34 — the panel was the last big offender of
 * pre-token hex codes + emoji icons + Title-Case labels. Now: lowercase
 * body labels, UPPERCASE structural headers, lucide-friendly (no
 * decorative dots), `--sc-*` tokens throughout.
 */
export function TypeFilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: TypeFilterPanelProps) {
  const handleClearAll = () => {
    onFiltersChange({
      types: { interna: true, externa: true },
      channels: { llamada: true, chat: true },
      directions: { entrante: true, saliente: true },
      rules: { recording: false, transcription: false, classification: false },
      status: { onlyFailed: false },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Click-outside catcher · transparent fullscreen layer below the
          panel itself. z-index sits between the panel (z-40) and the rest
          of the UI so the rest still receives wheel/scroll events. */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-label="Filtros de tipo y estado"
        className={cn(
          "absolute left-0 top-full z-40 mt-1 w-72 rounded-sc-lg",
          "border border-sc-border bg-sc-surface shadow-sc-popover",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sc-border-soft px-[var(--sc-space-400)] py-[var(--sc-space-300)]">
          <h3 className="text-sc-sm font-medium text-sc-heading">Filtros</h3>
          <button
            type="button"
            onClick={handleClearAll}
            className={cn(
              "rounded-sc-sm text-sc-xs font-medium text-sc-accent-strong transition-colors",
              "hover:text-sc-heading",
              FOCUS_RING,
            )}
          >
            Limpiar
          </button>
        </div>

        {/* Body */}
        <div className="max-h-96 overflow-y-auto px-[var(--sc-space-400)] py-[var(--sc-space-300)]">
          <FilterGroup label="Tipo de conversación">
            <FilterCheckbox
              checked={filters.types.interna}
              onChange={(c) =>
                onFiltersChange({ ...filters, types: { ...filters.types, interna: c } })
              }
              label="interna"
            />
            <FilterCheckbox
              checked={filters.types.externa}
              onChange={(c) =>
                onFiltersChange({ ...filters, types: { ...filters.types, externa: c } })
              }
              label="externa"
            />
          </FilterGroup>

          <FilterGroup label="Canal">
            <FilterCheckbox
              checked={filters.channels.llamada}
              onChange={(c) =>
                onFiltersChange({ ...filters, channels: { ...filters.channels, llamada: c } })
              }
              label="llamada"
            />
            <FilterCheckbox
              checked={filters.channels.chat}
              onChange={(c) =>
                onFiltersChange({ ...filters, channels: { ...filters.channels, chat: c } })
              }
              label="chat"
            />
          </FilterGroup>

          <FilterGroup label="Dirección">
            <FilterCheckbox
              checked={filters.directions.entrante}
              onChange={(c) =>
                onFiltersChange({ ...filters, directions: { ...filters.directions, entrante: c } })
              }
              label="entrante"
            />
            <FilterCheckbox
              checked={filters.directions.saliente}
              onChange={(c) =>
                onFiltersChange({ ...filters, directions: { ...filters.directions, saliente: c } })
              }
              label="saliente"
            />
          </FilterGroup>

          <div
            aria-hidden
            className="my-[var(--sc-space-300)] border-t border-sc-border-soft"
          />

          <FilterGroup label="Procesamiento aplicado">
            <FilterCheckbox
              checked={filters.rules.recording}
              onChange={(c) =>
                onFiltersChange({ ...filters, rules: { ...filters.rules, recording: c } })
              }
              label="con grabación"
            />
            <FilterCheckbox
              checked={filters.rules.transcription}
              onChange={(c) =>
                onFiltersChange({ ...filters, rules: { ...filters.rules, transcription: c } })
              }
              label="con transcripción"
            />
            <FilterCheckbox
              checked={filters.rules.classification}
              onChange={(c) =>
                onFiltersChange({ ...filters, rules: { ...filters.rules, classification: c } })
              }
              label="con clasificación"
            />
          </FilterGroup>

          <FilterGroup label="Estado" last>
            <FilterCheckbox
              checked={filters.status.onlyFailed}
              onChange={(c) =>
                onFiltersChange({ ...filters, status: { ...filters.status, onlyFailed: c } })
              }
              label="solo fallidas"
            />
          </FilterGroup>
        </div>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Subcomponents · keep the panel flat and the shape consistent so
   adding a sixth section in the future is one entry, not a copy of
   the markup tree.
   ───────────────────────────────────────────────────────────────── */

function FilterGroup({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  /** When true, drop the bottom margin — the group is the last in
   *  the panel and a trailing gap would look loose. */
  last?: boolean;
}) {
  return (
    <div className={last ? "" : "mb-[var(--sc-space-400)]"}>
      <h4 className="mb-[var(--sc-space-200)] text-sc-xs font-medium uppercase tracking-wide text-sc-muted">
        {label}
      </h4>
      <div className="flex flex-col gap-[var(--sc-space-200)]">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-[var(--sc-space-200)]",
        "rounded-sc-sm transition-colors",
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(c) => onChange(c as boolean)}
        className="border-sc-border-default"
      />
      <span className="text-sc-sm text-sc-body transition-colors group-hover:text-sc-heading">
        {label}
      </span>
    </label>
  );
}
