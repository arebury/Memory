import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Mic } from "lucide-react";

import { Modal } from "./ui/modal";

interface TranscriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  duration: string;
  onConfirm: () => Promise<void>;
}

/**
 * TranscriptionRequestModal · ported to SC Modal system (audit A1)
 *
 * Single confirmation step before kicking off a transcription on the
 * conversation currently open in the player. Cost is communicated
 * inline (`text-sc-cost-warn`) — same pattern as BulkTranscriptionModal,
 * which avoids the yellow alert box for single-line warnings.
 *
 * Diarización was removed from product (no longer a separate step or
 * option) so this modal has no toggle — it's a plain confirmation.
 */
export function TranscriptionRequestModal({
  isOpen,
  onClose,
  duration,
  onConfirm,
}: TranscriptionRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error state on open / close so it doesn't bleed between sessions.
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar la transcripción. Inténtalo de nuevo.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <Modal.Content
        width={460}
        showClose={!isLoading}
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
        onPointerDownOutside={(e) => isLoading && e.preventDefault()}
      >
        <Modal.Header
          icon={<Mic className="size-full" strokeWidth={1.75} />}
          title="Solicitar transcripción"
          subtitle={`Grabación de ${duration}`}
        />

        <Modal.Body>
          <p className="text-sc-base text-sc-body leading-[var(--sc-line-height-body2)]">
            Se transcribirá la conversación seleccionada. Te avisaremos cuando
            esté lista.
          </p>
          <p className="mt-2 text-sc-base font-normal leading-[var(--sc-line-height-body2)] text-sc-cost-warn">
            Genera coste · tarda unos segundos
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-sc-md border border-sc-error-base bg-sc-error-soft px-3 py-2"
            >
              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0 text-sc-error-strong"
              />
              <p className="text-sc-sm leading-[18px] text-sc-error-strong">
                {error}
              </p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Modal.Cancel disabled={isLoading}>Cerrar</Modal.Cancel>
          <Modal.Action
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[120px] transition-transform active:scale-[0.98] disabled:active:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Procesando…
              </>
            ) : (
              "Transcribir"
            )}
          </Modal.Action>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
