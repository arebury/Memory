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
          ? "bg-[#EEFBFD] border-[#60D3E4] text-[#387983]"
          : isActive
          ? "bg-[#F4F6FC] border-[#D2D6E0] text-[#233155]"
          : "bg-white border-[#D2D6E0] text-[#233155] hover:bg-[#F4F6FC]"
      }`}
    >
      <Tag size={15} className={hasActiveFilters ? "text-[#60D3E4]" : "text-[#233155]"} />
      <span>Categorías IA</span>
      {categoryCount > 0 && (
        <span
          className={`px-1.5 py-0.5 text-xs rounded ${
            hasActiveFilters
              ? "bg-[#60D3E4] text-white"
              : "bg-[#E5E7EB] text-[#5F6776]"
          }`}
        >
          {categoryCount}
        </span>
      )}
    </button>
  );
}
