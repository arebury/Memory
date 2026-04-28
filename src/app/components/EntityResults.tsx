import { Copy, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { copyToClipboard } from "../utils/clipboard";

export interface EntityResult {
  entityName: string;
  value: string | null;
  confidence: number; // 0-100
  type?: string; // For color dot, e.g., "text", "list", etc. 
  color?: string; // Hex color
  detectedSynonym?: string; // If detected via synonym
}

interface EntityResultsProps {
  results: EntityResult[];
}

export function EntityResults({ results }: EntityResultsProps) {
  const handleCopy = (text: string) => {
    copyToClipboard(text, "Valor copiado al portapapeles");
  };

  const getConfidenceConfig = (confidence: number, value: string | null) => {
    if (value === null || confidence === 0) {
      return {
        color: "text-gray-400",
        bg: "bg-gray-100",
        icon: <XCircle size={16} />,
        label: "No detectado",
        valueColor: "text-gray-400 italic"
      };
    }
    if (confidence < 60) {
      return {
        color: "text-red-500",
        bg: "bg-red-50",
        icon: <XCircle size={16} />,
        label: `${confidence}%`,
        valueColor: "text-[#1C283D]"
      };
    }
    if (confidence < 80) {
      return {
        color: "text-yellow-500",
        bg: "bg-yellow-50",
        icon: <AlertTriangle size={16} />,
        label: `${confidence}%`,
        valueColor: "text-[#1C283D]"
      };
    }
    return {
      color: "text-green-500",
      bg: "bg-green-50",
      icon: <CheckCircle2 size={16} />,
      label: `${confidence}%`,
      valueColor: "text-[#1C283D]"
    };
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6 w-full max-w-md">
      <h3 className="text-[#233155] font-medium mb-4">ENTIDADES DETECTADAS</h3>
      <div className="space-y-3">
        {results.map((result, index) => {
          const config = getConfidenceConfig(result.confidence, result.value);
          
          return (
            <div key={index} className="flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Color Dot */}
                <div 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: result.color || '#CFD3DE' }}
                />
                
                <span className="font-medium text-[#8D939D] min-w-[100px] truncate" title={result.entityName}>
                  {result.entityName}
                </span>
                
                <span className="text-[#CFD3DE]">→</span>
                
                <div className={`font-medium truncate ${config.valueColor} flex items-center gap-1`}>
                  <span title={result.value || ""}>
                    {result.value || "No detectado"}
                  </span>
                  {result.detectedSynonym && result.value && (
                    <span className="text-[#8D939D] font-normal text-xs">
                      (detectado como: {result.detectedSynonym})
                    </span>
                  )}
                </div>
                
                {result.value && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(result.value!)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-[#8D939D] hover:text-[#60D3E4] shrink-0 ml-2"
                  >
                    <Copy size={12} />
                  </Button>
                )}
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg} ${config.color} cursor-help shrink-0 ml-2`}>
                      {config.icon}
                      {/* Only show text if space permits or simplify for layout */}
                      <span className="text-xs font-bold">{config.label}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Nivel de confianza de la IA</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
