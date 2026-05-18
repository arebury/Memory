import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Settings } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";
import { MultiSelectWithSearch } from "./MultiSelectWithSearch";
import { mockServices, mockGroups, mockAgents } from "../data/mockData";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "./ui/dialog";
import { RulesRepository } from "./RulesRepository";

interface ConversationFiltersProps {
  filters: {
    services: string[];
    dateRange: string;
    origin: string;
    destination: string;
    groups: string[];
    agents: string[];
  };
  onChange: (filters: any) => void;
  onNavigateToRepository?: () => void;
}

export function ConversationFilters({ filters, onChange, onNavigateToRepository }: ConversationFiltersProps) {
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  return (
    <div className="bg-white px-6 py-4 border-b border-[#CFD3DE]">
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-5">
        <div className="flex items-end gap-3">
        <div className="flex-1 grid grid-cols-6 gap-3">
          <div>
            <label className="block text-xs text-[#5F6776] mb-1.5 font-medium">Servicios</label>
            <MultiSelectWithSearch
              options={mockServices}
              value={filters.services}
              onChange={(value) => onChange({ ...filters, services: value })}
              placeholder="Cualquier servicio"
            />
          </div>
          
          <div>
            <label className="block text-xs text-[#5F6776] mb-1.5 font-medium">Fechas</label>
            <DateRangePicker 
              value={filters.dateRange}
              onChange={(value) => onChange({ ...filters, dateRange: value })}
            />
          </div>
          
          <div>
            <label className="block text-xs text-[#5F6776] mb-1.5 font-medium">Origen</label>
            <Input 
              placeholder="Cualquier Origen"
              value={filters.origin}
              onChange={(e) => onChange({ ...filters, origin: e.target.value })}
              className={`h-9 text-sm ${filters.origin ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983] font-medium' : 'border-[#D2D6E0]'}`}
            />
          </div>
          
          <div>
            <label className="block text-xs text-[#5F6776] mb-1.5 font-medium">Destino</label>
            <Input 
              placeholder="Cualquier Destino"
              value={filters.destination}
              onChange={(e) => onChange({ ...filters, destination: e.target.value })}
              className={`h-9 text-sm ${filters.destination ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983] font-medium' : 'border-[#D2D6E0]'}`}
            />
          </div>
          
          <div>
            <label className="block text-xs text-[#5F6776] mb-1.5 font-medium">Grupos ACD</label>
            <MultiSelectWithSearch
              options={mockGroups}
              value={filters.groups}
              onChange={(value) => onChange({ ...filters, groups: value })}
              placeholder="Cualquier grupo"
            />
          </div>
          
          <div>
            <label className="block text-xs text-[#5F6776] mb-1.5 font-medium">Agentes</label>
            <MultiSelectWithSearch
              options={mockAgents}
              value={filters.agents}
              onChange={(value) => onChange({ ...filters, agents: value })}
              placeholder="Cualquier Agente"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <Button className="h-9 w-9 p-0 bg-[#233155] hover:bg-[#1C283D]">
            <Search size={15} />
          </Button>
        </div>
      </div>
      </div>
      
      {/* Configuration Button */}
      <div className="mt-3 flex justify-start">
        <Dialog open={isRulesModalOpen} onOpenChange={setIsRulesModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-8 px-3 text-xs text-[#5F6776] border-[#D2D6E0] hover:border-[#60D3E4] hover:text-[#60D3E4] hover:bg-[#EEFBFD] transition-all"
            >
              <Settings size={13} className="mr-1.5" />
              Configuración
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden bg-[#F4F6FC] border-none">
             <DialogTitle className="sr-only">Configuración de Reglas</DialogTitle>
             <DialogDescription className="sr-only">
               Panel de gestión para configurar reglas de grabación, transcripción y clasificación de llamadas.
             </DialogDescription>
             <div className="h-full overflow-hidden flex flex-col">
                <RulesRepository 
                  onNavigateBack={() => setIsRulesModalOpen(false)}
                  onNavigateToCategories={() => {
                     // In modal mode, we might not support navigating to categories fully,
                     // or we would need to close modal and ask parent to navigate.
                     // For now, simply close modal.
                     setIsRulesModalOpen(false);
                     if (onNavigateToRepository) onNavigateToRepository();
                  }}
                />
             </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
