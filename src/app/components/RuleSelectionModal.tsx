import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  FileText, 
  Sparkles,
  FileQuestion
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";
import { Conversation } from "../data/mockData";

interface RuleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "transcription" | "classification";
  selectedConversations: Conversation[];
  onApply: (ruleId: string, ruleName: string) => void;
  onNavigateToRuleCreation: (type: "transcription" | "classification") => void;
}

interface MockRule {
  id: string;
  name: string;
  active: boolean;
  description?: string;
}

// Mock rules for demonstration
const MOCK_TRANSCRIPTION_RULES: MockRule[] = [
  { id: "tr-1", name: "Transcripción Estándar (Español)", active: true, description: "Modelo general para castellano" },
  { id: "tr-2", name: "Transcripción Alta Precisión", active: true, description: "Mayor coste, mejor calidad" },
  { id: "tr-3", name: "Transcripción Inglés", active: false, description: "Model en-US" },
];

const MOCK_CLASSIFICATION_RULES: MockRule[] = [
  { id: "cl-1", name: "Detección de Sentimiento", active: true, description: "Positivo, Negativo, Neutro" },
  { id: "cl-2", name: "Categorización Comercial", active: true, description: "Ventas, Soporte, Reclamaciones" },
  { id: "cl-3", name: "Alertas de Calidad", active: false, description: "Insultos, amenazas, etc." },
];

export function RuleSelectionModal({
  isOpen,
  onClose,
  type,
  selectedConversations,
  onApply,
  onNavigateToRuleCreation
}: RuleSelectionModalProps) {
  const [selectedRuleId, setSelectedRuleId] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Get available rules based on type
  // For demo purposes, we always return rules. 
  // To test empty state, you could temporarily return [] here.
  const rules = type === "transcription" ? MOCK_TRANSCRIPTION_RULES : MOCK_CLASSIFICATION_RULES;

  // Filter rules to show active ones first
  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));
  }, [rules]);

  // Determine eligibility
  const eligibleConversations = selectedConversations.filter(conv => {
    if (type === "transcription") {
      return conv.hasRecording && !conv.hasTranscription;
    } else {
      return conv.hasTranscription && !conv.hasClassificationRule; // Assuming 'hasClassificationRule' means it has been classified or has a rule applied
    }
  });

  const nonEligibleConversations = selectedConversations.filter(conv => !eligibleConversations.includes(conv));
  
  const eligibleCount = eligibleConversations.length;
  const totalCount = selectedConversations.length;

  // Group non-eligible reasons
  const reasons = nonEligibleConversations.reduce((acc, conv) => {
    let reason = "";
    if (type === "transcription") {
      if (!conv.hasRecording) reason = "No tienen grabación";
      else if (conv.hasTranscription) reason = "Ya están transcritas";
      else reason = "No elegible";
    } else {
      if (!conv.hasTranscription) reason = "No tienen transcripción";
      else if (conv.hasClassificationRule) reason = "Ya están clasificadas"; // Using hasClassificationRule as proxy for "already classified"
      else reason = "No elegible";
    }
    
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Pre-select first active rule
  useEffect(() => {
    if (isOpen && sortedRules.length > 0) {
      const firstActive = sortedRules.find(r => r.active);
      if (firstActive) setSelectedRuleId(firstActive.id);
    }
  }, [isOpen, sortedRules]);

  const handleApply = () => {
    const rule = rules.find(r => r.id === selectedRuleId);
    if (rule) {
      onApply(rule.id, rule.name);
      onClose();
    }
  };

  const isEmptyState = rules.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-[#E5E7EB]">
          <DialogTitle className="text-[#233155] text-lg font-semibold flex items-center gap-2">
            {type === "transcription" ? (
              <FileText className="text-[#60D3E4]" size={20} />
            ) : (
              <Sparkles className="text-[#60D3E4]" size={20} />
            )}
            {type === "transcription" ? "Transcribir conversaciones" : "Clasificar conversaciones con IA"}
          </DialogTitle>
          <DialogDescription className="sr-only">
             Seleccione y aplique reglas de {type === "transcription" ? "transcripción" : "clasificación"}
          </DialogDescription>
        </DialogHeader>

        {isEmptyState ? (
          // Empty State
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#F4F6FC] rounded-full flex items-center justify-center mb-4">
              <FileQuestion size={32} className="text-[#8D939D]" />
            </div>
            <h3 className="text-[#233155] font-medium text-lg mb-2">
              No hay reglas de {type === "transcription" ? "transcripción" : "clasificación"}
            </h3>
            <p className="text-[#8D939D] text-sm mb-6 max-w-[280px]">
              Crea una regla para poder aplicarla a tus conversaciones seleccionadas.
            </p>
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  onNavigateToRuleCreation(type);
                  onClose();
                }} 
                className="flex-1 bg-[#60D3E4] hover:bg-[#4FC3D3] text-white"
              >
                Crear regla
              </Button>
            </div>
          </div>
        ) : (
          // Normal State
          <div className="flex flex-col">
            <div className="px-6 py-4 space-y-4">
              {/* Eligibility Summary */}
              <div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl font-bold text-[#60D3E4]">{eligibleCount}</span>
                  <span className="text-[#5F6776]">de {totalCount} seleccionadas son elegibles</span>
                </div>

                {/* Non-eligible details */}
                {Object.keys(reasons).length > 0 && (
                  <Collapsible
                    open={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                    className="bg-[#F4F6FC] rounded-lg px-3 py-2 border border-[#E5E7EB]"
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs text-[#5F6776] hover:text-[#233155] w-full group">
                      <AlertCircle size={14} className="text-[#8D939D] group-hover:text-[#233155]" />
                      <span className="font-medium">¿Por qué no todas?</span>
                      {isDetailsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 space-y-1">
                      {Object.entries(reasons).map(([reason, count]) => (
                        <div key={reason} className="flex items-center justify-between text-xs text-[#8D939D] pl-6">
                          <span>{reason}</span>
                          <span className="font-medium bg-white px-1.5 rounded border border-[#E5E7EB]">{count}</span>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>

              {/* Rule Selector */}
              <div className="pt-2">
                <Label className="text-sm font-medium text-[#233155] mb-3 block">
                  Selecciona una regla de {type === "transcription" ? "transcripción" : "clasificación"}:
                </Label>
                
                <ScrollArea className="h-[200px] pr-2 -mr-2">
                  <RadioGroup value={selectedRuleId} onValueChange={setSelectedRuleId} className="gap-2">
                    {sortedRules.map((rule) => (
                      <div key={rule.id}>
                        <RadioGroupItem
                          value={rule.id}
                          id={rule.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={rule.id}
                          className={`
                            flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all
                            ${selectedRuleId === rule.id 
                              ? "border-[#60D3E4] bg-[#F0FBFC]" 
                              : "border-[#E5E7EB] bg-white hover:border-[#CFD3DE] hover:bg-[#F9FAFB]"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-4 h-4 rounded-full border flex items-center justify-center
                              ${selectedRuleId === rule.id 
                                ? "border-[#60D3E4] bg-[#60D3E4]" 
                                : "border-[#CFD3DE] bg-white"
                              }
                            `}>
                              {selectedRuleId === rule.id && <Check size={10} className="text-white" />}
                            </div>
                            <div>
                              <div className="font-medium text-[#233155] text-sm">{rule.name}</div>
                              {rule.description && (
                                <div className="text-xs text-[#8D939D]">{rule.description}</div>
                              )}
                            </div>
                          </div>
                          {rule.active && (
                            <span className="text-[10px] font-medium text-[#27AE60] bg-[#E8F8F0] px-2 py-0.5 rounded-full">
                              Activa
                            </span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </ScrollArea>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
              <Button variant="outline" onClick={onClose} className="h-9">
                Cancelar
              </Button>
              <Button 
                onClick={handleApply} 
                disabled={!selectedRuleId || eligibleCount === 0}
                className="bg-[#60D3E4] hover:bg-[#4FC3D3] text-white h-9 px-6"
              >
                Aplicar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
