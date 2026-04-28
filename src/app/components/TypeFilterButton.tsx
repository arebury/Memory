import { Filter } from "lucide-react";
import { Button } from "./ui/button";

interface TypeFilterButtonProps {
  isActive: boolean;
  hasActiveFilters: boolean;
  onClick: () => void;
}

export function TypeFilterButton({ isActive, hasActiveFilters, onClick }: TypeFilterButtonProps) {
  return (
    <div className="relative">
      <Button
        onClick={onClick}
        variant="outline"
        className={`h-9 px-4 gap-2 text-sm font-medium border-[#D2D6E0] hover:bg-[#F4F6FC] relative ${
          isActive ? 'bg-[#F4F6FC]' : ''
        } ${
          hasActiveFilters ? 'border-[#60D3E4] bg-[#EEFBFD]' : ''
        }`}
      >
        <Filter size={15} className={hasActiveFilters ? "text-[#60D3E4]" : "text-[#233155]"} />
        <span className={hasActiveFilters ? "text-[#387983]" : "text-[#233155]"}>Tipo</span>
        
        {hasActiveFilters && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#60D3E4] rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white">•</span>
          </div>
        )}
      </Button>
    </div>
  );
}
