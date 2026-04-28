import { Button } from "./ui/button";
import {
  Tags,
  AlertCircle,
  AlertTriangle,
  Building2,
  Wrench,
  Tag,
  ClipboardList,
  BookOpen,
  ArrowRight,
} from "lucide-react";

interface CategoriesEmptyProps {
  onCreateCategory: () => void;
  onUseTemplate: (template: "complaint" | "churn" | "competitor" | "incident") => void;
}

export function CategoriesEmpty({ onCreateCategory, onUseTemplate }: CategoriesEmptyProps) {
  const templates = [
    {
      id: "complaint" as const,
      Icon: AlertCircle,
      title: "Queja",
      description: "Cliente expresa insatisfacción"
    },
    {
      id: "churn" as const,
      Icon: AlertTriangle,
      title: "Intención de baja",
      description: "Cliente quiere cancelar servicio"
    },
    {
      id: "competitor" as const,
      Icon: Building2,
      title: "Competencia",
      description: "Menciona otras empresas o competidores"
    },
    {
      id: "incident" as const,
      Icon: Wrench,
      title: "Incidencia",
      description: "Reporta problemas técnicos o fallos"
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Ilustración */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-[#EEFBFD] rounded-full flex items-center justify-center">
              <Tags size={40} className="text-[#60D3E4]" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center transform rotate-12">
              <Tag size={14} className="text-[#60D3E4]" strokeWidth={1.6} />
            </div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center transform -rotate-12">
              <ClipboardList size={14} className="text-[#60D3E4]" strokeWidth={1.6} />
            </div>
          </div>
        </div>

        {/* Título y descripción */}
        <div className="text-center mb-4">
          <h2 className="text-xl text-[#1C283D] mb-2">
            Organiza tus llamadas automáticamente
          </h2>
          <p className="text-sm text-[#8D939D] leading-snug max-w-lg mx-auto">
            Clasifica llamadas según lo que hablan clientes y agentes. La IA las detectará por ti.
          </p>
        </div>

        {/* Botón principal */}
        <div className="flex justify-center mb-4">
          <Button
            onClick={onCreateCategory}
            className="bg-[#60D3E4] hover:bg-[#4FC3D3] text-white px-5 py-5 h-auto"
          >
            + Crear tu primera categoría
          </Button>
        </div>

        {/* Separador */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="flex-1 border-t border-[#E5E7EB]"></div>
          <span className="px-4 text-xs text-[#8D939D]">o empieza con una plantilla</span>
          <div className="flex-1 border-t border-[#E5E7EB]"></div>
        </div>

        {/* Cards de plantillas */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {templates.map(({ id, Icon, title, description }) => (
            <div
              key={id}
              onClick={() => onUseTemplate(id)}
              className="bg-white border border-[#E5E7EB] rounded-lg p-3 cursor-pointer hover:border-[#60D3E4] hover:shadow-md transition-all group"
            >
              <div className="flex flex-col items-center text-center">
                <span className="mb-1.5 inline-flex size-8 items-center justify-center rounded-md bg-[#EEFBFD] text-[#60D3E4]">
                  <Icon size={16} strokeWidth={1.6} />
                </span>
                <h3 className="text-[#233155] mb-1 text-sm">{title}</h3>
                <p className="text-xs text-[#8D939D] mb-2 leading-snug">
                  {description}
                </p>
                <div className="text-xs text-[#60D3E4] opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                  Usar plantilla
                  <ArrowRight size={11} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Link a documentación */}
        <div className="text-center">
          <a
            href="#"
            className="text-xs text-[#60D3E4] hover:text-[#4FC3D3] inline-flex items-center gap-1"
          >
            <BookOpen size={12} strokeWidth={1.6} />
            Ver cómo funcionan las categorías
            <ArrowRight size={11} strokeWidth={1.8} />
          </a>
        </div>
      </div>
    </div>
  );
}