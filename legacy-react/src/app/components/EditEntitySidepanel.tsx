import { useState, useEffect } from "react";
import { Entity, EntityType } from "./EntitiesContext";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  X, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Link, 
  Trash2,
  Plus,
  Minus,
  Wand2,
  ChevronDown,
  FileText,
  Hash,
  Calendar,
  Mail,
  Phone,
  List as ListIcon,
  User,
  Globe,
  Key,
  Percent,
  DollarSign,
  Clock,
  Ruler,
  Thermometer,
  Info
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { EntityTypeSelect } from "./EntityTypeSelect";
import { copyToClipboard } from "../utils/clipboard";

interface EditEntitySidepanelProps {
  entity: Entity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Entity>) => void;
  onDelete: (entity: Entity) => void;
  onDuplicate?: (entity: Entity) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <FileText size={16} />,
  number: <Hash size={16} />,
  date: <Calendar size={16} />,
  email: <Mail size={16} />,
  phone: <Phone size={16} />,
  list: <ListIcon size={16} />,
  name: <User size={16} />,
  age: <Hash size={16} />,
  url: <Link size={16} />,
  ordinal: <Hash size={16} />,
  currency: <DollarSign size={16} />,
  datetime: <Clock size={16} />,
  dimension: <Ruler size={16} />,
  geography: <Globe size={16} />,
  key_phrase: <Key size={16} />,
  percentage: <Percent size={16} />,
  phone_number: <Phone size={16} />,
  temperature: <Thermometer size={16} />,
};

const TYPE_LABELS: Record<string, string> = {
  text: "Texto",
  number: "Número",
  date: "Fecha",
  email: "Email",
  phone: "Teléfono",
  list: "Lista",
  name: "Nombre",
  age: "Edad",
  url: "URL",
  ordinal: "Ordinal",
  currency: "Moneda",
  datetime: "Fecha y hora",
  dimension: "Dimensión",
  geography: "Geografía",
  key_phrase: "Frase clave",
  percentage: "Porcentaje",
  phone_number: "Número de teléfono",
  temperature: "Temperatura",
};

const TYPE_PLACEHOLDERS: Record<string, string> = {
  text: "ej: Madrid, Barcelona, Valencia",
  number: "ej: 42, 100, 250",
  date: "ej: 2024-01-15, 15/01/2024",
  email: "ej: usuario@ejemplo.com",
  phone: "ej: +34 612 345 678",
  list: "ej: Opción A, Opción B, Opción C",
  name: "ej: Juan García, María López",
  age: "ej: 25, 30, 45",
  url: "ej: https://ejemplo.com",
  ordinal: "ej: primero, segundo, tercero",
  currency: "ej: 100€, $50, £30",
  datetime: "ej: 2024-01-15 14:30",
  dimension: "ej: 5 metros, 10 km",
  geography: "ej: España, Europa, América",
  key_phrase: "ej: atención al cliente, soporte técnico",
  percentage: "ej: 50%, 75%, 100%",
  phone_number: "ej: +34 612 345 678",
  temperature: "ej: 25°C, 77°F",
};

export function EditEntitySidepanel({ 
  entity, 
  open, 
  onOpenChange, 
  onSave, 
  onDelete,
  onDuplicate 
}: EditEntitySidepanelProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EntityType>("text");
  const [format, setFormat] = useState("");
  const [listValues, setListValues] = useState<string[]>([]); // Array of comma-separated strings
  const [showSynonymsFor, setShowSynonymsFor] = useState<number[]>([]); // Track which values show synonym input
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState("");

  // Load entity data when opened
  useEffect(() => {
    if (entity && open) {
      setName(entity.name);
      setTempName(entity.name);
      setDescription(entity.description);
      setType(entity.type);
      setFormat((entity as any).format || "");
      setIsRenaming(false);
      setIsDescriptionOpen(false);
      setShowSynonymsFor([]);
      
      if (entity.config?.listValues) {
        setListValues(entity.config.listValues.map(v => {
          const synonymsPart = v.synonyms.length > 0 ? ', ' + v.synonyms.join(', ') : '';
          return v.value + synonymsPart;
        }));
      } else {
        setListValues([]);
      }
    }
  }, [entity, open]);

  const handleSave = () => {
    if (!entity) return;

    // Validations
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      toast.error("El nombre solo puede contener caracteres alfanuméricos y guión bajo");
      return;
    }

    // Build config
    const config: any = {};
    
    if (listValues.length > 0) {
      config.listValues = listValues
        .filter(v => v.trim())
        .map(v => {
          const parts = v.split(',').map(s => s.trim()).filter(Boolean);
          return {
            value: parts[0] || "",
            synonyms: parts.slice(1)
          };
        })
        .filter(v => v.value);
    }

    onSave(entity.id, {
      name,
      description,
      type,
      format: format.trim() || undefined,
      config: Object.keys(config).length > 0 ? config : undefined
    });

    toast.success("Entidad actualizada correctamente");
    setIsRenaming(false);
    onOpenChange(false);
  };

  const handleNameChange = (value: string) => {
    // Replace spaces with underscores
    const formatted = value.replace(/ /g, '_');
    setName(formatted);
  };

  const handleRename = () => {
    setTempName(name);
    setIsRenaming(true);
  };

  const handleRenameBlur = () => {
    setIsRenaming(false);
    if (tempName.trim()) {
      setName(tempName);
    } else {
      setTempName(name);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsRenaming(false);
      if (tempName.trim()) {
        setName(tempName);
      } else {
        setTempName(name);
      }
    } else if (e.key === 'Escape') {
      setTempName(name);
      setIsRenaming(false);
    }
  };

  const handleDuplicate = () => {
    if (entity && onDuplicate) {
      onDuplicate(entity);
      onOpenChange(false);
    }
  };

  const handleCopyLink = () => {
    if (entity) {
      copyToClipboard(`${window.location.origin}/entities/${entity.id}`, "Enlace copiado al portapapeles");
    }
  };

  const handleDelete = () => {
    if (entity) {
      onDelete(entity);
      onOpenChange(false);
    }
  };

  const addListValue = () => {
    setListValues([...listValues, ""]);
  };

  const removeListValue = (index: number) => {
    setListValues(listValues.filter((_, i) => i !== index));
  };

  const updateListValue = (index: number, value: string) => {
    const updated = [...listValues];
    updated[index] = value;
    setListValues(updated);
  };

  const toggleSynonymsField = (index: number) => {
    if (showSynonymsFor.includes(index)) {
      setShowSynonymsFor(showSynonymsFor.filter(i => i !== index));
    } else {
      setShowSynonymsFor([...showSynonymsFor, index]);
    }
  };

  const handleGenerateWithAI = async () => {
    toast.info("Generando valores con IA...");
    
    // Mock AI generation
    setTimeout(() => {
      const mockValues = [
        "Valor_1, val1, v1",
        "Valor_2, val2, v2",
        "Valor_3, val3, v3",
      ];
      setListValues([...listValues, ...mockValues]);
      toast.success("Valores generados correctamente");
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!entity) return null;

  const isSystemEntity = entity.isSystem;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[40%] min-w-[500px] p-0 flex flex-col">
        <SheetTitle className="sr-only">{name || "Edit Entity"}</SheetTitle>
        <SheetDescription className="sr-only">
          Edit entity details and configuration
        </SheetDescription>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              {isRenaming && !isSystemEntity ? (
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value.replace(/ /g, '_'))}
                  onBlur={handleRenameBlur}
                  onKeyDown={handleRenameKeyDown}
                  autoFocus
                  className="text-lg font-medium"
                />
              ) : (
                <h2 
                  className={`text-lg font-medium text-[#1C283D] truncate ${!isSystemEntity ? 'cursor-text hover:text-[#60D3E4] transition-colors' : ''}`}
                  onClick={() => !isSystemEntity && handleRename()}
                >
                  {name}
                </h2>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-[#F4F6FC] text-[#233155] text-xs">
                  {TYPE_LABELS[type] || "Texto"}
                </Badge>
                {isSystemEntity && (
                  <Badge variant="secondary" className="bg-[#EEFBFD] text-[#387983] text-xs">
                    Sistema
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {!isSystemEntity && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleRename}>
                    <Edit2 size={16} className="mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy size={16} className="mr-2" />
                    Duplicate
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
            )}
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onOpenChange(false)}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {/* Data Type */}
            <div className="space-y-2">
              <Label htmlFor="entity-type">Tipo de dato</Label>
              <EntityTypeSelect 
                value={type} 
                onValueChange={(value) => setType(value as EntityType)}
                disabled={isSystemEntity}
              />
            </div>

            {/* Expected Format */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="entity-format">Formato esperado <span className="text-[#8D939D] font-normal">(opcional)</span></Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-[#8D939D] hover:text-[#233155] transition-colors">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[250px]">
                    <p>Define cómo debería estructurarse el dato para ayudar en la extracción.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="entity-format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                placeholder="Ej: DD/MM/AAAA"
                disabled={isSystemEntity}
              />
            </div>

            {/* Values Section - For all entity types */}
            {!isSystemEntity && (
              <div className="space-y-3">
                {listValues.length > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label className="text-[#233155]">Valores</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-[#8D939D] hover:text-[#233155] transition-colors">
                            <Info size={14} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[250px]">
                          <p>Opcional: Define valores específicos para mejorar la precisión de la extracción</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="max-h-[240px] overflow-y-auto pr-1 space-y-3">
                      {listValues.map((value, index) => (
                        <div key={index} className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-3">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input
                                value={value.split(',')[0].trim()}
                                onChange={(e) => {
                                  const synonymsPart = value.includes(',') ? value.substring(value.indexOf(',')) : '';
                                  updateListValue(index, e.target.value + synonymsPart);
                                }}
                                placeholder={TYPE_PLACEHOLDERS[type] || "Introduce el valor de la entidad"}
                                className="bg-white"
                              />
                              {!showSynonymsFor.includes(index) ? (
                                <button
                                  type="button"
                                  onClick={() => toggleSynonymsField(index)}
                                  className="text-xs text-[#8D939D] pl-1 hover:text-[#233155] cursor-pointer transition-colors underline decoration-dotted underline-offset-2"
                                >
                                  Añadir sinónimos, separados por comas
                                </button>
                              ) : (
                                <div className="space-y-1">
                                  <Label className="text-xs text-[#233155]">Sinónimos</Label>
                                  <Input
                                    value={value.includes(',') ? value.split(',').slice(1).join(',').trim() : ''}
                                    onChange={(e) => {
                                      const mainValue = value.split(',')[0].trim();
                                      const newValue = e.target.value ? `${mainValue}, ${e.target.value}` : mainValue;
                                      updateListValue(index, newValue);
                                    }}
                                    placeholder="sinónimo1, sinónimo2, sinónimo3"
                                    className="text-xs bg-white"
                                  />
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeListValue(index)}
                              className="text-[#8D939D] hover:text-red-500 h-9 w-9 shrink-0"
                            >
                              <Minus size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={addListValue}
                  className="w-full border-dashed"
                >
                  <Plus size={16} className="mr-2" />
                  Añadir valor
                </Button>
              </div>
            )}

            {isSystemEntity && (
              <div className="bg-[#EEFBFD] p-4 rounded-md flex gap-3 text-sm text-[#233155]">
                <Info size={20} className="text-[#60D3E4] shrink-0" />
                <p>Esta es una entidad del sistema pre-configurada y optimizada. No se puede modificar ni eliminar.</p>
              </div>
            )}

            {/* Description - Optional Collapsible */}
            {!isSystemEntity && (
              <>
                <Separator />
                
                <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <Label className="cursor-pointer">Descripción (opcional)</Label>
                    <ChevronDown 
                      size={16} 
                      className={`text-[#8D939D] transition-transform ${isDescriptionOpen ? 'rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-2">
                    <Textarea
                      id="entity-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      placeholder="Describe qué debe extraer esta entidad..."
                      rows={4}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
          {isSystemEntity ? (
            <Button
              onClick={() => onOpenChange(false)}
              className="ml-auto"
            >
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-[#60D3E4] hover:bg-[#387983] text-white"
              >
                Guardar cambios
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
