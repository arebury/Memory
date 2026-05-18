import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import { Clock } from "lucide-react";

interface TimeRangeFilterProps {
  startTime: string;
  endTime: string;
  onChange: (start: string, end: string) => void;
}

export function TimeRangeFilter({ startTime, endTime, onChange }: TimeRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse time strings (HH:MM)
  const parseTime = (time: string) => {
    if (!time) return { hours: "", minutes: "" };
    const [hours, minutes] = time.split(":");
    return { hours: hours || "", minutes: minutes || "" };
  };

  const startParsed = parseTime(startTime);
  const endParsed = parseTime(endTime);

  const [startHours, setStartHours] = useState(startParsed.hours);
  const [startMinutes, setStartMinutes] = useState(startParsed.minutes);
  const [endHours, setEndHours] = useState(endParsed.hours);
  const [endMinutes, setEndMinutes] = useState(endParsed.minutes);

  useEffect(() => {
    const parsed = parseTime(startTime);
    setStartHours(parsed.hours);
    setStartMinutes(parsed.minutes);
  }, [startTime]);

  useEffect(() => {
    const parsed = parseTime(endTime);
    setEndHours(parsed.hours);
    setEndMinutes(parsed.minutes);
  }, [endTime]);

  // Apply filters in real-time
  useEffect(() => {
    const sh = startHours || "";
    const sm = startMinutes || "";
    const eh = endHours || "";
    const em = endMinutes || "";
    
    const newStart = (sh && sm) ? `${sh.padStart(2, "0")}:${sm.padStart(2, "0")}` : "";
    const newEnd = (eh && em) ? `${eh.padStart(2, "0")}:${em.padStart(2, "0")}` : "";
    
    if (newStart !== startTime || newEnd !== endTime) {
      onChange(newStart, newEnd);
    }
  }, [startHours, startMinutes, endHours, endMinutes]);

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
    setStartHours("");
    setStartMinutes("");
    setEndHours("");
    setEndMinutes("");
    onChange("", "");
  };

  const hasValue = startTime || endTime;

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
          <Clock size={13} className={hasValue ? 'text-[#387983]' : 'text-[#8D939D]'} />
          <span className="flex-1 text-left truncate">
            {hasValue ? `${startTime || '00:00'} - ${endTime || '23:59'}` : 'Filtrar hora'}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] bg-white border-[#CFD3DE] p-0 shadow-lg animate-in fade-in-0 zoom-in-95" align="start">
        <div className="p-4">
          {/* Header with badge */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#233155]">Rango de hora</h3>
            {hasValue && (
              <span className="px-2 py-1 bg-[#60D3E4] text-white text-xs rounded">
                Activo
              </span>
            )}
          </div>

          {/* Time inputs */}
          <div className="space-y-4 mb-3">
            <div>
              <label className="text-[#233155] text-sm mb-2 block">Hora de inicio</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => onChange(e.target.value, endTime)}
                className="bg-white border-[#D2D6E0] text-[#233155] h-10 focus:border-[#60D3E4] focus:ring-[#60D3E4] w-full"
              />
            </div>

            <div className="border-t border-[#CFD3DE] pt-4">
              <label className="text-[#233155] text-sm mb-2 block">Hora de fin</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => onChange(startTime, e.target.value)}
                className="bg-white border-[#D2D6E0] text-[#233155] h-10 focus:border-[#60D3E4] focus:ring-[#60D3E4] w-full"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}