import { useState } from "react";
import { EntityType } from "./EntitiesContext";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
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
  Thermometer
} from "lucide-react";
import { cn } from "./ui/utils";

interface EntityTypeSelectProps {
  value: EntityType;
  onValueChange: (value: EntityType) => void;
  disabled?: boolean;
}

interface TypeOption {
  value: EntityType;
  label: string;
  icon: React.ReactNode;
  category: 'custom' | 'predefined';
}

const TYPE_OPTIONS: TypeOption[] = [
  // Custom types
  { value: 'text', label: 'Text', icon: <FileText size={16} />, category: 'custom' },
  { value: 'number', label: 'Number', icon: <Hash size={16} />, category: 'custom' },
  { value: 'date', label: 'Date', icon: <Calendar size={16} />, category: 'custom' },
  { value: 'list', label: 'List', icon: <ListIcon size={16} />, category: 'custom' },
  
  // Predefined types
  { value: 'email', label: 'Email', icon: <Mail size={16} />, category: 'predefined' },
  { value: 'name', label: 'Name', icon: <User size={16} />, category: 'predefined' },
  { value: 'age', label: 'Age', icon: <Hash size={16} />, category: 'predefined' },
  { value: 'url', label: 'URL', icon: <Globe size={16} />, category: 'predefined' },
  { value: 'ordinal', label: 'Ordinal', icon: <Hash size={16} />, category: 'predefined' },
  { value: 'currency', label: 'Currency', icon: <DollarSign size={16} />, category: 'predefined' },
  { value: 'datetime', label: 'Datetime', icon: <Clock size={16} />, category: 'predefined' },
  { value: 'dimension', label: 'Dimension', icon: <Ruler size={16} />, category: 'predefined' },
  { value: 'geography', label: 'Geography', icon: <Globe size={16} />, category: 'predefined' },
  { value: 'key_phrase', label: 'Key phrase', icon: <Key size={16} />, category: 'predefined' },
  { value: 'percentage', label: 'Percentage', icon: <Percent size={16} />, category: 'predefined' },
  { value: 'phone_number', label: 'Phone number', icon: <Phone size={16} />, category: 'predefined' },
  { value: 'temperature', label: 'Temperature', icon: <Thermometer size={16} />, category: 'predefined' },
];

export function EntityTypeSelect({ value, onValueChange, disabled = false }: EntityTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = TYPE_OPTIONS.find(opt => opt.value === value) || TYPE_OPTIONS[0];

  // Filter options based on search
  const filteredOptions = TYPE_OPTIONS.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const customTypes = filteredOptions.filter(opt => opt.category === 'custom');
  const predefinedTypes = filteredOptions.filter(opt => opt.category === 'predefined');

  const handleSelect = (optionValue: EntityType) => {
    onValueChange(optionValue);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-10 px-3"
        >
          <div className="flex items-center gap-2">
            {selectedOption.icon}
            <span>{selectedOption.label}</span>
          </div>
          <ChevronDown className={cn(
            "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform",
            open && "rotate-180"
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b">
            <Input
              placeholder="Search data types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-[300px] overflow-y-auto">
            {/* Custom Section */}
            {customTypes.length > 0 && (
              <div className="py-2">
                <div className="px-3 py-1.5 text-xs font-medium text-[#8D939D] uppercase">
                  Custom
                </div>
                {customTypes.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F4F6FC] transition-colors",
                      value === option.value && "bg-[#EEFBFD] text-[#387983]"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center",
                      value === option.value ? "text-[#60D3E4]" : "text-[#8D939D]"
                    )}>
                      {option.icon}
                    </span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Predefined Section */}
            {predefinedTypes.length > 0 && (
              <div className="py-2 border-t">
                <div className="px-3 py-1.5 text-xs font-medium text-[#8D939D] uppercase">
                  Predefined
                </div>
                {predefinedTypes.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F4F6FC] transition-colors",
                      value === option.value && "bg-[#EEFBFD] text-[#387983]"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center",
                      value === option.value ? "text-[#60D3E4]" : "text-[#8D939D]"
                    )}>
                      {option.icon}
                    </span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-[#8D939D]">
                No data types found
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
