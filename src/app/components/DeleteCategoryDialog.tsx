import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Category } from "./CategoriesContext";

interface DeleteCategoryDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onArchive?: () => void;
}

export function DeleteCategoryDialog({ category, open, onOpenChange, onConfirm, onArchive }: DeleteCategoryDialogProps) {
  if (!category) return null;

  const hasUsage = category.usedInRules > 0 || category.classifiedCalls > 0;

  const handleArchive = () => {
    if (onArchive) {
      onArchive();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar '{category.name}'?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              {hasUsage ? (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">⚠️</span>
                      <div className="space-y-3">
                        <p className="text-sm text-[#233155]">
                          Esta categoría se está usando en:
                        </p>
                        <ul className="text-sm text-[#233155] space-y-1 list-disc list-inside">
                          {category.usedInRules > 0 && (
                            <li>{category.usedInRules} {category.usedInRules === 1 ? 'regla de clasificación' : 'reglas de clasificación'}</li>
                          )}
                          {category.classifiedCalls > 0 && (
                            <li>{category.classifiedCalls} {category.classifiedCalls === 1 ? 'llamada clasificada' : 'llamadas clasificadas'}</li>
                          )}
                        </ul>
                        <div className="space-y-2 pt-2">
                          <p className="text-sm text-[#233155] font-medium">Si la eliminas:</p>
                          <ul className="text-sm text-[#233155] space-y-1 list-disc list-inside">
                            <li>Se eliminará de todas las reglas (pueden dejar de funcionar)</li>
                            <li>Los datos históricos de llamadas perderán esta etiqueta</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#8D939D]">
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="bg-[#EEFBFD] border border-[#60D3E4]/30 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-xl">💡</span>
                      <div>
                        <p className="text-sm text-[#233155] font-medium mb-1">
                          ¿Prefieres archivarla?
                        </p>
                        <p className="text-sm text-[#387983]">
                          La categoría dejará de estar disponible pero se mantendrán los datos históricos.
                        </p>
                      </div>
                    </div>
                    {onArchive && (
                      <Button
                        onClick={handleArchive}
                        variant="outline"
                        size="sm"
                        className="w-full border-[#60D3E4] text-[#60D3E4] hover:bg-[#60D3E4] hover:text-white"
                      >
                        Archivar en su lugar
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#8D939D]">
                  Esta categoría se eliminará permanentemente. Esta acción no se puede deshacer.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Eliminar categoría
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}