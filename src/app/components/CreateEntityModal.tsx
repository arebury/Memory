import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Plus, Minus, Info, ChevronDown } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { EntityType } from "./EntitiesContext";
import { EntityTypeSelect } from "./EntityTypeSelect";

interface CreateEntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entity: any) => void;
}

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

export function CreateEntityModal({ open, onOpenChange, onSave }: CreateEntityModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EntityType>("text");
  const [format, setFormat] = useState("");
  const [listValues, setListValues] = useState<string[]>([]); // Array of comma-separated strings
  const [showSynonymsFor, setShowSynonymsFor] = useState<number[]>([]); // Track which values show synonym input
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setName("");
      setDescription("");
      setType("text");
      setFormat("");
      setListValues([]);
      setShowSynonymsFor([]);
      setIsDescriptionOpen(false);
    }
  }, [open]);

  const handleAddValue = () => {
    setListValues([...listValues, ""]);
  };

  const handleRemoveValue = (index: number) => {
    setListValues(listValues.filter((_, i) => i !== index));
    setShowSynonymsFor(showSynonymsFor.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const handleValueChange = (index: number, value: string) => {
    const newList = [...listValues];
    newList[index] = value;
    setListValues(newList);
  };

  const toggleSynonymsField = (index: number) => {
    if (showSynonymsFor.includes(index)) {
      setShowSynonymsFor(showSynonymsFor.filter(i => i !== index));
    } else {
      setShowSynonymsFor([...showSynonymsFor, index]);
    }
  };

  const handleSave = () => {
    // Basic validation
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (type === 'list' && listValues.filter(v => v.trim()).length === 0) {
      toast.error("Debes añadir al menos un valor para la lista");
      return;
    }

    // Parse list values: first term is value, rest are synonyms
    const parsedListValues = listValues.length > 0 ? listValues
      .filter(v => v.trim())
      .map(v => {
        const parts = v.split(',').map(s => s.trim()).filter(Boolean);
        return {
          value: parts[0] || "",
          synonyms: parts.slice(1)
        };
      })
      .filter(v => v.value) : [];

    const entityData = {
      name,
      description: description.trim() || "", // Use user-provided description or empty string
      type,
      format: format.trim() || undefined,
      isSystem: false,
      config: parsedListValues.length > 0 ? { listValues: parsedListValues } : {}
    };

    onSave(entityData);
    onOpenChange(false);
    toast.success("Entidad creada");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg text-[#1C283D]">
            Crear entidad
          </DialogTitle>
          <DialogDescription className="sr-only">
            Crear una nueva entidad para extracción de datos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#233155]">
              Nombre
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/ /g, "_"))}
              placeholder="Introduce el nombre de la entidad"
            />
          </div>

          {/* Description */}
          <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-[#233155] hover:text-[#60D3E4] transition-colors">
              <ChevronDown 
                size={16} 
                className={`transition-transform ${isDescriptionOpen ? 'rotate-180' : ''}`}
              />
              <span className="text-sm">Descripción <span className="text-[#8D939D]">(opcional)</span></span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente el propósito de esta entidad"
              />
            </CollapsibleContent>
          </Collapsible>

          {/* Data Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-[#233155]">
              Tipo de dato
            </Label>
            <EntityTypeSelect 
              value={type} 
              onValueChange={(v) => setType(v as EntityType)} 
            />
          </div>

          {/* Expected Format */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="format" className="text-[#233155]">
                Formato esperado <span className="text-[#8D939D] font-normal">(opcional)</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-[#8D939D] hover:text-[#233155] transition-colors">
                    <Info size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[250px]">
                  <p>Define cómo debería estructurarse el dato (ej: "DD/MM/AAAA" para fechas o "9 dígitos" para teléfonos).</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              placeholder='Ej: DD/MM/AAAA'
            />
          </div>

          {/* Values Section */}
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
                              handleValueChange(index, e.target.value + synonymsPart);
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
                                  handleValueChange(index, newValue);
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
                          onClick={() => handleRemoveValue(index)}
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
              onClick={handleAddValue}
              className="w-full border-dashed"
            >
              <Plus size={16} className="mr-2" />
              Añadir valor
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-[#60D3E4] hover:bg-[#387983] text-white"
          >
            Crear entidad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
