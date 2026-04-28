import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { 
  X, 
  HelpCircle,
  ChevronDown,
  FileText
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useCategories, Category } from "./CategoriesContext";

interface CreateCategoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: "complaint" | "churn" | "competitor" | "incident" | null;
}

const TEMPLATE_DATA = {
  complaint: {
    name: "Queja",
    description: "Llamadas donde los clientes expresan insatisfacción, frustración o presentan quejas sobre el servicio, productos o experiencias vividas. Incluye reclamaciones formales y expresiones de descontento."
  },
  churn: {
    name: "Intención de baja",
    description: "Llamadas donde el cliente manifiesta su deseo de cancelar el servicio, darse de baja o terminar la relación comercial. Incluye amenazas de baja y solicitudes formales de cancelación."
  },
  competitor: {
    name: "Competencia",
    description: "Llamadas donde se mencionan empresas competidoras, comparaciones de precios o servicios, ofertas de la competencia o intención de cambiar de proveedor por una alternativa del mercado."
  },
  incident: {
    name: "Incidencia",
    description: "Llamadas reportando problemas técnicos, fallos en el servicio, averías, errores en sistemas o cualquier situación que requiera intervención técnica o resolución de incidentes."
  }
};

export function CreateCategoryPanel({ open, onOpenChange, template }: CreateCategoryPanelProps) {
  const { addCategory, categories } = useCategories();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);

  const [errors, setErrors] = useState({
    name: "",
    description: ""
  });

  const templates = [
    {
      id: "complaint" as const,
      icon: "😤",
      title: "Queja",
      description: "Cliente expresa insatisfacción"
    },
    {
      id: "churn" as const,
      icon: "🚨",
      title: "Intención de baja",
      description: "Cliente quiere cancelar servicio"
    },
    {
      id: "competitor" as const,
      icon: "🏢",
      title: "Competencia",
      description: "Menciona otras empresas"
    },
    {
      id: "incident" as const,
      icon: "🔧",
      title: "Incidencia",
      description: "Reporta problemas técnicos"
    }
  ];

  const handleTemplateClick = (templateId: typeof templates[number]["id"]) => {
    setSelectedTemplate(templateId);
    if (TEMPLATE_DATA[templateId]) {
      setName(TEMPLATE_DATA[templateId].name);
      setDescription(TEMPLATE_DATA[templateId].description);
      setErrors({ name: "", description: "" });
    }
    setShowTemplatesDialog(false);
  };

  useEffect(() => {
    if (open) {
      // Reset form
      if (template && TEMPLATE_DATA[template]) {
        setName(TEMPLATE_DATA[template].name);
        setDescription(TEMPLATE_DATA[template].description);
        setSelectedTemplate(template);
      } else {
        setName("");
        setDescription("");
        setSelectedTemplate(null);
      }
      setGroup("");
      setIsActive(true);
      setShowAdvanced(false);
      setErrors({ name: "", description: "" });
    }
  }, [open, template]);

  const validateName = (value: string) => {
    if (!value.trim()) {
      return "Dale un nombre a tu categoría";
    }
    if (value.length > 50) {
      return "Máximo 50 caracteres";
    }
    if (categories.some(cat => cat.name.toLowerCase() === value.toLowerCase())) {
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

    addCategory({
      name,
      description,
      group,
      isActive,
      isTemplate: !!template
    });

    toast.success("Categoría creada correctamente", {
      action: {
        label: "Crear otra",
        onClick: () => {
          setName("");
          setDescription("");
          setGroup("");
          setIsActive(true);
          setShowAdvanced(false);
          setErrors({ name: "", description: "" });
        }
      }
    });

    setIsSaving(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    const hasChanges = name || description;
    if (hasChanges) {
      setShowDiscardDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[40%] min-w-[500px] p-0 flex flex-col">
          <SheetTitle className="sr-only">Crear Categoría IA</SheetTitle>
          <SheetDescription className="sr-only">
            Crea una nueva categoría para clasificar llamadas automáticamente
          </SheetDescription>

          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium text-[#1C283D]">
                Crear Categoría IA
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-[#60D3E4] hover:text-[#4FC3D3] hover:bg-[#EEFBFD]"
                    onClick={() => setShowTemplatesDialog(true)}
                    aria-label="Ver plantillas"
                  >
                    <FileText size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-sm">Usar plantilla predefinida</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClose}>
              <X size={16} />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Formulario de creación */}
              <div className="space-y-4">
                {/* Badge si hay plantilla seleccionada */}
                {selectedTemplate && (
                  <div className="bg-[#EEFBFD] border border-[#60D3E4]/30 rounded-lg px-3 py-2 text-sm text-[#387983] flex items-center justify-between">
                    <span>📋 Plantilla aplicada — personaliza según tus necesidades</span>
                    <button
                      onClick={() => {
                        setSelectedTemplate(null);
                        setName("");
                        setDescription("");
                        setErrors({ name: "", description: "" });
                      }}
                      className="text-xs text-[#60D3E4] hover:text-[#4FC3D3] underline"
                    >
                      Limpiar
                    </button>
                  </div>
                )}

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="category-name" className="text-[#233155]">
                    Nombre de la categoría <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="category-name"
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
                    <Label htmlFor="category-description" className="text-[#233155]">
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
                    id="category-description"
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
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !!errors.name || !!errors.description}
              className="bg-[#60D3E4] hover:bg-[#4FC3D3] text-white"
            >
              {isSaving ? "Guardando..." : "Guardar categoría"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog de plantillas */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Plantillas predefinidas</DialogTitle>
            <DialogDescription>
              Selecciona una plantilla para empezar rápido. Podrás personalizarla después.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleTemplateClick(tpl.id)}
                className="bg-white border border-[#E5E7EB] rounded-lg p-4 cursor-pointer hover:border-[#60D3E4] hover:shadow-md transition-all text-left group"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-2xl">{tpl.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-[#233155] mb-1">{tpl.title}</div>
                    <div className="text-xs text-[#8D939D] leading-snug">{tpl.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Discard changes dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Los cambios que has hecho no se guardarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir editando</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowDiscardDialog(false);
              onOpenChange(false);
            }}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
