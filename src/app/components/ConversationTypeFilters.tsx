import { useState, useEffect } from "react";
import { Checkbox } from "./ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Filter } from "lucide-react";

interface ConversationTypeFiltersProps {
  filters: {
    interna: boolean;
    externa: boolean;
    llamada: boolean;
    chat: boolean;
    entrante: boolean;
    saliente: boolean;
  };
  onChange: (filters: any) => void;
}

export function ConversationTypeFilters({ filters, onChange }: ConversationTypeFiltersProps) {
  const [open, setOpen] = useState(false);

  const filterGroups = [
    {
      title: "Tipo",
      options: [
        { key: "interna", label: "Interna" },
        { key: "externa", label: "Externa" },
      ]
    },
    {
      title: "Canal",
      options: [
        { key: "llamada", label: "Llamada" },
        { key: "chat", label: "Chat" },
      ]
    },
    {
      title: "Dirección",
      options: [
        { key: "entrante", label: "Entrante" },
        { key: "saliente", label: "Saliente" },
      ]
    }
  ];

  const handleToggle = (key: string) => {
    onChange({
      ...filters,
      [key]: !filters[key as keyof typeof filters]
    });
  };

  const handleClear = () => {
    onChange({
      interna: true,
      externa: true,
      llamada: true,
      chat: true,
      entrante: true,
      saliente: true,
    });
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(filters).every(v => v);
    const newValue = !allSelected;
    onChange({
      interna: newValue,
      externa: newValue,
      llamada: newValue,
      chat: newValue,
      entrante: newValue,
      saliente: newValue,
    });
  };

  const activeCount = Object.values(filters).filter(Boolean).length;
  const totalCount = Object.keys(filters).length;

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
          className={`h-9 px-3 rounded border flex items-center gap-2 transition-all text-sm ${
            activeCount < totalCount
              ? 'border-[#60D3E4] bg-[#EEFBFD] hover:bg-[#EEFBFD]'
              : 'border-[#D2D6E0] bg-white hover:bg-[#F4F6FC]'
          }`}
        >
          <Filter size={15} className="text-[#233155]" />
          <span className="text-[#233155]">Tipo</span>
          {activeCount < totalCount && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#60D3E4] text-white text-xs rounded-full min-w-[20px] text-center transition-all">
              {activeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] bg-white border-[#CFD3DE] p-0 shadow-lg animate-in fade-in-0 zoom-in-95" align="end">
        <div className="p-4">
          {/* Header with badge and deselect all checkbox */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#233155]">Filtros de tipo</h3>
            {activeCount < totalCount && (
              <span className="px-2 py-1 bg-[#60D3E4] text-white text-xs rounded">
                {activeCount}/{totalCount}
              </span>
            )}
          </div>

          {/* Deselect all checkbox */}
          <div 
            className="flex items-center gap-2.5 p-2.5 rounded cursor-pointer transition-colors hover:bg-[#F4F6FC] mb-3 border-b border-[#CFD3DE] pb-4"
            onClick={handleSelectAll}
          >
            <Checkbox 
              id="deselect-all" 
              checked={activeCount === totalCount}
              onCheckedChange={handleSelectAll}
              className="border-[#D8F4F8] data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4]"
            />
            <label 
              htmlFor="deselect-all"
              className="text-sm text-[#233155] cursor-pointer select-none flex-1"
            >
              {activeCount === totalCount ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </label>
          </div>

          {/* Filter groups */}
          <div className="space-y-4 mb-3">
            {filterGroups.map((group, idx) => (
              <div key={idx}>
                <h4 className="text-xs text-[#8D939D] mb-2 uppercase tracking-wide">{group.title}</h4>
                <div className="space-y-1.5">
                  {group.options.map((option) => {
                    const isChecked = filters[option.key as keyof typeof filters];
                    return (
                      <div 
                        key={option.key} 
                        className={`flex items-center gap-2.5 p-2.5 rounded cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-[#EEFBFD]' 
                            : 'hover:bg-[#F4F6FC]'
                        }`}
                        onClick={() => handleToggle(option.key)}
                      >
                        <Checkbox 
                          id={`filter-${option.key}`} 
                          checked={isChecked}
                          onCheckedChange={() => handleToggle(option.key)}
                          className="border-[#D8F4F8] data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4]"
                        />
                        <label 
                          htmlFor={`filter-${option.key}`}
                          className="text-sm text-[#233155] cursor-pointer select-none flex-1"
                        >
                          {option.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}