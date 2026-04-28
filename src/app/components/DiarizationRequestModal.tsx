import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface DiarizationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DiarizationRequestModal({
  isOpen,
  onClose,
  onConfirm,
}: DiarizationRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[420px]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#233155]">Generar diarización</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[#8D939D] hover:text-[#233155] transition-colors disabled:opacity-40 rounded-md p-0.5"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Description */}
          <p className="text-sm text-[#5F6776]">
            Identifica qué agente habla en cada momento de la conversación transcrita.
          </p>

          {/* Cost warning */}
          <div className="flex items-start gap-3 bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-lg px-3.5 py-3">
            <AlertTriangle size={14} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <p className="text-sm text-[#92400E]">Este proceso generará costes adicionales.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#E5E7EB]">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-[#D2D6E0] text-[#5F6776] hover:bg-[#F4F6FC]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-[#233155] hover:bg-[#1C283D] text-white gap-2 min-w-[160px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Procesando...
              </>
            ) : (
              "Generar diarización"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
