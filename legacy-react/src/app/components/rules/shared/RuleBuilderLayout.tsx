import { ReactNode, Children } from 'react';
import { Breadcrumbs } from '../../Breadcrumbs';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface RuleBuilderLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  actions: ReactNode;
  breadcrumbs: { label: string; onClick?: () => void }[];
  isDraft?: boolean;
  onDiscardDraft?: () => void;
}

export function RuleBuilderLayout({ 
  title, subtitle, children, actions, breadcrumbs, isDraft, onDiscardDraft
}: RuleBuilderLayoutProps) {
  const all = Children.toArray(children);
  const setupPanel   = all.slice(0, 2);   // Básica + Alcance
  const configPanel  = all.slice(2);       // type-specific cards

  return (
    <div className="h-full bg-[#F4F6FC] flex flex-col">
      {/* Header with Breadcrumbs */}
      <div className="bg-white border-b border-[#CFD3DE] px-6 py-3 shrink-0">
        <Breadcrumbs items={breadcrumbs} />
        {subtitle && (
          <p className="text-xs text-[#8D939D] mt-1.5 ml-0.5">{subtitle}</p>
        )}
      </div>

      {/* Draft banner — container always reserved to prevent layout shift */}
      <div className="shrink-0" style={{ minHeight: isDraft ? 'auto' : 0 }}>
        {isDraft && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle size={16} className="shrink-0" />
                <p className="text-sm">
                  Esta regla es una copia sin modificar. Edita al menos un campo y guarda para poder activarla.
                </p>
              </div>
              {onDiscardDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDiscardDraft}
                  className="shrink-0 text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  <Trash2 size={14} className="mr-1.5" />
                  Descartar copia
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-start gap-0">

            {/* ── Left column: identity & scope ─────────────────── */}
            <div className="w-[300px] shrink-0 flex flex-col gap-4 pr-7">
              <p className="text-[10px] uppercase tracking-widest text-[#A3A8B0] pl-0.5">
                1 · Identidad y alcance
              </p>
              {setupPanel}
            </div>

            {/* ── Divider ───────────────────────────────────────── */}
            <div className="self-stretch w-px bg-[#E5E7EB] shrink-0 mt-[1.6rem]" />

            {/* ── Right column: behaviour ───────────────────────── */}
            <div className="flex-1 flex flex-col gap-4 pl-7">
              <p className="text-[10px] uppercase tracking-widest text-[#A3A8B0] pl-0.5">
                2 · Configuración
              </p>
              {configPanel}
            </div>

          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-[#CFD3DE] px-6 py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex justify-end gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
}