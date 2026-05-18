import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Timer } from "lucide-react";

interface DurationFilterProps {
  minTime: string;
  maxTime: string;
  onChange: (min: string, max: string) => void;
  label: string;
}

export function DurationFilter({ minTime, maxTime, onChange, label }: DurationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse time strings (HH:MM:SS)
  const parseTime = (time: string) => {
    if (!time) return { hours: "", minutes: "", seconds: "" };
    const parts = time.split(":");
    return { 
      hours: parts[0] || "", 
      minutes: parts[1] || "",
      seconds: parts[2] || ""
    };
  };

  const minParsed = parseTime(minTime);
  const maxParsed = parseTime(maxTime);

  const [minHours, setMinHours] = useState(minParsed.hours);
  const [minMinutes, setMinMinutes] = useState(minParsed.minutes);
  const [minSeconds, setMinSeconds] = useState(minParsed.seconds);
  const [maxHours, setMaxHours] = useState(maxParsed.hours);
  const [maxMinutes, setMaxMinutes] = useState(maxParsed.minutes);
  const [maxSeconds, setMaxSeconds] = useState(maxParsed.seconds);

  useEffect(() => {
    const parsed = parseTime(minTime);
    setMinHours(parsed.hours);
    setMinMinutes(parsed.minutes);
    setMinSeconds(parsed.seconds);
  }, [minTime]);

  useEffect(() => {
    const parsed = parseTime(maxTime);
    setMaxHours(parsed.hours);
    setMaxMinutes(parsed.minutes);
    setMaxSeconds(parsed.seconds);
  }, [maxTime]);

  // Apply filters in real-time
  useEffect(() => {
    const minh = minHours || "";
    const minm = minMinutes || "";
    const mins = minSeconds || "";
    const maxh = maxHours || "";
    const maxm = maxMinutes || "";
    const maxs = maxSeconds || "";
    
    const newMin = (minh && minm && mins) ? `${minh.padStart(2, "0")}:${minm.padStart(2, "0")}:${mins.padStart(2, "0")}` : "";
    const newMax = (maxh && maxm && maxs) ? `${maxh.padStart(2, "0")}:${maxm.padStart(2, "0")}:${maxs.padStart(2, "0")}` : "";
    
    if (newMin !== minTime || newMax !== maxTime) {
      onChange(newMin, newMax);
    }
  }, [minHours, minMinutes, minSeconds, maxHours, maxMinutes, maxSeconds]);

  const handleNumberInput = (value: string, max: number, setter: (v: string) => void) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0 && num <= max) {
      setter(num.toString().padStart(2, "0"));
    }
  };

  const handleClear = () => {
    setMinHours("");
    setMinMinutes("");
    setMinSeconds("");
    setMaxHours("");
    setMaxMinutes("");
    setMaxSeconds("");
    onChange("", "");
  };

  const hasValue = minTime || maxTime;

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
          <Timer size={13} className={hasValue ? 'text-[#387983]' : 'text-[#8D939D]'} />
          <span className="flex-1 text-left truncate">
            {hasValue ? `${minTime || '00:00:00'} - ${maxTime || '23:59:59'}` : `Filtrar ${label.toLowerCase()}`}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] bg-white border-[#CFD3DE] p-0 shadow-lg animate-in fade-in-0 zoom-in-95" align="start">
        <div className="p-4">
          {/* Header with badge */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#233155]">Rango de {label.toLowerCase()}</h3>
            {hasValue && (
              <span className="px-2 py-1 bg-[#60D3E4] text-white text-xs rounded">
                Activo
              </span>
            )}
          </div>

          {/* Time inputs */}
          <div className="space-y-4 mb-3">
            <div>
              <label className="text-[#233155] text-sm mb-2 block">Tiempo mínimo</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={minHours}
                  onChange={(e) => handleNumberInput(e.target.value, 23, setMinHours)}
                  placeholder="HH"
                  className="bg-white border-[#D2D6E0] text-[#233155] text-center placeholder:text-[#8D939D] h-10 focus:border-[#60D3E4] focus:ring-[#60D3E4] flex-1"
                />
                <span className="text-[#233155]">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minMinutes}
                  onChange={(e) => handleNumberInput(e.target.value, 59, setMinMinutes)}
                  placeholder="MM"
                  className="bg-white border-[#D2D6E0] text-[#233155] text-center placeholder:text-[#8D939D] h-10 focus:border-[#60D3E4] focus:ring-[#60D3E4] flex-1"
                />
                <span className="text-[#233155]">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={minSeconds}
                  onChange={(e) => handleNumberInput(e.target.value, 59, setMinSeconds)}
                  placeholder="SS"
                  className="bg-white border-[#D2D6E0] text-[#233155] text-center placeholder:text-[#8D939D] h-10 focus:border-[#60D3E4] focus:ring-[#60D3E4] flex-1"
                />
              </div>
              <div className="text-[#8D939D] text-xs mt-2 text-center">
                Horas : Minutos : Segundos
              </div>
            </div>

            <div className="border-t border-[#CFD3DE] pt-4">
              <label className="text-[#233155] text-sm mb-2 block">Tiempo máximo</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={maxHours}
                  onChange={(e) => handleNumberInput(e.target.value, 23, setMaxHours)}
                  placeholder="HH"
                  className="bg-white border-[#D2D6E0] text-[#233155] text-center placeholder:text-[#8D939D] h-10 focus:border-[#60D3E4] focus:ring-[#60D3E4] flex-1"
                />
                <span className="text-[#233155]">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={maxMinutes}
                  onChange={(e) => handleNumberInput(e.target.value, 59, setMaxMinutes)}
                  placeholder="MM"
                  className="bg-white border-[#D2D6E0] text-[#233155] text-center placeholder:text-[#8D939D] h-10 focus:border-[#60D3E4] focus:ring-[#60D3E4] flex-1"
                />
                <span className="text-[#233155]">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={maxSeconds}
                  onChange={(e) => handleNumberInput(e.target.value, 59, setMaxSeconds)}
                  placeholder="SS"
                  className="bg-white border-[#D2D6E0] text-[#233155] text-center placeholder:text-[#8D939D] h-10 focus:border-[#60D3E4] focus:ring-[#60D3E4] flex-1"
                />
              </div>
              <div className="text-[#8D939D] text-xs mt-2 text-center">
                Horas : Minutos : Segundos
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}