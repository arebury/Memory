import { useState } from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface RetranscriptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function RetranscriptionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: RetranscriptionConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValid = confirmText === "CONFIRMAR";

  const handleConfirm = async () => {
    if (!isValid) return;
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setConfirmText("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[440px]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#233155]">Re-transcribir conversación</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[#8D939D] hover:text-[#233155] transition-colors disabled:opacity-40 rounded-md p-0.5"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Destructive warning */}
          <div className="flex items-start gap-3 bg-[#FFF1F2] border border-[#F43F5E]/30 rounded-lg px-3.5 py-3">
            <AlertTriangle size={14} className="text-[#F43F5E] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm text-[#881337]">
                Esta acción reemplazará la transcripción existente.
              </p>
              <p className="text-xs text-[#9F1239]">
                La transcripción actual y todos sus análisis derivados se eliminarán y se
                generará una nueva. Este proceso generará costes adicionales.
              </p>
            </div>
          </div>

          {/* Confirmation input */}
          <div className="space-y-2">
            <label className="block text-sm text-[#5F6776]">
              Escribe{" "}
              <span className="font-mono font-semibold text-[#233155] tracking-widest">
                CONFIRMAR
              </span>{" "}
              para continuar:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isLoading}
              placeholder="CONFIRMAR"
              autoFocus
              className={`w-full h-9 px-3 text-sm rounded-lg border transition-colors outline-none font-mono tracking-wider ${
                confirmText && !isValid
                  ? "border-[#F43F5E]/50 bg-[#FFF1F2]"
                  : isValid
                  ? "border-[#10B981] bg-[#F0FDF4]"
                  : "border-[#D2D6E0] focus:border-[#60D3E4]"
              }`}
            />
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
            disabled={!isValid || isLoading}
            className="bg-[#F43F5E] hover:bg-[#E11D48] text-white gap-2 min-w-[140px] disabled:opacity-30"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Procesando...
              </>
            ) : (
              "Re-transcribir"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
