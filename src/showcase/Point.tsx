import type { Point as PointType } from './data';

type Props = {
  point: PointType;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
};

const SOURCE_LABEL: Record<PointType['source'], string> = {
  pdf: 'PDF PM',
  coa: 'COA',
  ambos: 'PDF + COA',
};

export function Point({ point, onDragStart, onDragEnd }: Props) {
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', point.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(point.id);
      }}
      onDragEnd={onDragEnd}
      className="group cursor-grab active:cursor-grabbing rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-tight text-slate-900">{point.label}</h3>
        {point.needsPrimeng && (
          <span
            title="Requiere componetización con PrimeNG (paralelo, no stopper)"
            className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800"
          >
            PrimeNG
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-snug text-slate-600">{point.description}</p>
      <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-400">
        <span>Fuente · {SOURCE_LABEL[point.source]}</span>
        <span aria-hidden>·</span>
        <span>Canon · {point.canonical}</span>
      </div>
    </article>
  );
}
