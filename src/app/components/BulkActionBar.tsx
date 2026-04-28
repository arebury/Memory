import { useState } from "react";
import { FileText, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Conversation } from "../data/mockData";
import { BulkTranscriptionModal } from "./BulkTranscriptionModal";

interface BulkActionBarProps {
  selectedIds: string[];
  allConversations: Conversation[];
  filteredConversations: Conversation[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  onRequestTranscription: (ids: string[]) => void;
}

export function BulkActionBar({
  selectedIds,
  allConversations,
  filteredConversations,
  onClearSelection,
  onSelectAll,
  onRequestTranscription,
}: BulkActionBarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const hasSelection = selectedIds.length > 0;
  const allSelected =
    filteredConversations.length > 0 &&
    filteredConversations.every((c) => selectedIds.includes(c.id));
  const someSelected = hasSelection && !allSelected;

  const selectedConversations = allConversations.filter((c) =>
    selectedIds.includes(c.id)
  );

  const handleCheckboxChange = () => {
    if (hasSelection) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  const handleConfirm = async (
    _opts: { includeAnalysis: boolean },
    eligibleIds: string[]
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onRequestTranscription(eligibleIds);
    setModalOpen(false);
    onClearSelection();
  };

  return (
    <>
      {/*
        The bar ALWAYS reserves space in the layout.
        Only opacity + pointer-events change — never height or position.
      */}
      <div className="h-11 bg-white border-b border-[#CFD3DE] px-6 shrink-0">
        <div
          className={`flex items-center justify-between h-full transition-opacity duration-200 ${
            hasSelection
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Left — checkbox + count */}
          <div className="flex items-center gap-3">
            <Checkbox
              checked={someSelected ? "indeterminate" : allSelected}
              onCheckedChange={handleCheckboxChange}
              className="border-[#A3A8B0]"
            />
            <span className="text-sm text-[#233155]">
              <span className="font-medium">{selectedIds.length}</span>
              <span className="text-[#5F6776]">
                {" "}
                seleccionada{selectedIds.length !== 1 ? "s" : ""}
              </span>
            </span>
          </div>

          {/* Right — direct action button + clear */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(true)}
              className="h-8 px-3 gap-1.5 text-sm border-[#D2D6E0] text-[#233155] hover:bg-[#F4F6FC]"
            >
              <FileText size={14} className="text-[#5F6776]" />
              Transcribir selección
            </Button>

            <button
              onClick={onClearSelection}
              className="h-8 w-8 flex items-center justify-center rounded-md text-[#8D939D] hover:text-[#233155] hover:bg-[#F4F6FC] transition-colors"
              aria-label="Descartar selección"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk modal — rendered at root level */}
      {modalOpen && (
        <BulkTranscriptionModal
          isOpen
          onClose={() => setModalOpen(false)}
          selectedConversations={selectedConversations}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
