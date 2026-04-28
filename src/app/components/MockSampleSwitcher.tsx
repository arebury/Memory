import { Database, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { mockSamples } from "../data/mockSamples";
import { cn } from "./ui/utils";

interface MockSampleSwitcherProps {
  currentSampleId: string;
  onChange: (sampleId: string) => void;
}

/**
 * Prototype-only switch that lets a reviewer cycle through curated
 * mock-data states (everything pending, everything processed, only chats…).
 * Lives next to the UX-validation easter-egg so it stays visible to
 * stakeholders without crowding the main toolbar.
 */
export function MockSampleSwitcher({
  currentSampleId,
  onChange,
}: MockSampleSwitcherProps) {
  const current = mockSamples.find((s) => s.id === currentSampleId) ?? mockSamples[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          /* DEMO-only affordance: dashed border + soft amber chip.
             Audit 15.21 softened the previous saturated amber-on-white
             treatment because a fully filled `bg-#D97706 text-white`
             chip flirted with the "no clashing colors" rule. The new
             treatment uses a tinted background (amber-100-equivalent)
             and a lower-saturation text color — same semantic
             (this-is-not-production), less visual aggression. */
          className={cn(
            "group flex h-10 items-center gap-2 rounded-full border border-dashed border-[#D97706]/30 bg-[#FFFBEB] px-3",
            "text-xs font-medium text-[#92400E] transition-all",
            "hover:border-[#D97706]/60 hover:bg-[#FEF3C7]",
          )}
          title="Cambiar conjunto de datos de demo (solo en prototipo)"
          aria-label="Cambiar conjunto de datos de demo"
        >
          <span className="rounded-sm bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#92400E]">
            Demo
          </span>
          <Database
            size={14}
            className="text-[#92400E] transition-transform group-hover:scale-110"
          />
          <span className="hidden sm:inline">Datos:</span>
          <span className="text-[#92400E]">{current.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-[#8D939D]">
          Conjuntos de prueba
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {mockSamples.map((sample) => {
          const isActive = sample.id === currentSampleId;
          return (
            <DropdownMenuItem
              key={sample.id}
              onClick={() => onChange(sample.id)}
              className={cn(
                "flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer",
                isActive && "bg-[#EEFBFD]",
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="text-sm font-medium text-[#233155]">
                  {sample.label}
                </span>
                {isActive && <Check size={13} className="text-[#60D3E4]" />}
              </div>
              <p className="text-xs text-[#8D939D] leading-snug">
                {sample.description}
              </p>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
