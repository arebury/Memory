import { useState, useMemo, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Search, ChevronDown, X, Plus } from "lucide-react";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectWithSearchProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  onCreateNew?: () => void;
  createNewLabel?: string;
}

export function MultiSelectWithSearch({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...",
  className = "",
  onCreateNew,
  createNewLabel = "Crear nuevo"
}: MultiSelectWithSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(opt => 
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleClear = () => {
    onChange([]);
    setSearchQuery("");
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(opt => opt.value));
    }
  };

  const displayText = useMemo(() => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const selected = options.find(opt => opt.value === value[0]);
      return selected?.label || placeholder;
    }
    return `${value.length} seleccionados`;
  }, [value, options, placeholder]);

  const isHighlighted = value.length > 0;

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className={`h-9 w-full flex items-center justify-between px-3 rounded border text-left transition-all ${
            isHighlighted 
              ? "bg-[#EEFBFD] border-[#60D3E4] text-[#387983]"
              : "bg-white border-[#D2D6E0] text-[#233155] hover:border-[#A3A8B0]"
          } ${className}`}
        >
          <span className="text-sm truncate">{displayText}</span>
          <ChevronDown size={14} className={`ml-2 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] bg-white border-[#CFD3DE] p-0 shadow-lg animate-in fade-in-0 zoom-in-95" align="start">
        <div className="p-3">
          {/* Header with badge */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#233155] text-sm">Seleccionar opciones</h3>
            {value.length > 0 && (
              <span className="px-1.5 py-0.5 bg-[#60D3E4] text-white text-xs rounded">
                {value.length}
              </span>
            )}
          </div>

          {/* Search */}
          <div className="mb-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8D939D]" />
              <Input 
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-[#D2D6E0] text-[#233155] placeholder:text-[#8D939D] pl-8 pr-7 h-8 text-sm focus:border-[#60D3E4] focus:ring-[#60D3E4] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8D939D] hover:text-[#233155] transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-[180px] overflow-y-auto space-y-0.5 pr-1 mb-2">
            {filteredOptions.map((option) => (
              <div 
                key={option.value}
                className={`flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors ${
                  value.includes(option.value) 
                    ? 'bg-[#EEFBFD]' 
                    : 'hover:bg-[#F4F6FC]'
                }`}
                onClick={() => handleToggle(option.value)}
              >
                <Checkbox 
                  checked={value.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                  className="border-[#D8F4F8] data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4] h-4 w-4"
                />
                <span className="text-[#233155] text-sm select-none">{option.label}</span>
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="text-[#8D939D] text-center py-6 text-sm">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>

        {/* Footer with actions */}
        <div className="border-t border-[#CFD3DE] p-2 flex gap-2 bg-[#F4F6FC] justify-center">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm text-[#5F6776] hover:bg-white hover:text-[#233155] rounded transition-colors"
          >
            {value.length === options.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
          {onCreateNew && (
            <button
              onClick={() => {
                onCreateNew();
                setOpen(false);
              }}
              className="px-3 py-1.5 text-sm bg-[#60D3E4] text-white hover:bg-[#4EC4D4] rounded transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{createNewLabel}</span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}