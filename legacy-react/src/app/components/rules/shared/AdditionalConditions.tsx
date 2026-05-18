import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { Button } from "../../ui/button";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { MultiSelectWithSearch } from "../../MultiSelectWithSearch";
import { mockOrigenes, mockTipificaciones } from "../../../data/mockData";
import { Input } from "../../ui/input";

interface AdditionalConditionsProps {
  direction: string; // 'all', 'inbound', 'outbound'
  onChangeDirection: (val: string) => void;
  filterByOrigin: boolean;
  onChangeFilterByOrigin: (val: boolean) => void;
  selectedOrigins: string[];
  onChangeSelectedOrigins: (val: string[]) => void;
  showTypification?: boolean;
  filterByTypification?: boolean;
  onChangeFilterByTypification?: (val: boolean) => void;
  selectedTypifications?: string[];
  onChangeSelectedTypifications?: (val: string[]) => void;
  filterBySchedule: boolean;
  onChangeFilterBySchedule: (val: boolean) => void;
  scheduleFrom?: string;
  onChangeScheduleFrom?: (val: string) => void;
  scheduleTo?: string;
  onChangeScheduleTo?: (val: string) => void;
  percentage?: number;
  onChangePercentage?: (val: number) => void;
  showDuration?: boolean;
  durationMin?: number;
  onChangeDurationMin?: (val: number) => void;
  durationMax?: number;
  onChangeDurationMax?: (val: number) => void;
}

export function AdditionalConditions({
  direction,
  onChangeDirection,
  filterByOrigin,
  onChangeFilterByOrigin,
  selectedOrigins,
  onChangeSelectedOrigins,
  showTypification = false,
  filterByTypification,
  onChangeFilterByTypification,
  selectedTypifications,
  onChangeSelectedTypifications,
  filterBySchedule,
  onChangeFilterBySchedule,
  scheduleFrom,
  onChangeScheduleFrom,
  scheduleTo,
  onChangeScheduleTo,
  percentage,
  onChangePercentage,
  showDuration = false,
  durationMin,
  onChangeDurationMin,
  durationMax,
  onChangeDurationMax
}: AdditionalConditionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm"
    >
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold text-[#233155]">
          Condiciones adicionales (opcional)
        </Label>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-6 mt-4 pt-4 border-t border-[#F4F6FC]">
        {/* Direction */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#233155]">Dirección</Label>
          <Select value={direction} onValueChange={onChangeDirection}>
            <SelectTrigger className="w-full bg-white border-[#D2D6E0]">
              <SelectValue placeholder="Seleccionar dirección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="inbound">Entrantes</SelectItem>
              <SelectItem value="outbound">Salientes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Origin */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-origin"
              checked={filterByOrigin}
              onCheckedChange={(checked) => onChangeFilterByOrigin(checked as boolean)}
              className="data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4] border-[#D2D6E0]"
            />
            <Label htmlFor="filter-origin" className="cursor-pointer text-sm font-medium text-[#233155]">Filtrar por origen</Label>
          </div>
          {filterByOrigin && (
            <div className="ml-6">
              <MultiSelectWithSearch
                options={mockOrigenes}
                value={selectedOrigins}
                onChange={onChangeSelectedOrigins}
                placeholder="Seleccionar orígenes..."
              />
            </div>
          )}
        </div>

        {/* Typification */}
        {showTypification && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-typification"
                checked={filterByTypification}
                onCheckedChange={(checked) => onChangeFilterByTypification?.(checked as boolean)}
                className="data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4] border-[#D2D6E0]"
              />
              <Label htmlFor="filter-typification" className="cursor-pointer text-sm font-medium text-[#233155]">Filtrar por tipificación</Label>
            </div>
            {filterByTypification && (
              <div className="ml-6">
                <MultiSelectWithSearch
                  options={mockTipificaciones}
                  value={selectedTypifications || []}
                  onChange={(val) => onChangeSelectedTypifications?.(val)}
                  placeholder="Seleccionar tipificaciones..."
                />
              </div>
            )}
          </div>
        )}

        {/* Schedule */}
        <div className="space-y-3">
           <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-schedule"
              checked={filterBySchedule}
              onCheckedChange={(checked) => onChangeFilterBySchedule(checked as boolean)}
              className="data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4] border-[#D2D6E0]"
            />
            <Label htmlFor="filter-schedule" className="cursor-pointer text-sm font-medium text-[#233155]">Filtrar por horario</Label>
          </div>
          {filterBySchedule && (
            <div className="ml-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8D939D]">Desde</span>
                <input 
                  type="time" 
                  className="border border-[#D2D6E0] rounded px-2 py-1 text-sm text-[#233155]"
                  value={scheduleFrom || "09:00"}
                  onChange={(e) => onChangeScheduleFrom?.(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8D939D]">Hasta</span>
                <input 
                  type="time" 
                  className="border border-[#D2D6E0] rounded px-2 py-1 text-sm text-[#233155]"
                  value={scheduleTo || "18:00"}
                  onChange={(e) => onChangeScheduleTo?.(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>


        {/* Percentage */}
        {percentage !== undefined && onChangePercentage && (
          <div className="space-y-2">
             <div className="flex items-center justify-between">
               <Label className="text-sm font-medium text-[#233155]">Porcentaje de llamadas a aplicar</Label>
               <span className="text-sm font-semibold text-[#60D3E4]">{percentage}%</span>
             </div>
             <input 
               type="range" 
               min="1" 
               max="100" 
               className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#60D3E4]"
               value={percentage}
               onChange={(e) => onChangePercentage(parseInt(e.target.value))}
             />
             <p className="text-xs text-[#8D939D]">
               Se aplicará esta regla aleatoriamente al {percentage}% de las llamadas que cumplan los criterios.
             </p>
          </div>
        )}

        {/* Duration */}
        {showDuration && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#233155]">Duración de la llamada</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="duration-min" className="text-xs text-[#8D939D]">Mínimo (segundos)</Label>
                <Input
                  id="duration-min"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={durationMin || 0}
                  onChange={(e) => onChangeDurationMin?.(parseInt(e.target.value) || 0)}
                  className="bg-white border-[#D2D6E0]"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="duration-max" className="text-xs text-[#8D939D]">Máximo (segundos)</Label>
                <Input
                  id="duration-max"
                  type="number"
                  min="0"
                  placeholder="Sin límite"
                  value={durationMax || 0}
                  onChange={(e) => onChangeDurationMax?.(parseInt(e.target.value) || 0)}
                  className="bg-white border-[#D2D6E0]"
                />
              </div>
            </div>
            <p className="text-xs text-[#8D939D]">
              Especifica la duración mínima y máxima de las llamadas. Deja en 0 para no aplicar límite.
            </p>
          </div>
        )}

      </CollapsibleContent>
    </Collapsible>
  );
}