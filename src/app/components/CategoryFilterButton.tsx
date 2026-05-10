import { Tag } from "lucide-react";

interface CategoryFilterButtonProps {
  isActive: boolean;
  hasActiveFilters: boolean;
  onClick: () => void;
  categoryCount: number;
}

export function CategoryFilterButton({
  isActive,
  hasActiveFilters,
  onClick,
  categoryCount
}: CategoryFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-3 rounded border transition-all flex items-center gap-2 text-sm font-medium ${
        hasActiveFilters
          ? "bg-sc-accent-soft border-sc-accent text-sc-accent-strong"
          : isActive
          ? "bg-sc-canvas border-sc-border text-sc-primary"
          : "bg-white border-sc-border text-sc-primary hover:bg-sc-canvas"
      }`}
    >
      <Tag size={15} className={hasActiveFilters ? "text-sc-accent" : "text-sc-primary"} />
      <span>Categorías IA</span>
      {categoryCount > 0 && (
        <span
          className={`px-1.5 py-0.5 text-xs rounded ${
            hasActiveFilters
              ? "bg-sc-accent text-white"
              : "bg-sc-border text-sc-body"
          }`}
        >
          {categoryCount}
        </span>
      )}
    </button>
  );
}
