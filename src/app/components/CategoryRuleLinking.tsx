import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { FileText, AlertTriangle, Check, Info, X } from "lucide-react";
import { Category } from "./CategoriesContext";
import { useRules, Rule } from "./RulesContext";
import { toast } from "sonner@2.0.3";
import { RuleQuickViewPanel } from "./RuleQuickViewPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface CategoryRuleLinkingProps {
  category: Category;
  onNavigateToRules: (ruleId?: number, highlightSection?: string) => void;
  onCreateFirstRule: () => void;
  onClosePanel?: () => void;
}

export function CategoryRuleLinking({ 
  category, 
  onNavigateToRules,
  onCreateFirstRule,
  onClosePanel
}: CategoryRuleLinkingProps) {
  const { rules, updateRule } = useRules();
  const [selectedRuleId, setSelectedRuleId] = useState<string>("");
  const [showAddToRule, setShowAddToRule] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickViewRule, setQuickViewRule] = useState<Rule | null>(null);
  // Ya no necesitamos el trigger para posicionamiento centrado
  // const [quickViewTrigger, setQuickViewTrigger] = useState<HTMLElement | null>(null);

  // Calcular linkedRules dinámicamente desde el contexto de rules
  const linkedRules = useMemo(() => {
    return rules
      .filter(rule => rule.categorias?.includes(category.id))
      .map(rule => ({
        id: rule.id,
        name: rule.name,
        services: rule.servicios,
        isActive: rule.active,
        categoriesCount: rule.categorias?.length || 0
      }));
  }, [rules, category.id]);

  const hasActiveRules = linkedRules.some(r => r.isActive);
  const allRulesInactive = linkedRules.length > 0 && !hasActiveRules;

  // Filtrar reglas disponibles (que no están ya vinculadas)
  const availableRules = useMemo(() => rules.filter(rule => 
    !linkedRules.find(lr => lr.id === rule.id)
  ).filter(rule => 
    rule.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [rules, linkedRules, searchQuery]);

  const handleSelectRule = (ruleId: string) => {
    const rule = rules.find(r => r.id.toString() === ruleId);
    if (rule) {
      // Añadir la categoría a la regla directamente
      const updatedCategorias = [...(rule.categorias || []), category.id];
      updateRule(rule.id, { categorias: updatedCategorias });
      
      toast.success(`Categoría añadida a ${rule.name}`);
      setShowAddToRule(false);
      setSelectedRuleId("");
      setSearchQuery("");
    }
  };

  const handleViewRule = (ruleId: number, event: React.MouseEvent<HTMLElement>) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setQuickViewRule(rule);
      // setQuickViewTrigger(event.currentTarget);
    }
  };
  
  const handleNavigateToCreateRule = () => {
    // Cerrar panel antes de navegar
    if (onClosePanel) {
      onClosePanel();
    }
    // Pequeño delay para que el panel se cierre antes de navegar
    setTimeout(() => {
      onCreateFirstRule();
    }, 100);
  };

  const handleUnlinkRule = (ruleId: number) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      // Remover la categoría de la regla
      const updatedCategorias = (rule.categorias || []).filter(catId => catId !== category.id);
      updateRule(rule.id, { categorias: updatedCategorias });
      
      toast.success(`Categoría desvinculada de ${rule.name}`);
    }
  };

  // Variante A: No vinculada y no hay reglas
  if (linkedRules.length === 0 && rules.length === 0) {
    return (
      <>
        <div className="space-y-4">
          <div className="h-px bg-[#E5E7EB]" />
          
          <div>
            <h3 className="text-xs font-medium text-[#8D939D] tracking-wide mb-3">VINCULACIÓN CON REGLAS</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[#233155]">
                    Esta categoría no está activa
                  </p>
                  <p className="text-sm text-[#8D939D]">
                    Para que la IA detecte <strong>{category.name}</strong> en tus llamadas, necesitas vincularla a una regla de grabación.
                  </p>
                  <p className="text-sm text-[#8D939D]">
                    Aún no tienes reglas creadas.
                  </p>
                  <div className="bg-white/70 border border-amber-300 rounded p-2.5 mt-2">
                    <p className="text-xs text-[#233155]">
                      💡 <strong>Tip:</strong> Cuando crees una regla y vincules esta categoría desde allí, aparecerá automáticamente reflejada aquí. La vinculación es bidireccional.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleNavigateToCreateRule}
                className="w-full bg-[#60D3E4] hover:bg-[#4FC3D3] text-white"
              >
                + Crear mi primera regla
              </Button>
            </div>
          </div>
        </div>

        <RuleQuickViewPanel
          rule={quickViewRule}
          open={!!quickViewRule}
          onOpenChange={(open) => !open && setQuickViewRule(null)}
          // trigger={quickViewTrigger}
        />
      </>
    );
  }

  // Variante B: No vinculada pero sí hay reglas
  if (linkedRules.length === 0 && rules.length > 0) {
    return (
      <>
        <div className="space-y-4">
          <div className="h-px bg-[#E5E7EB]" />
          
          <div>
            <h3 className="text-xs font-medium text-[#8D939D] tracking-wide mb-3">VINCULACIÓN CON REGLAS</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#233155] mb-1">
                    Esta categoría no está activa
                  </p>
                  <p className="text-sm text-[#8D939D]">
                    Para que la IA detecte <strong>{category.name}</strong> en tus llamadas, necesitas añadirla a una regla de grabación.
                  </p>
                </div>
              </div>
            </div>

            {!showAddToRule ? (
              <Button
                onClick={() => setShowAddToRule(true)}
                variant="outline"
                className="w-full border-[#60D3E4] text-[#60D3E4] hover:bg-[#60D3E4] hover:text-white"
              >
                + Añadir a regla existente
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-[#233155] mb-2 block">
                    Añadir a regla existente:
                  </label>
                  
                  <Select value={selectedRuleId} onValueChange={handleSelectRule}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar regla..." />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Input de búsqueda dentro del dropdown */}
                      <div className="px-2 pb-2 pt-1 border-b border-[#E5E7EB]">
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar regla..."
                          className="h-8"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Lista de reglas */}
                      <div className="max-h-[300px] overflow-y-auto">
                        {availableRules.length === 0 ? (
                          <div className="p-2 text-sm text-[#8D939D] text-center">
                            {searchQuery ? "No se encontraron reglas" : "No hay más reglas disponibles"}
                          </div>
                        ) : (
                          availableRules.map((rule) => (
                            <SelectItem key={rule.id} value={rule.id.toString()}>
                              <div className="flex flex-col items-start py-1">
                                <div className="flex items-center gap-2">
                                  <FileText size={14} />
                                  <span className="font-medium">{rule.name}</span>
                                </div>
                                <span className="text-xs text-[#8D939D]">
                                  Servicios: {rule.servicios.slice(0, 2).join(", ")}
                                  {rule.servicios.length > 2 && ` +${rule.servicios.length - 2}`} · {rule.categorias?.length || 0} categorías
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                  <span className="text-xs text-[#8D939D]">o</span>
                  <div className="flex-1 h-px bg-[#E5E7EB]" />
                </div>

                <button
                  onClick={handleNavigateToCreateRule}
                  className="text-sm text-[#60D3E4] hover:text-[#4FC3D3] transition-colors"
                >
                  + Crear nueva regla
                </button>
              </div>
            )}
          </div>
        </div>

        <RuleQuickViewPanel
          rule={quickViewRule}
          open={!!quickViewRule}
          onOpenChange={(open) => !open && setQuickViewRule(null)}
          // trigger={quickViewTrigger}
        />
      </>
    );
  }

  // Variante C: Vinculada a reglas activas
  if (hasActiveRules) {
    return (
      <TooltipProvider>
        <div className="space-y-4">
          <div className="h-px bg-[#E5E7EB]" />
          
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="text-xs font-medium text-[#8D939D] tracking-wide">VINCULACIÓN CON REGLAS</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-[#8D939D] hover:text-[#233155] transition-colors">
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px]">
                  <p className="text-xs">Las categorías se detectan solo en las llamadas que cumplan las condiciones de las reglas a las que están vinculadas.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <Check size={16} />
                <span>Activa en {linkedRules.length} {linkedRules.length === 1 ? 'regla' : 'reglas'}</span>
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {linkedRules.map((rule) => (
                <div 
                  key={rule.id} 
                  className="bg-white border border-[#E5E7EB] rounded-lg p-3 transition-all duration-200 hover:border-[#60D3E4] hover:shadow-md hover:bg-[#F9FCFD] group relative"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('.unlink-button')) {
                        handleViewRule(rule.id, e);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <FileText size={16} className="text-[#8D939D] mt-1 group-hover:text-[#60D3E4] transition-colors" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#233155] group-hover:text-[#60D3E4] transition-colors">{rule.name}</p>
                        <p className="text-xs text-[#8D939D]">
                          Servicios: {rule.services.slice(0, 2).join(", ")}
                          {rule.services.length > 2 && ` +${rule.services.length - 2}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlinkRule(rule.id);
                      }}
                      className="unlink-button opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 text-[#8D939D] hover:text-red-600"
                      aria-label="Desvincular"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowAddToRule(true)}
              variant="outline"
              size="sm"
              className="w-full border-[#60D3E4] text-[#60D3E4] hover:bg-[#60D3E4] hover:text-white"
            >
              + Añadir a otra regla
            </Button>

            {showAddToRule && (
              <div className="mt-4 space-y-3">
                <Select value={selectedRuleId} onValueChange={handleSelectRule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar regla..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Input de búsqueda dentro del dropdown */}
                    <div className="px-2 pb-2 pt-1 border-b border-[#E5E7EB]">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar regla..."
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    {/* Lista de reglas */}
                    <div className="max-h-[300px] overflow-y-auto">
                      {availableRules.length === 0 ? (
                        <div className="p-2 text-sm text-[#8D939D] text-center">
                          {searchQuery ? "No se encontraron reglas" : "No hay más reglas disponibles"}
                        </div>
                      ) : (
                        availableRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id.toString()}>
                            <div className="flex flex-col items-start py-1">
                              <div className="flex items-center gap-2">
                                <FileText size={14} />
                                <span className="font-medium">{rule.name}</span>
                              </div>
                              <span className="text-xs text-[#8D939D]">
                                Servicios: {rule.servicios.slice(0, 2).join(", ")}
                                {rule.servicios.length > 2 && ` +${rule.servicios.length - 2}`} · {rule.categorias?.length || 0} categorías
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <RuleQuickViewPanel
          rule={quickViewRule}
          open={!!quickViewRule}
          onOpenChange={(open) => !open && setQuickViewRule(null)}
          // trigger={quickViewTrigger}
        />
      </TooltipProvider>
    );
  }

  // Variante D: Vinculada pero todas las reglas inactivas
  if (allRulesInactive) {
    return (
      <TooltipProvider>
        <div className="space-y-4">
          <div className="h-px bg-[#E5E7EB]" />
          
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <h3 className="text-xs font-medium text-[#8D939D] tracking-wide">VINCULACIÓN CON REGLAS</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-[#8D939D] hover:text-[#233155] transition-colors">
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px]">
                  <p className="text-xs">Las categorías se detectan solo en las llamadas que cumplan las condiciones de las reglas a las que están vinculadas.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-[#8D939D] flex items-center gap-2">
                <span>⏸️</span>
                <span>En {linkedRules.length} {linkedRules.length === 1 ? 'regla (inactiva)' : 'reglas (inactivas)'}</span>
              </p>
            </div>

            <div className="space-y-2 mb-4">
              {linkedRules.map((rule) => (
                <div 
                  key={rule.id} 
                  className="bg-white border border-[#E5E7EB] rounded-lg p-3 transition-all duration-200 hover:border-[#60D3E4] hover:shadow-md hover:bg-[#F9FCFD] group relative"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('.unlink-button')) {
                        handleViewRule(rule.id, e);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <FileText size={16} className="text-[#8D939D] mt-1 group-hover:text-[#60D3E4] transition-colors" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-[#233155] group-hover:text-[#60D3E4] transition-colors">{rule.name}</p>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            ⏸️ Inactiva
                          </span>
                        </div>
                        <p className="text-xs text-[#8D939D]">
                          Esta regla está desactivada
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlinkRule(rule.id);
                      }}
                      className="unlink-button opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded hover:bg-red-50 text-[#8D939D] hover:text-red-600"
                      aria-label="Desvincular"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowAddToRule(true)}
              variant="outline"
              size="sm"
              className="w-full border-[#60D3E4] text-[#60D3E4] hover:bg-[#60D3E4] hover:text-white"
            >
              + Añadir a otra regla
            </Button>

            {showAddToRule && (
              <div className="mt-4 space-y-3">
                <Select value={selectedRuleId} onValueChange={handleSelectRule}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar regla..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Input de búsqueda dentro del dropdown */}
                    <div className="px-2 pb-2 pt-1 border-b border-[#E5E7EB]">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar regla..."
                        className="h-8"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    {/* Lista de reglas */}
                    <div className="max-h-[300px] overflow-y-auto">
                      {availableRules.length === 0 ? (
                        <div className="p-2 text-sm text-[#8D939D] text-center">
                          {searchQuery ? "No se encontraron reglas" : "No hay más reglas disponibles"}
                        </div>
                      ) : (
                        availableRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id.toString()}>
                            <div className="flex flex-col items-start py-1">
                              <div className="flex items-center gap-2">
                                <FileText size={14} />
                                <span className="font-medium">{rule.name}</span>
                              </div>
                              <span className="text-xs text-[#8D939D]">
                                Servicios: {rule.servicios.slice(0, 2).join(", ")}
                                {rule.servicios.length > 2 && ` +${rule.servicios.length - 2}`} · {rule.categorias?.length || 0} categorías
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <RuleQuickViewPanel
          rule={quickViewRule}
          open={!!quickViewRule}
          onOpenChange={(open) => !open && setQuickViewRule(null)}
          // trigger={quickViewTrigger}
        />
      </TooltipProvider>
    );
  }

  return (
    <>
      {/* Si no hay linkedRules pero el código llega aquí, retornar null */}
      {null}
      
      {/* Quick View Panel - se superpone sin cerrar el panel de categoría */}
      <RuleQuickViewPanel
        rule={quickViewRule}
        open={!!quickViewRule}
        onOpenChange={(open) => !open && setQuickViewRule(null)}
        // trigger={quickViewTrigger}
      />
    </>
  );
}