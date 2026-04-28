import { useState } from "react";
import { RuleBuilderLayout } from "./shared/RuleBuilderLayout";
import { SelectionCriteria } from "./shared/SelectionCriteria";
import { ActiveToggle } from "./shared/ActiveToggle";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { toast } from "sonner@2.0.3";
import { Rule } from "../RulesContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

interface RecordingRuleBuilderProps {
  onCancel: () => void;
  onSave: (rule: Partial<Rule>) => void;
  initialData?: Rule;
  isEditMode: boolean;
  breadcrumbs: { label: string; onClick?: () => void }[];
  onDiscardDraft?: () => void;
}

export function RecordingRuleBuilder({
  onCancel,
  onSave,
  initialData,
  isEditMode,
  breadcrumbs,
  onDiscardDraft
}: RecordingRuleBuilderProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [active, setActive] = useState(initialData?.active ?? true);

  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialData?.scopeOrGroups?.[0]?.services ?? initialData?.servicios ?? []
  );

  const [direction, setDirection] = useState(initialData?.direction || "all");
  const [filterBySchedule, setFilterBySchedule] = useState(initialData?.schedule?.enabled || false);
  const [scheduleFrom, setScheduleFrom] = useState(initialData?.schedule?.from || "09:00");
  const [scheduleTo, setScheduleTo] = useState(initialData?.schedule?.to || "18:00");

  const handleSave = () => {
    if (!name.trim() || name.length < 3) {
      toast.error("El nombre de la regla es obligatorio (min 3 caracteres)");
      return;
    }

    const ruleData: Partial<Rule> = {
      ...initialData,
      name,
      description,
      servicios: selectedServices,
      grupos: [],
      agentes: [],
      scopeOrGroups: undefined,
      direction,
      origen: "",
      destino: "",
      schedule: {
        enabled: filterBySchedule,
        from: scheduleFrom,
        to: scheduleTo
      },
      type: 'recording',
      transcripcion: false,
      clasificacion: false,
      active
    };

    onSave(ruleData);
  };

  return (
    <RuleBuilderLayout
      title={isEditMode ? "Editar Regla de Grabación" : "Nueva Regla de Grabación"}
      subtitle="Define qué llamadas grabar como audio. Aplica a futuro sobre las conversaciones que entren al sistema."
      breadcrumbs={breadcrumbs}
      isDraft={initialData?.isDraft}
      onDiscardDraft={onDiscardDraft}
      actions={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#60D3E4] hover:bg-[#387983] text-white"
            disabled={!name.trim()}
          >
            {isEditMode ? "Guardar cambios" : "Crear regla"}
          </Button>
        </>
      }
    >
      {/* 1. Información básica */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base text-[#233155]">Información básica</Label>
          <ActiveToggle checked={active} onCheckedChange={setActive} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            placeholder="ej: Grabar llamadas comerciales"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border-[#CFD3DE]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción <span className="text-[#A3A8B0] text-xs">(opcional)</span></Label>
          <Textarea
            id="description"
            placeholder="Documenta el propósito de esta regla..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white min-h-[72px] border-[#CFD3DE] resize-none"
          />
        </div>
      </div>

      {/* 2. Alcance */}
      <SelectionCriteria
        selectedServices={selectedServices}
        onChangeServices={setSelectedServices}
      />

      {/* 3. Grabación */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm space-y-5">
        <div>
          <Label className="text-base text-[#233155]">Criterios de grabación</Label>
          <p className="text-sm text-[#8D939D] mt-1">
            Filtra qué llamadas del alcance se graban.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-[#5F6776]">Dirección</Label>
          <Select value={direction} onValueChange={setDirection}>
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

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-schedule"
              checked={filterBySchedule}
              onCheckedChange={(checked) => setFilterBySchedule(checked as boolean)}
              className="data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4] border-[#D2D6E0]"
            />
            <Label htmlFor="filter-schedule" className="cursor-pointer text-sm text-[#233155]">
              Filtrar por horario
            </Label>
          </div>
          {filterBySchedule && (
            <div className="ml-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8D939D]">Desde</span>
                <input
                  type="time"
                  className="border border-[#D2D6E0] rounded px-2 py-1 text-sm text-[#233155]"
                  value={scheduleFrom}
                  onChange={(e) => setScheduleFrom(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#8D939D]">Hasta</span>
                <input
                  type="time"
                  className="border border-[#D2D6E0] rounded px-2 py-1 text-sm text-[#233155]"
                  value={scheduleTo}
                  onChange={(e) => setScheduleTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </RuleBuilderLayout>
  );
}