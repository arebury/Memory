import { Checkbox } from "./ui/checkbox";
import { motion, AnimatePresence } from "motion/react";

interface TypeFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    types: {
      interna: boolean;
      externa: boolean;
    };
    channels: {
      llamada: boolean;
      chat: boolean;
    };
    directions: {
      entrante: boolean;
      saliente: boolean;
    };
    rules: {
      recording: boolean;
      transcription: boolean;
      classification: boolean;
    };
  };
  onFiltersChange: (filters: TypeFilterPanelProps["filters"]) => void;
}

export function TypeFilterPanel({ isOpen, onClose, filters, onFiltersChange }: TypeFilterPanelProps) {
  const handleDeselectAll = () => {
    onFiltersChange({
      types: { interna: true, externa: true },
      channels: { llamada: true, chat: true },
      directions: { entrante: true, saliente: true },
      rules: { recording: false, transcription: false, classification: false },
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay invisible para cerrar al hacer clic fuera */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
      />

      {/* Dropdown Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className="absolute left-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl border border-[#CFD3DE] z-40"
      >
        {/* Header con Deseleccionar */}
        <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
          <h3 className="text-sm text-[#2C2E3E]">Filtros de Tipo</h3>
          <button
            onClick={handleDeselectAll}
            className="text-xs text-[#60D3E4] hover:text-[#387983] transition-colors"
          >
            Deseleccionar todo
          </button>
        </div>

        {/* Filters Content */}
        <div className="px-4 py-3 max-h-96 overflow-y-auto">
          {/* Tipo Section */}
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-[#A3A8B0] mb-2">Tipo de conversación</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.types.interna}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      types: { ...filters.types, interna: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors">
                  Interna
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.types.externa}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      types: { ...filters.types, externa: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors">
                  Externa
                </span>
              </label>
            </div>
          </div>

          {/* Canal Section */}
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-[#A3A8B0] mb-2">Canal</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.channels.llamada}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      channels: { ...filters.channels, llamada: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors">
                  Llamada
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.channels.chat}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      channels: { ...filters.channels, chat: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors">
                  Chat
                </span>
              </label>
            </div>
          </div>

          {/* Dirección Section */}
          <div className="mb-4">
            <h4 className="text-xs uppercase tracking-wide text-[#A3A8B0] mb-2">Dirección</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.directions.entrante}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      directions: { ...filters.directions, entrante: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors">
                  Entrante
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.directions.saliente}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      directions: { ...filters.directions, saliente: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors">
                  Saliente
                </span>
              </label>
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-[#E5E7EB] my-4"></div>

          {/* Reglas Aplicadas Section */}
          <div>
            <h4 className="text-xs uppercase tracking-wide text-[#A3A8B0] mb-2">Procesamiento Aplicado</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.rules.recording}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      rules: { ...filters.rules, recording: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors flex items-center gap-2">
                  Con grabación <div className="w-2 h-2 rounded-full bg-[#E74C3C]" />
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.rules.transcription}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      rules: { ...filters.rules, transcription: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors flex items-center gap-2">
                  Con transcripción <span className="text-xs text-[#60D3E4]">📝</span>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={filters.rules.classification}
                  onCheckedChange={(checked) =>
                    onFiltersChange({
                      ...filters,
                      rules: { ...filters.rules, classification: checked as boolean },
                    })
                  }
                  className="border-[#A3A8B0]"
                />
                <span className="text-sm text-[#5F6776] group-hover:text-[#2C2E3E] transition-colors flex items-center gap-2">
                  Con clasificación <span className="text-xs text-[#9B59B6]">✨</span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}