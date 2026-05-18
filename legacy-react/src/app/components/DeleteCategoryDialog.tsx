import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Category } from "./CategoriesContext";

interface DeleteCategoryDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onArchive?: () => void;
}

export function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
  onConfirm,
  onArchive,
}: DeleteCategoryDialogProps) {
  if (!category) return null;

  const hasUsage = category.usedInRules > 0 || category.classifiedCalls > 0;

  const handleArchive = () => {
    if (onArchive) onArchive();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Content width={520}>
        <Modal.Header
          icon={<AlertTriangle className="size-full" strokeWidth={1.75} />}
          title={`¿Eliminar '${category.name}'?`}
        />

        <Modal.Body className="space-y-4">
          {hasUsage ? (
            <>
              <div className="bg-sc-warning-soft border border-sc-warning-strong/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-sc-warning-soft text-sc-warning-strong">
                    <AlertTriangle size={16} strokeWidth={1.7} />
                  </span>
                  <div className="space-y-3">
                    <p className="text-sm text-sc-primary">
                      Esta categoría se está usando en:
                    </p>
                    <ul className="text-sm text-sc-primary space-y-1 list-disc list-inside">
                      {category.usedInRules > 0 && (
                        <li>
                          {category.usedInRules}{" "}
                          {category.usedInRules === 1 ? "regla de clasificación" : "reglas de clasificación"}
                        </li>
                      )}
                      {category.classifiedCalls > 0 && (
                        <li>
                          {category.classifiedCalls}{" "}
                          {category.classifiedCalls === 1 ? "llamada clasificada" : "llamadas clasificadas"}
                        </li>
                      )}
                    </ul>
                    <div className="space-y-2 pt-2">
                      <p className="text-sm text-sc-primary font-medium">Si la eliminas:</p>
                      <ul className="text-sm text-sc-primary space-y-1 list-disc list-inside">
                        <li>Se eliminará de todas las reglas (pueden dejar de funcionar)</li>
                        <li>Los datos históricos de llamadas perderán esta etiqueta</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-sc-muted">Esta acción no se puede deshacer.</p>
              <div className="bg-sc-accent-soft border border-sc-accent/30 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Lightbulb size={20} strokeWidth={1.7} className="shrink-0 text-sc-accent-strong mt-0.5" />
                  <div>
                    <p className="text-sm text-sc-primary font-medium mb-1">
                      ¿Prefieres archivarla?
                    </p>
                    <p className="text-sm text-sc-accent-strong">
                      La categoría dejará de estar disponible pero se mantendrán los datos históricos.
                    </p>
                  </div>
                </div>
                {onArchive && (
                  <Button
                    onClick={handleArchive}
                    variant="outline"
                    size="sm"
                    className="w-full border-sc-accent text-sc-accent hover:bg-sc-accent hover:text-white"
                  >
                    Archivar en su lugar
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-sc-muted">
              Esta categoría se eliminará permanentemente. Esta acción no se puede deshacer.
            </p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Modal.Cancel>Cancelar</Modal.Cancel>
          <Modal.Action
            onClick={onConfirm}
            className="bg-sc-error-strong hover:bg-sc-error-strong/90 text-white"
          >
            Eliminar categoría
          </Modal.Action>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
