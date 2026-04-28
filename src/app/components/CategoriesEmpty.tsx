import { Button } from "./ui/button";
import { Tags } from "lucide-react";

interface CategoriesEmptyProps {
  onCreateCategory: () => void;
  onUseTemplate: (template: "complaint" | "churn" | "competitor" | "incident") => void;
}

export function CategoriesEmpty({ onCreateCategory, onUseTemplate }: CategoriesEmptyProps) {
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
      description: "Menciona otras empresas o competidores"
    },
    {
      id: "incident" as const,
      icon: "🔧",
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
            {/* Decorative tags */}
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center transform rotate-12">
              <span className="text-lg">🏷️</span>
            </div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center transform -rotate-12">
              <span className="text-lg">📋</span>
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
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onUseTemplate(template.id)}
              className="bg-white border border-[#E5E7EB] rounded-lg p-3 cursor-pointer hover:border-[#60D3E4] hover:shadow-md transition-all group"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{template.icon}</div>
                <h3 className="text-[#233155] mb-1 text-sm">{template.title}</h3>
                <p className="text-xs text-[#8D939D] mb-2 leading-snug">
                  {template.description}
                </p>
                <div className="text-xs text-[#60D3E4] opacity-0 group-hover:opacity-100 transition-opacity">
                  Usar plantilla →
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
            📘 Ver cómo funcionan las categorías →
          </a>
        </div>
      </div>
    </div>
  );
}