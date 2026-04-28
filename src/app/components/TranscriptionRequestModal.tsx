import { useState } from "react";
import { X, Mic, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface TranscriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: string;
  onConfirm: (options: { diarization: boolean }) => Promise<void>;
}

export function TranscriptionRequestModal({
  isOpen,
  onClose,
  duration,
  onConfirm,
}: TranscriptionRequestModalProps) {
  const [diarization, setDiarization] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm({ diarization });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setDiarization(false);
      onClose();
    }
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
          <h2 className="font-semibold text-[#233155]">Solicitar transcripción</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-[#8D939D] hover:text-[#233155] transition-colors disabled:opacity-40 rounded-md p-0.5"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Recording info */}
          <div className="flex items-center gap-2.5 text-sm text-[#5F6776]">
            <Mic size={14} className="text-[#8D939D] shrink-0" />
            <span>Grabación de {duration}</span>
          </div>

          {/* Cost warning */}
          <div className="flex items-start gap-3 bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-lg px-3.5 py-3">
            <AlertTriangle size={14} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <p className="text-sm text-[#92400E]">Este proceso generará costes de transcripción.</p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {/* Transcription – always checked, disabled */}
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-[#E5E7EB] bg-[#F4F6FC] cursor-not-allowed">
              <Checkbox
                checked={true}
                disabled
                className="data-[state=checked]:bg-[#233155] data-[state=checked]:border-[#233155] opacity-60"
              />
              <span className="text-sm text-[#5F6776]">Transcripción</span>
            </div>

            {/* Diarization – optional */}
            <label
              className={`flex items-start gap-3 px-3.5 py-3 rounded-lg border transition-colors cursor-pointer ${
                diarization
                  ? "border-[#60D3E4] bg-[#EEFBFD]"
                  : "border-[#E5E7EB] hover:border-[#A3A8B0] bg-white"
              }`}
            >
              <Checkbox
                checked={diarization}
                onCheckedChange={(v) => setDiarization(!!v)}
                className="mt-0.5 data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4]"
              />
              <div>
                <p className="text-sm text-[#233155]">Diarización</p>
                <p className="text-xs text-[#8D939D] mt-0.5">
                  Identifica qué agente habla en cada momento.
                </p>
              </div>
            </label>
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
            className="bg-[#233155] hover:bg-[#1C283D] text-white gap-2 min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Procesando...
              </>
            ) : (
              "Transcribir"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
