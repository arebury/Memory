import { useState, useMemo } from "react";
import { RuleBuilderLayout } from "./shared/RuleBuilderLayout";
import { SelectionCriteria } from "./shared/SelectionCriteria";
import { AdditionalConditions } from "./shared/AdditionalConditions";
import { ActiveToggle } from "./shared/ActiveToggle";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner@2.0.3";
import { Rule } from "../RulesContext";
import { MultiSelectWithSearch } from "../MultiSelectWithSearch";
import { useCategories } from "../CategoriesContext";
import { useEntities } from "../EntitiesContext";
import { Plus, Sparkles } from "lucide-react";

interface ClassificationRuleBuilderProps {
  onCancel: () => void;
  onSave: (rule: Partial<Rule>) => void;
  initialData?: Rule;
  isEditMode: boolean;
  breadcrumbs: { label: string; onClick?: () => void }[];
  onNavigateToCategories: () => void;
  onNavigateToEntities?: () => void;
  onDiscardDraft?: () => void;
}

export function ClassificationRuleBuilder({
  onCancel,
  onSave,
  initialData,
  isEditMode,
  breadcrumbs,
  onNavigateToCategories,
  onNavigateToEntities,
  onDiscardDraft
}: ClassificationRuleBuilderProps) {
  const { categories } = useCategories();
  const { entities, systemEntities } = useEntities();

  const allEntities = useMemo(() => [...systemEntities, ...entities], [systemEntities, entities]);

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [active, setActive] = useState(initialData?.active ?? true);

  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialData?.scopeOrGroups?.[0]?.services ?? initialData?.servicios ?? []
  );

  const [direction, setDirection] = useState(initialData?.direction || "all");
  const [filterByOrigin, setFilterByOrigin] = useState(!!initialData?.origen);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>(initialData?.origen ? [initialData.origen] : []);

  const [filterBySchedule, setFilterBySchedule] = useState(initialData?.schedule?.enabled || false);
  const [scheduleFrom, setScheduleFrom] = useState(initialData?.schedule?.from || "09:00");
  const [scheduleTo, setScheduleTo] = useState(initialData?.schedule?.to || "18:00");

  // Single AI toggle — resumen + sentimiento together
  const [aiAnalysis, setAiAnalysis] = useState(
    (initialData?.analyzeSummary || initialData?.sentimiento) ?? false
  );

  const [analyzeCategories, setAnalyzeCategories] = useState(
    initialData?.analyzeCategories || (initialData?.categorias && initialData.categorias.length > 0) || false
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categorias || []);

  const [analyzeEntities, setAnalyzeEntities] = useState(
    initialData?.analyzeEntities || (initialData?.entidades && initialData.entidades.length > 0) || false
  );
  const [selectedEntities, setSelectedEntities] = useState<string[]>(initialData?.entidades || []);

  const handleSave = () => {
    if (!name.trim() || name.length < 3) {
      toast.error("El nombre de la regla es obligatorio (min 3 caracteres)");
      return;
    }

    if (!aiAnalysis && !analyzeCategories && !analyzeEntities) {
      toast.error("Activa al menos un tipo de análisis IA");
      return;
    }

    if (analyzeCategories && selectedCategories.length === 0) {
      toast.error("Si activas categorías, debes seleccionar al menos una");
      return;
    }

    if (analyzeEntities && selectedEntities.length === 0) {
      toast.error("Si activas entidades, debes seleccionar al menos una");
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
      origen: selectedOrigins.length > 0 ? selectedOrigins[0] : "",
      destino: "",
      schedule: {
        enabled: filterBySchedule,
        from: scheduleFrom,
        to: scheduleTo
      },
      type: 'classification',
      transcripcion: true,
      clasificacion: true,
      analyzeSummary: aiAnalysis,
      sentimiento: aiAnalysis,
      analyzeCategories,
      categorias: analyzeCategories ? selectedCategories : [],
      analyzeEntities,
      entidades: analyzeEntities ? selectedEntities : [],
      active
    };

    onSave(ruleData);
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const entityOptions = allEntities.map(e => ({ value: e.id, label: e.name }));

  return (
    <RuleBuilderLayout
      title={isEditMode ? "Editar Regla de Clasificación IA" : "Nueva Regla de Clasificación IA"}
      subtitle="Define qué llamadas analizar con inteligencia artificial."
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
            placeholder="ej: Analizar llamadas de ventas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white border-[#CFD3DE]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción <span className="text-[#A3A8B0] text-xs">(opcional)</span></Label>
          <Textarea
            id="description"
            placeholder="Describe el propósito de esta regla..."
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

      {/* 3. Análisis IA */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-purple-500" />
            <Label className="text-base text-[#233155]">Análisis IA</Label>
          </div>
          <p className="text-sm text-[#8D939D]">
            Elige qué tipos de análisis aplicar a las conversaciones transcritas.
          </p>
        </div>

        {/* AI Analysis toggle (resumen + sentimiento) */}
        <div className="flex items-center justify-between py-3 px-4 bg-[#FAFBFD] rounded-lg border border-[#E8EAF0]">
          <div>
            <p className="text-sm text-[#233155]">Resumen y sentimiento</p>
            <p className="text-xs text-[#A3A8B0] mt-0.5">Resumen automático + análisis emocional del cliente</p>
          </div>
          <Switch
            checked={aiAnalysis}
            onCheckedChange={setAiAnalysis}
            className="data-[state=checked]:bg-purple-500"
          />
        </div>

        {/* Categorías */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 py-3 px-4 bg-[#FAFBFD] rounded-lg border border-[#E8EAF0]">
            <div className="flex items-start gap-3">
              <Checkbox
                id="analyzeCategories"
                checked={analyzeCategories}
                onCheckedChange={(checked) => setAnalyzeCategories(checked as boolean)}
                className="mt-0.5 data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4] border-[#D2D6E0]"
              />
              <div>
                <Label htmlFor="analyzeCategories" className="text-sm text-[#233155] cursor-pointer">
                  Categorías IA
                </Label>
                <p className="text-xs text-[#A3A8B0] mt-0.5">Detecta temas específicos configurados en tu repositorio</p>
              </div>
            </div>
          </div>

          {analyzeCategories && (
            <div className="ml-4 pl-4 border-l-2 border-[#E8EAF0]">
              {categoryOptions.length > 0 ? (
                <MultiSelectWithSearch
                  options={categoryOptions}
                  value={selectedCategories}
                  onChange={setSelectedCategories}
                  placeholder="Seleccionar categorías..."
                  onCreateNew={onNavigateToCategories}
                  createNewLabel="Crear nueva categoría"
                />
              ) : (
                <div className="bg-[#F4F6FC] p-4 rounded text-center border border-dashed border-[#CFD3DE]">
                  <p className="text-sm text-[#8D939D] mb-3">No tienes categorías IA creadas aún</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNavigateToCategories}
                    className="text-[#387983] border-[#60D3E4] hover:bg-[#EEFBFD]"
                  >
                    <Plus size={14} className="mr-1" />
                    Crear mi primera categoría IA
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Entidades */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 py-3 px-4 bg-[#FAFBFD] rounded-lg border border-[#E8EAF0]">
            <div className="flex items-start gap-3">
              <Checkbox
                id="analyzeEntities"
                checked={analyzeEntities}
                onCheckedChange={(checked) => setAnalyzeEntities(checked as boolean)}
                className="mt-0.5 data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4] border-[#D2D6E0]"
              />
              <div>
                <Label htmlFor="analyzeEntities" className="text-sm text-[#233155] cursor-pointer">
                  Entidades personalizadas
                </Label>
                <p className="text-xs text-[#A3A8B0] mt-0.5">Extrae datos específicos como DNI, importes o productos</p>
              </div>
            </div>
          </div>

          {analyzeEntities && (
            <div className="ml-4 pl-4 border-l-2 border-[#E8EAF0]">
              <MultiSelectWithSearch
                options={entityOptions}
                value={selectedEntities}
                onChange={setSelectedEntities}
                placeholder="Seleccionar entidades..."
                onCreateNew={onNavigateToEntities}
                createNewLabel="Gestionar entidades"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Condiciones adicionales */}
      <AdditionalConditions
        direction={direction}
        onChangeDirection={setDirection}
        filterByOrigin={filterByOrigin}
        onChangeFilterByOrigin={setFilterByOrigin}
        selectedOrigins={selectedOrigins}
        onChangeSelectedOrigins={setSelectedOrigins}
        filterBySchedule={filterBySchedule}
        onChangeFilterBySchedule={setFilterBySchedule}
        scheduleFrom={scheduleFrom}
        onChangeScheduleFrom={setScheduleFrom}
        scheduleTo={scheduleTo}
        onChangeScheduleTo={setScheduleTo}
      />
    </RuleBuilderLayout>
  );
}