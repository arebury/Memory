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
import { MultiSelectWithSearch } from "../MultiSelectWithSearch";
import { mockAgents, mockGroups } from "../../data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Sparkles } from "lucide-react";

interface TranscriptionRuleBuilderProps {
  onCancel: () => void;
  onSave: (rule: Partial<Rule>) => void;
  initialData?: Rule;
  isEditMode: boolean;
  breadcrumbs: { label: string; onClick?: () => void }[];
  onDiscardDraft?: () => void;
}

export function TranscriptionRuleBuilder({
  onCancel,
  onSave,
  initialData,
  isEditMode,
  breadcrumbs,
  onDiscardDraft
}: TranscriptionRuleBuilderProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [active, setActive] = useState(initialData?.active ?? true);

  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialData?.scopeOrGroups?.[0]?.services ?? initialData?.servicios ?? []
  );

  const [direction, setDirection] = useState(initialData?.direction || "all");
  const [durationMin, setDurationMin] = useState(initialData?.durationMin || 30);
  const [durationUnit, setDurationUnit] = useState<'seconds' | 'minutes'>('seconds');
  const [attendedBy, setAttendedBy] = useState<string[]>([]);

  // Single AI toggle — covers resumen + sentimiento
  const [aiAnalysis, setAiAnalysis] = useState(
    (initialData?.analyzeSummary || initialData?.sentimiento) ?? false
  );

  const attendedByOptions = [
    ...mockGroups.map(g => ({ value: `group:${g.value}`, label: `${g.label} (Grupo)` })),
    ...mockAgents.map(a => ({ value: `agent:${a.value}`, label: a.label })),
  ];

  const handleSave = () => {
    if (!name.trim() || name.length < 3) {
      toast.error("El nombre de la regla es obligatorio (min 3 caracteres)");
      return;
    }

    const durationInSeconds = durationUnit === 'minutes' ? durationMin * 60 : durationMin;

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
      durationMin: durationInSeconds,
      type: 'transcription',
      transcripcion: true,
      clasificacion: false,
      analyzeSummary: aiAnalysis,
      sentimiento: aiAnalysis,
      analyzeCategories: false,
      active
    };

    onSave(ruleData);
  };

  return (
    <RuleBuilderLayout
      title={isEditMode ? "Editar Regla de Transcripción" : "Nueva Regla de Transcripción"}
      subtitle="Define qué llamadas convertir a texto. Aplica a futuro sobre las conversaciones grabadas."
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
            placeholder="ej: Transcribir llamadas de soporte"
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

      {/* 3. Transcripción */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm space-y-5">
        <div>
          <Label className="text-base text-[#233155]">Criterios de transcripción</Label>
          <p className="text-sm text-[#8D939D] mt-1">
            Filtra qué conversaciones del alcance se transcriben. La transcripción tiene coste; usa estos filtros para descartar llamadas irrelevantes.
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-[#5F6776]">Dirección</Label>
          <Select value={direction} onValueChange={setDirection}>
            <SelectTrigger className="w-full bg-white border-[#D2D6E0]">
              <SelectValue placeholder="Seleccionar dirección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ambas</SelectItem>
              <SelectItem value="inbound">Entrante</SelectItem>
              <SelectItem value="outbound">Saliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-[#5F6776]">Duración mínima</Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              value={durationMin}
              onChange={(e) => setDurationMin(parseInt(e.target.value) || 0)}
              className="bg-white border-[#D2D6E0] w-28"
            />
            <Select value={durationUnit} onValueChange={(v) => setDurationUnit(v as 'seconds' | 'minutes')}>
              <SelectTrigger className="w-32 bg-white border-[#D2D6E0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">segundos</SelectItem>
                <SelectItem value="minutes">minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-[#A3A8B0]">Solo se transcriben llamadas que superen esta duración.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-[#5F6776]">Atendida por</Label>
          <MultiSelectWithSearch
            options={attendedByOptions}
            value={attendedBy}
            onChange={setAttendedBy}
            placeholder="Cualquier agente o grupo"
          />
          {attendedBy.length === 0 && (
            <p className="text-xs text-[#A3A8B0] italic">Sin filtro: se transcriben todas las del alcance.</p>
          )}
        </div>
      </div>

      {/* 4. Análisis IA */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
              <Sparkles size={16} className="text-purple-500" />
            </div>
            <div>
              <Label className="text-base text-[#233155]">Análisis IA</Label>
              <p className="text-sm text-[#8D939D] mt-0.5">
                Genera resumen y análisis de sentimiento de cada llamada transcrita.
              </p>
            </div>
          </div>
          <Switch
            checked={aiAnalysis}
            onCheckedChange={setAiAnalysis}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>

        {aiAnalysis && (
          <div className="mt-4 pl-12 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-md text-xs text-purple-700">
              Resumen automático
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-md text-xs text-purple-700">
              Análisis de sentimiento
            </span>
          </div>
        )}
      </div>
    </RuleBuilderLayout>
  );
}