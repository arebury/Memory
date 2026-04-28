import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  X, 
  HelpCircle,
  // ChevronDown, // Eliminado - no hay opciones avanzadas
  MoreVertical,
  Copy,
  Link,
  Trash2
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"; // Eliminado - no hay opciones avanzadas
import { useCategories, Category } from "./CategoriesContext";
import { CategoryRuleLinking } from "./CategoryRuleLinking";
import { copyToClipboard } from "../utils/clipboard";

interface EditCategoryPanelProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (category: Category) => void;
  onNavigateToRules?: (ruleId?: number, highlightSection?: string) => void;
  onCreateFirstRule?: () => void;
}

export function EditCategoryPanel({ category, open, onOpenChange, onDelete, onNavigateToRules, onCreateFirstRule }: EditCategoryPanelProps) {
  const { updateCategory, duplicateCategory, categories } = useCategories();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  // const [group, setGroup] = useState(""); // Eliminado - no necesitamos grupos
  const [isActive, setIsActive] = useState(true);
  // const [showAdvanced, setShowAdvanced] = useState(false); // Eliminado - no hay opciones avanzadas
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (category && open) {
      setName(category.name);
      setDescription(category.description);
      // setGroup(category.group || ""); // Eliminado - no necesitamos grupos
      setIsActive(category.isActive);
      // setShowAdvanced(false); // Eliminado - no hay opciones avanzadas
      setErrors({ name: "", description: "" });
    }
  }, [category, open]);

  const validateName = (value: string) => {
    if (!value.trim()) {
      return "Dale un nombre a tu categoría";
    }
    if (value.length > 50) {
      return "Máximo 50 caracteres";
    }
    if (categories.some(cat => cat.id !== category?.id && cat.name.toLowerCase() === value.toLowerCase())) {
      return `Ya existe una categoría llamada '${value}'`;
    }
    return "";
  };

  const validateDescription = (value: string) => {
    if (!value.trim()) {
      return "Añade una descripción para que la IA clasifique correctamente";
    }
    if (value.length < 20) {
      return "Añade más detalle — las descripciones muy cortas no dan suficiente contexto a la IA";
    }
    if (value.length > 500) {
      return "Máximo 500 caracteres";
    }
    return "";
  };

  const handleNameBlur = () => {
    setErrors(prev => ({ ...prev, name: validateName(name) }));
  };

  const handleDescriptionBlur = () => {
    setErrors(prev => ({ ...prev, description: validateDescription(description) }));
  };

  const handleSave = async () => {
    if (!category) return;

    const nameError = validateName(name);
    const descriptionError = validateDescription(description);

    setErrors({
      name: nameError,
      description: descriptionError
    });

    if (nameError || descriptionError) {
      return;
    }

    setIsSaving(true);

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 500));

    updateCategory(category.id, {
      name,
      description,
      // group, // Eliminado - no necesitamos grupos
      isActive
    });

    toast.success("Categoría actualizada correctamente");

    setIsSaving(false);
    onOpenChange(false);
  };

  const handleDuplicate = () => {
    if (category) {
      duplicateCategory(category.id);
      toast.success("Categoría duplicada correctamente");
      onOpenChange(false);
    }
  };

  const handleCopyLink = () => {
    if (category) {
      copyToClipboard(`${window.location.origin}/categories/${category.id}`, "Enlace copiado al portapapeles");
    }
  };

  const handleDelete = () => {
    if (category) {
      onDelete(category);
      onOpenChange(false);
    }
  };

  if (!category) return null;

  const nameChanged = name !== category.name;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[40%] min-w-[500px] p-0 flex flex-col">
        <SheetTitle className="sr-only">Editar categoría {name}</SheetTitle>
        <SheetDescription className="sr-only">
          Edita los detalles y configuración de la categoría
        </SheetDescription>

        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <h2 className="text-lg font-medium text-[#1C283D]">
            Editar categoría
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy size={16} className="mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link size={16} className="mr-2" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onOpenChange(false)}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="edit-category-name" className="text-[#233155]">
                Nombre de la categoría <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-category-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: "" }));
                  }
                }}
                onBlur={handleNameBlur}
                placeholder="Ej: Queja de facturación"
                className={errors.name ? "border-red-500" : ""}
                maxLength={50}
              />
              <div className="flex items-center justify-between">
                {errors.name ? (
                  <p className="text-sm text-red-500">{errors.name}</p>
                ) : nameChanged ? (
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    ⚠️ Cambiar el nombre actualizará cómo aparece esta categoría en todos los informes
                  </p>
                ) : (
                  <p className="text-sm text-[#8D939D]">
                    Este nombre aparecerá en los informes y al revisar llamadas.
                  </p>
                )}
                <span className="text-xs text-[#8D939D]">{name.length}/50</span>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="edit-category-description" className="text-[#233155]">
                  Descripción para la IA <span className="text-red-500">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-[#8D939D] hover:text-[#233155] transition-colors">
                      <HelpCircle size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[320px] p-4">
                    <div className="space-y-3">
                      <p className="text-sm">
                        Esta descripción enseña a la IA qué buscar. Escríbela como si explicaras a un compañero nuevo qué llamadas pertenecen aquí.
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-sm font-medium">Incluye:</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Palabras y frases que usan los clientes</li>
                          <li>Situaciones que deberían coincidir</li>
                          <li>Temas relacionados</li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-[#E5E7EB]">
                        <p className="text-xs text-[#8D939D]">
                          <strong>Ejemplo para 'Consulta de producto':</strong> "Llamadas donde clientes preguntan sobre características, precios, disponibilidad o cómo usar productos."
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="edit-category-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: "" }));
                  }
                }}
                onBlur={handleDescriptionBlur}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Llamadas donde los clientes expresan frustración por cargos, comisiones, problemas de pago o errores en facturas. Incluye menciones de cargos inesperados, solicitudes de reembolso o disputas sobre importes."
                rows={6}
                className={errors.description ? "border-red-500" : ""}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                {errors.description ? (
                  <p className="text-sm text-red-500">{errors.description}</p>
                ) : (
                  <p className="text-sm text-[#8D939D]">
                    Ayuda a la IA a entender qué llamadas pertenecen aquí. Sé específico: menciona palabras clave, situaciones y variaciones.
                  </p>
                )}
                <span className="text-xs text-[#8D939D]">{description.length}/500</span>
              </div>
            </div>

            {/* Sección de Vinculación con Reglas */}
            {onNavigateToRules && onCreateFirstRule && (
              <CategoryRuleLinking
                category={category}
                onNavigateToRules={onNavigateToRules}
                onCreateFirstRule={onCreateFirstRule}
                onClosePanel={() => onOpenChange(false)}
              />
            )}

            {/* Opciones avanzadas */}
            {/* <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-[#233155] hover:text-[#60D3E4] transition-colors">
                <ChevronDown 
                  size={16} 
                  className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                />
                Opciones avanzadas
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category-group" className="text-[#233155]">
                    Grupo <span className="text-[#8D939D]">(opcional)</span>
                  </Label>
                  <Input
                    id="edit-category-group"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="Ej: Atención al cliente"
                  />
                  <p className="text-sm text-[#8D939D]">
                    Agrupa categorías relacionadas para organizarlas mejor
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible> */}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !!errors.name || !!errors.description}
            className="bg-[#60D3E4] hover:bg-[#4FC3D3] text-white"
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}