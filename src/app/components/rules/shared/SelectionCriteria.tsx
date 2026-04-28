import { useMemo } from 'react';
import { MultiSelectWithSearch } from '../../MultiSelectWithSearch';
import { Label } from '../../ui/label';
import { mockServices } from '../../../data/mockData';
import { X, Phone } from 'lucide-react';

interface SelectionCriteriaProps {
  selectedServices: string[];
  onChangeServices: (values: string[]) => void;
  readOnly?: boolean;
}

function ServiceChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 bg-[#EEFBFD] border border-[#D8F4F8] rounded-md text-sm text-[#387983]">
      <Phone size={11} className="text-[#7BBCC7] shrink-0" />
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 text-[#7BBCC7] hover:text-[#387983] transition-colors shrink-0"
        >
          <X size={11} />
        </button>
      )}
    </span>
  );
}

export function SelectionCriteria({
  selectedServices,
  onChangeServices,
  readOnly = false,
}: SelectionCriteriaProps) {
  const selectedItems = useMemo(
    () => selectedServices.map(v => mockServices.find(s => s.value === v)).filter(Boolean) as typeof mockServices,
    [selectedServices]
  );

  const remove = (value: string) => onChangeServices(selectedServices.filter(v => v !== value));

  return (
    <div className="bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-sm space-y-4">
      <div>
        <Label className="text-base text-[#233155]">Alcance</Label>
        <p className="text-sm text-[#8D939D] mt-1">
          Selecciona los servicios a los que aplica esta regla. Si no seleccionas ninguno, aplica a todos.
        </p>
      </div>

      {!readOnly && (
        <MultiSelectWithSearch
          options={mockServices}
          value={selectedServices}
          onChange={onChangeServices}
          placeholder="Buscar y seleccionar servicios..."
        />
      )}

      {/* Chips — space reserved to prevent layout shift */}
      <div className="min-h-[32px]">
        {selectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.map((item) => (
              <ServiceChip
                key={item.value}
                label={item.label}
                onRemove={readOnly ? undefined : () => remove(item.value)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#A3A8B0] italic">
            Sin restricción — aplica a todos los servicios
          </p>
        )}
      </div>
    </div>
  );
}
