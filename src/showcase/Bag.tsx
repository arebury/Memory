import { useState, type ReactNode } from 'react';
import type { BagId } from './data';

type Props = {
  id: BagId;
  label: string;
  subtitle: string;
  count: number;
  total: number;
  primengCount: number;
  onDrop: (pointId: string, bagId: BagId) => void;
  children: ReactNode;
};

const ACCENT: Record<BagId, string> = {
  backlog: 'border-slate-300 bg-slate-50',
  v1: 'border-sky-300 bg-sky-50',
  v2: 'border-violet-300 bg-violet-50',
};

const HEADER_ACCENT: Record<BagId, string> = {
  backlog: 'text-slate-700',
  v1: 'text-sky-800',
  v2: 'text-violet-800',
};

export function Bag({ id, label, subtitle, count, total, primengCount, onDrop, children }: Props) {
  const [over, setOver] = useState(false);

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!over) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const pointId = e.dataTransfer.getData('text/plain');
        if (pointId) onDrop(pointId, id);
      }}
      className={`flex h-full flex-col rounded-xl border-2 transition ${ACCENT[id]} ${over ? 'border-dashed ring-2 ring-offset-2 ring-slate-400' : 'border-solid'}`}
    >
      <header className="border-b border-slate-200/70 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className={`text-xl font-semibold ${HEADER_ACCENT[id]}`}>{label}</h2>
          <span className="tabular-nums text-sm font-medium text-slate-600">
            {count} <span className="text-slate-400">/ {total}</span>
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        {primengCount > 0 && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">
            {primengCount} requieren PrimeNG
          </p>
        )}
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto p-3">{children}</div>
    </section>
  );
}
