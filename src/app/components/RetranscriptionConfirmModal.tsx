import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Loader2, RotateCcw } from "lucide-react";

import { Modal } from "./ui/modal";
import { cn } from "./ui/utils";

interface RetranscriptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * RetranscriptionConfirmModal · ported to SC Modal system (audit A1)
 *
 * Destructive variant: re-running transcription wipes the existing
 * transcript and any derived analysis. We keep the red destructive box
 * (multi-line warning + data-loss claim) — the inline cost cue is
 * insufficient here per the design system rule (yellow / red boxes are
 * reserved for warnings with two-or-more lines or destructive intent).
 *
 * The "type CONFIRMAR" gate guards against accidental clicks.
 */
export function RetranscriptionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: RetranscriptionConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = confirmText === "CONFIRMAR";

  useEffect(() => {
    if (!isOpen) {
      setConfirmText("");
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar la re-transcripción. Inténtalo de nuevo.",
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
          icon={<RotateCcw className="size-full" strokeWidth={1.75} />}
          title="Re-transcribir conversación"
          subtitle="Acción destructiva"
        />

        <Modal.Body>
          {/* Destructive warning — multi-line, justifies the red box. */}
          <div
            role="alert"
            className="flex items-start gap-3 rounded-sc-md border border-sc-error-base bg-sc-error-soft px-3 py-3"
          >
            <AlertTriangle
              size={14}
              className="mt-0.5 shrink-0 text-sc-error-strong"
            />
            <div className="space-y-1">
              <p className="text-sc-base font-semibold leading-[var(--sc-line-height-body2)] text-sc-error-strong">
                Esta acción reemplazará la transcripción existente.
              </p>
              <p className="text-sc-sm leading-[18px] text-sc-body">
                La transcripción actual y todos sus análisis derivados se
                eliminarán y se generará una nueva.
              </p>
              <p className="text-sc-sm font-normal leading-[18px] text-sc-cost-warn">
                Genera coste adicional.
              </p>
            </div>
          </div>

          {/* Confirmation gate */}
          <div className="mt-4 space-y-2">
            <label className="block text-sc-sm text-sc-body">
              Escribe{" "}
              <span className="font-mono font-semibold tracking-widest text-sc-heading">
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
              className={cn(
                "h-9 w-full rounded-sc-md border bg-sc-surface px-3 font-mono text-sc-sm tracking-wider outline-none transition-colors",
                confirmText && !isValid
                  ? "border-sc-error-base bg-sc-error-soft"
                  : isValid
                    ? "border-sc-success-strong bg-sc-success-soft"
                    : "border-sc-border focus:border-sc-accent",
              )}
            />
          </div>

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
            disabled={!isValid || isLoading}
            className="min-w-[140px] !bg-sc-error-strong hover:!bg-sc-error-strong/90 transition-transform active:scale-[0.98] disabled:active:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="mr-2 animate-spin" />
                Procesando…
              </>
            ) : (
              "Re-transcribir"
            )}
          </Modal.Action>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
