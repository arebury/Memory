import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { format, startOfToday, startOfYesterday, endOfYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    
    setDateRange(range);
    
    if (range.from && range.to) {
      const formattedRange = `${format(range.from, "dd/MM/yyyy", { locale: es })} - ${format(range.to, "dd/MM/yyyy", { locale: es })}`;
      onChange(formattedRange);
      setOpen(false);
    } else if (range.from) {
      const formattedRange = format(range.from, "dd/MM/yyyy", { locale: es });
      onChange(formattedRange);
    }
  };

  const handlePresetSelect = (preset: string) => {
    let from: Date;
    let to: Date;
    const today = startOfToday();

    switch (preset) {
      case "today":
        from = today;
        to = today;
        break;
      case "yesterday":
        from = startOfYesterday();
        to = endOfYesterday();
        break;
      case "this-week":
        from = startOfWeek(today, { locale: es });
        to = endOfWeek(today, { locale: es });
        break;
      case "this-month":
        from = startOfMonth(today);
        to = endOfMonth(today);
        break;
      default:
        return;
    }

    const range = { from, to };
    setDateRange(range);
    const formattedRange = `${format(from, "dd/MM/yyyy", { locale: es })} - ${format(to, "dd/MM/yyyy", { locale: es })}`;
    onChange(formattedRange);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input 
            value={value}
            readOnly
            placeholder="Seleccionar fechas"
            className={`h-8 text-xs pr-9 cursor-pointer ${
              value 
                ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983]' 
                : 'border-[#CFD3DE] text-[#5F6776] hover:bg-[#F4F6FC] hover:border-[#A3A8B0]'
            }`}
          />
          <button 
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
              value ? 'text-[#387983]' : 'text-[#8D939D]'
            }`}
            onClick={() => setOpen(!open)}
          >
            <CalendarIcon size={13} />
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="bg-[#F4F6FC] p-3 border-r border-[#CFD3DE] flex flex-col gap-2">
            <Button
              variant="ghost"
              className="justify-start h-8 px-3 text-sm text-[#5F6776] hover:bg-[#60D3E4] hover:text-white"
              onClick={() => handlePresetSelect("today")}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              className="justify-start h-8 px-3 text-sm text-[#5F6776] hover:bg-[#60D3E4] hover:text-white"
              onClick={() => handlePresetSelect("yesterday")}
            >
              Yesterday
            </Button>
            <Button
              variant="ghost"
              className="justify-start h-8 px-3 text-sm text-[#5F6776] hover:bg-[#60D3E4] hover:text-white"
              onClick={() => handlePresetSelect("this-week")}
            >
              This week
            </Button>
            <Button
              variant="ghost"
              className="justify-start h-8 px-3 text-sm text-[#5F6776] hover:bg-[#60D3E4] hover:text-white"
              onClick={() => handlePresetSelect("this-month")}
            >
              This month
            </Button>
          </div>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={es}
            className="rounded-md border-0"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
