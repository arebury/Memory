import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Mic, Sparkles } from "lucide-react";

interface RecordingFilterProps {
  withRecording: boolean;
  withTranscription: boolean;
  withClassification?: boolean;
  onChange: (recording: boolean, transcription: boolean, classification?: boolean) => void;
}

export function RecordingFilter({ withRecording, withTranscription, withClassification = false, onChange }: RecordingFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleRecording = () => {
    onChange(!withRecording, withTranscription, withClassification);
  };

  const handleToggleTranscription = () => {
    onChange(withRecording, !withTranscription, withClassification);
  };

  const handleToggleClassification = () => {
    onChange(withRecording, withTranscription, !withClassification);
  };

  const handleSelectAll = () => {
    const allSelected = withRecording && withTranscription && withClassification;
    onChange(!allSelected, !allSelected, !allSelected);
  };

  const hasValue = withRecording || withTranscription || withClassification;
  const activeCount = [withRecording, withTranscription, withClassification].filter(Boolean).length;

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button 
          className={`h-8 px-3 text-xs border rounded flex items-center gap-2 transition-all w-full ${
            hasValue 
              ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983]' 
              : 'bg-white border-[#CFD3DE] text-[#5F6776] hover:bg-[#F4F6FC] hover:border-[#A3A8B0]'
          }`}
        >
          {withClassification ? <Sparkles size={13} className="text-[#387983]" /> : <Mic size={13} className={hasValue ? 'text-[#387983]' : 'text-[#8D939D]'} />}
          <span className="flex-1 text-left truncate">
            {hasValue 
              ? [withRecording && 'Grab.', withTranscription && 'Transc.', withClassification && 'Clas.'].filter(Boolean).join(' + ')
              : 'Filtrar estado'
            }
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] bg-white border-[#CFD3DE] p-0 shadow-lg animate-in fade-in-0 zoom-in-95" align="start">
        <div className="p-4">
          {/* Header with badge */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#233155]">Estado de Procesamiento</h3>
            {hasValue && (
              <span className="px-2 py-1 bg-[#60D3E4] text-white text-xs rounded">
                {activeCount}/3
              </span>
            )}
          </div>

          {/* Options */}
          <div className="space-y-1.5 mb-3">
            <div 
              className={`flex items-center gap-3 p-2.5 rounded cursor-pointer transition-colors ${
                withRecording 
                  ? 'bg-[#EEFBFD]' 
                  : 'hover:bg-[#F4F6FC]'
              }`}
              onClick={handleToggleRecording}
            >
              <Checkbox
                id="with-recording"
                checked={withRecording}
                onCheckedChange={handleToggleRecording}
                className="border-[#D8F4F8] data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4]"
              />
              <label 
                htmlFor="with-recording"
                className="text-sm text-[#233155] cursor-pointer select-none flex-1 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#E74C3C]" />
                Con grabación
              </label>
            </div>
            
            <div 
              className={`flex items-center gap-3 p-2.5 rounded cursor-pointer transition-colors ${
                withTranscription 
                  ? 'bg-[#EEFBFD]' 
                  : 'hover:bg-[#F4F6FC]'
              }`}
              onClick={handleToggleTranscription}
            >
              <Checkbox
                id="with-transcription"
                checked={withTranscription}
                onCheckedChange={handleToggleTranscription}
                className="border-[#D8F4F8] data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4]"
              />
              <label 
                htmlFor="with-transcription"
                className="text-sm text-[#233155] cursor-pointer select-none flex-1"
              >
                Con transcripción
              </label>
            </div>

            <div 
              className={`flex items-center gap-3 p-2.5 rounded cursor-pointer transition-colors ${
                withClassification 
                  ? 'bg-[#EEFBFD]' 
                  : 'hover:bg-[#F4F6FC]'
              }`}
              onClick={handleToggleClassification}
            >
              <Checkbox
                id="with-classification"
                checked={withClassification}
                onCheckedChange={handleToggleClassification}
                className="border-[#D8F4F8] data-[state=checked]:bg-[#60D3E4] data-[state=checked]:border-[#60D3E4]"
              />
              <label 
                htmlFor="with-classification"
                className="text-sm text-[#233155] cursor-pointer select-none flex-1"
              >
                Con clasificación IA
              </label>
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="border-t border-[#CFD3DE] p-3 bg-[#F4F6FC] flex justify-center">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-sm text-[#5F6776] hover:bg-white hover:text-[#233155] rounded transition-colors"
          >
            {withRecording && withTranscription && withClassification ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}