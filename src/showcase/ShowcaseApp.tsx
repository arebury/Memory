import { useEffect, useMemo, useState } from 'react';
import { BAGS, CANONICAL_ASSIGNMENTS, POINTS, type BagId } from './data';
import { load, reset, save, type Assignments } from './storage';
import { Bag } from './Bag';
import { Point } from './Point';

export function ShowcaseApp() {
  const [assignments, setAssignments] = useState<Assignments>(() => load(CANONICAL_ASSIGNMENTS));
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    save(assignments);
  }, [assignments]);

  const handleDrop = (pointId: string, bagId: BagId) => {
    setAssignments((prev) => (prev[pointId] === bagId ? prev : { ...prev, [pointId]: bagId }));
  };

  const handleReset = () => {
    reset();
    setAssignments(CANONICAL_ASSIGNMENTS);
  };

  const byBag = useMemo(() => {
    const grouped: Record<BagId, typeof POINTS> = { backlog: [], v1: [], v2: [] };
    for (const p of POINTS) {
      const bag = assignments[p.id] ?? p.canonical;
      grouped[bag].push(p);
    }
    return grouped;
  }, [assignments]);

  const movedCount = useMemo(
    () => POINTS.filter((p) => (assignments[p.id] ?? p.canonical) !== p.canonical).length,
    [assignments],
  );

  return (
    <div className="flex h-full flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              SISMAC-2858 · Transcripción masiva
            </p>
            <h1 className="text-lg font-semibold text-slate-900">v1 vs v2 · qué entra dónde</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {movedCount === 0 ? 'Asignación canónica intacta' : `${movedCount} movidos del canon`}
            </span>
            <a
              href="/showcase-standalone.html"
              download
              title="HTML autocontenido · ábrelo desde el disco sin servidor"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Descargar HTML
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
            >
              Reset al canon
            </button>
          </div>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500">
          Arrastra cada punto entre Backlog, v1 y v2. Pre-asignados según{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">docs/coa-transcripcion-masiva.md</code>. Los items con
          pin <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-800">PrimeNG</span>
          {' '}requieren componetización — corre en paralelo, no es stopper.
        </p>
      </header>

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-4 p-6 md:grid-cols-3">
        {BAGS.map((bag) => {
          const items = byBag[bag.id];
          const primengCount = items.filter((p) => p.needsPrimeng).length;
          return (
            <Bag
              key={bag.id}
              id={bag.id}
              label={bag.label}
              subtitle={bag.subtitle}
              count={items.length}
              total={POINTS.length}
              primengCount={primengCount}
              onDrop={handleDrop}
            >
              {items.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-300 bg-white/50 p-6 text-center text-xs text-slate-400">
                  Vacía. Suelta puntos aquí.
                </p>
              ) : (
                items.map((point) => (
                  <div key={point.id} className={dragging === point.id ? 'opacity-40' : ''}>
                    <Point
                      point={point}
                      onDragStart={(id) => setDragging(id)}
                      onDragEnd={() => setDragging(null)}
                    />
                  </div>
                ))
              )}
            </Bag>
          );
        })}
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-3 text-[11px] text-slate-500">
        Total {POINTS.length} puntos · Invariante: Backlog + v1 + v2 = {POINTS.length}. Persistencia en{' '}
        <code className="rounded bg-slate-100 px-1 py-0.5">localStorage</code>.
      </footer>
    </div>
  );
}
