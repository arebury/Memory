import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

interface CategoryFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  availableCategories: string[];
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
}

export function CategoryFilterPanel({
  isOpen,
  onClose,
  availableCategories,
  selectedCategories,
  onSelectionChange,
}: CategoryFilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectionChange(selectedCategories.filter(c => c !== category));
    } else {
      onSelectionChange([...selectedCategories, category]);
    }
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === availableCategories.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...availableCategories]);
    }
  };

  const handleClear = () => {
    onSelectionChange([]);
  };

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-2 w-[320px] bg-white border border-[#CFD3DE] rounded-lg shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-2"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[#233155] font-medium text-sm">Categorías IA</h3>
            {selectedCategories.length > 0 && (
              <span className="px-1.5 py-0.5 bg-[#60D3E4] text-white text-xs rounded">
                {selectedCategories.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#8D939D] hover:text-[#233155] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Categories list */}
        <div className="space-y-2 mb-3 max-h-[240px] overflow-y-auto">
          {availableCategories.map((category) => (
            <div
              key={category}
              className={`flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors ${
                selectedCategories.includes(category)
                  ? "bg-[#EEFBFD]"
                  : "hover:bg-[#F4F6FC]"
              }`}
              onClick={() => handleToggle(category)}
            >
              <Checkbox
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleToggle(category)}
                className="border-[#D8F4F8] data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4] h-4 w-4"
              />
              <span className="text-[#233155] text-sm select-none">{category}</span>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 pt-3 border-t border-[#CFD3DE]">
          <button
            onClick={handleSelectAll}
            className="flex-1 px-3 py-1.5 text-sm text-[#5F6776] hover:bg-[#F4F6FC] rounded transition-colors"
          >
            {selectedCategories.length === availableCategories.length
              ? "Deseleccionar todo"
              : "Seleccionar todo"}
          </button>
        </div>
      </div>
    </div>
  );
}