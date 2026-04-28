import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { FileText, Sparkles, ChevronDown, Zap } from "lucide-react";
import { Conversation } from "../data/mockData";
import { RuleSelectionModal } from "./RuleSelectionModal";
import { toast } from "sonner@2.0.3";

interface ApplyRulesButtonProps {
  selectedIds: string[];
  conversations: Conversation[]; // Current filtered conversations or all, to lookup by ID
  onClearSelection: () => void;
  onNavigateToRuleCreation?: (type: "transcription" | "classification") => void; // Optional if we want to support redirect
}

export function ApplyRulesButton({ 
  selectedIds, 
  conversations, 
  onClearSelection,
  onNavigateToRuleCreation 
}: ApplyRulesButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"transcription" | "classification">("transcription");

  // Get selected conversation objects
  const selectedConversations = conversations.filter(c => selectedIds.includes(c.id));

  // Determine eligibility counts
  const eligibleForTranscription = selectedConversations.filter(c => c.hasRecording && !c.hasTranscription).length;
  const eligibleForClassification = selectedConversations.filter(c => c.hasTranscription && !c.hasClassificationRule).length; // Using hasClassificationRule as proxy

  const handleOpenModal = (type: "transcription" | "classification") => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleApplyRule = (ruleId: string, ruleName: string) => {
    const count = modalType === "transcription" ? eligibleForTranscription : eligibleForClassification;
    
    // 1. Show Progress Toast
    const toastId = toast.loading(
      <div className="flex items-center gap-2">
        <span>{modalType === "transcription" ? "Transcribiendo" : "Clasificando"} {count} conversaciones con '{ruleName}'...</span>
      </div>,
      { position: "bottom-right" }
    );

    // 2. Mock Async Process
    setTimeout(() => {
      // 3. Show Success Toast (dismiss loading)
      toast.dismiss(toastId);
      toast.success(
        <div className="flex items-center gap-2">
          <span>{count} conversaciones {modalType === "transcription" ? "transcritas" : "clasificadas"} correctamente</span>
        </div>,
        { 
          duration: 4000,
          position: "bottom-right",
          icon: <div className="bg-green-100 text-green-600 rounded-full p-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
        }
      );

      // 4. Update UI State (Clear Selection)
      onClearSelection();
      
      // Note: In a real app, we would also trigger a data refresh here
    }, 2000);
  };

  const isDisabled = selectedIds.length === 0;

  return (
    <>
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={isDisabled}
                  variant="ghost"
                  className={`h-9 px-3 gap-2 transition-all font-medium ${
                    isDisabled
                      ? 'text-[#9CA3AF] cursor-not-allowed hover:bg-transparent' 
                      : 'text-[#60D3E4] hover:text-[#4FC3D3] hover:bg-[#EEFBFD]'
                  }`}
                >
                  <Zap size={16} className={isDisabled ? "" : "fill-current"} />
                  <span>Aplicar reglas</span>
                  <ChevronDown size={14} strokeWidth={2} />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Aplicar reglas</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              disabled={eligibleForTranscription === 0}
              onClick={() => handleOpenModal("transcription")}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <FileText size={16} className="text-[#60D3E4]" />
                <span className="font-medium text-[#233155]">Transcribir</span>
              </div>
              <span className="text-xs text-[#8D939D] pl-6">
                {eligibleForTranscription} de {selectedIds.length} elegibles
              </span>
            </DropdownMenuItem>
            
            <DropdownMenuItem
              disabled={eligibleForClassification === 0}
              onClick={() => handleOpenModal("classification")}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <Sparkles size={16} className="text-[#60D3E4]" />
                <span className="font-medium text-[#233155]">Clasificar con IA</span>
              </div>
              <span className="text-xs text-[#8D939D] pl-6">
                {eligibleForClassification} de {selectedIds.length} elegibles
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      <RuleSelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        selectedConversations={selectedConversations}
        onApply={handleApplyRule}
        onNavigateToRuleCreation={(type) => {
            // Mock navigation or use the callback if provided
            console.log(`Navigating to create rule: ${type}`);
            if (onNavigateToRuleCreation) onNavigateToRuleCreation(type);
        }}
      />
    </>
  );
}
