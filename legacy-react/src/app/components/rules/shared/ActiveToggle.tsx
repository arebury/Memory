import { useState } from 'react';
import { Switch } from '../../ui/switch';

interface ActiveToggleProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

export function ActiveToggle({ checked, onCheckedChange }: ActiveToggleProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-[#60D3E4]"
      />
      <span className={`text-xs select-none ${checked ? 'text-[#27AE60]' : 'text-[#8D939D]'}`}>
        {checked ? 'Activa' : 'Inactiva'}
      </span>

      {/* Tooltip */}
      {show && (
        <div className="absolute right-0 top-full mt-2 z-50 w-60 bg-[#1E2B45] text-white text-xs rounded-lg shadow-xl px-3 py-2.5 pointer-events-none">
          {/* Arrow */}
          <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#1E2B45] rotate-45 rounded-sm" />
          {checked
            ? 'La regla está activa y se aplica a nuevas conversaciones en cuanto se guardan.'
            : 'La regla está inactiva y no se aplicará hasta que la actives y guardes.'}
        </div>
      )}
    </div>
  );
}
