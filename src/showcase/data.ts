export type BagId = 'backlog' | 'v1' | 'v2';

export type Point = {
  id: string;
  label: string;
  description: string;
  canonical: 'v1' | 'v2';
  needsPrimeng: boolean;
  source: 'pdf' | 'coa' | 'ambos';
};

export const BAGS: { id: BagId; label: string; subtitle: string }[] = [
  { id: 'backlog', label: 'Backlog', subtitle: 'Sin decidir' },
  { id: 'v1', label: 'v1', subtitle: 'Rollout inicial' },
  { id: 'v2', label: 'v2', subtitle: 'Target medio plazo' },
];

export const POINTS: Point[] = [
  {
    id: 'modal-masivo-v11',
    label: 'Modal masivo "Procesar conversaciones" (v11)',
    description: 'Taxonomía de destinos mutuamente excluyentes: dest1 + dest2 + dest3 = total seleccionadas.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'ambos',
  },
  {
    id: 'hint-incluye-excluye',
    label: 'Hint del hero "Incluye … · Excluye …"',
    description: 'Bajo la celda izquierda del modal: resume multi-tramo, parciales y en-proceso filtrados.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'coa',
  },
  {
    id: 'toggle-analisis-shake',
    label: 'Toggle "Incluir análisis" + lock con shake',
    description: 'Bloqueado en ON cuando analysisOnlyMode (c.t === 0 && c.ea + ch.ea > 0). Shake 320 ms al intentar clicar.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'ambos',
  },
  {
    id: 'sticky-toast',
    label: 'Sticky toast persistente',
    description: '"Generando transcripción…" / "Generando análisis…" sin auto-cierre, con × manual.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'ambos',
  },
  {
    id: 'filtro-gdpr-enproceso',
    label: 'Filtrado silencioso (GDPR vencida + en-proceso)',
    description: 'Caen del lote sin aviso. GDPR vencida es atenuada en tabla con tooltip; en-proceso se omiten para evitar doble coste.',
    canonical: 'v1',
    needsPrimeng: false,
    source: 'coa',
  },
  {
    id: 'btn-analisis-header',
    label: 'Botón "Análisis" en header del reproductor unitario',
    description: 'Nuevo en v1. Lanza análisis sin modal de confirmación. Deshabilitado si no hay transcripción o ya está analizado.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'ambos',
  },
  {
    id: 'sin-modal-confirm-intermedio',
    label: 'Quitar modal de confirmación intermedio',
    description: 'Cost cue inline en el CTA ("genera coste · ~30 s") sustituye al modal de "vas a generar coste".',
    canonical: 'v1',
    needsPrimeng: false,
    source: 'coa',
  },
  {
    id: 'sin-diarizacion',
    label: 'Quitar diarización · renombrar tabs',
    description: 'Diarización fuera del producto. Tabs pasan a "Transcripción" y "Análisis".',
    canonical: 'v1',
    needsPrimeng: false,
    source: 'ambos',
  },
  {
    id: 'filtros-multi-grabacion',
    label: 'Filtros "Solo fallidas" / multi-grabación',
    description: 'Sección Estado y sección Multi-grabación del panel de filtros, con chips cerrables en la toolbar.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'coa',
  },
  {
    id: 'fila-recien-cambiada',
    label: 'Estado fila "Recientemente cambiada" (amarillo)',
    description: 'Tras transcribir o analizar, fila amarilla suave hasta que el supervisor la inspecciona (click la reinicia).',
    canonical: 'v1',
    needsPrimeng: false,
    source: 'ambos',
  },
  {
    id: 'fila-fallida-ver-fallidas',
    label: 'Estado fila "Transcripción fallida" + "Ver fallidas"',
    description: 'Icono rojo en columna Estado, toast de error con acción "Ver fallidas" que activa filtro automático.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'ambos',
  },
  {
    id: 'marcar-como-leidas',
    label: 'Marcar como leídas (toolbar)',
    description: 'Acción ✓✓ junto a Procesar y Descargar. Persistente per-supervisor — requiere endpoint backend.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'coa',
  },
  {
    id: 'modal-download-legacy',
    label: 'Modal Download legacy heredado',
    description: 'Unitario: 2 checkboxes (Records + Recordings/Chats) on. Bulk: 3 (Record · CDR · Recordings/Chats) off, botón disabled hasta marcar uno.',
    canonical: 'v1',
    needsPrimeng: false,
    source: 'coa',
  },
  {
    id: 'toast-exito-batch',
    label: 'Toast de éxito al cerrar batch',
    description: 'Reemplaza al sticky tras terminar: "N transcripciones listas" / "N análisis listos". Auto-cierra en pocos segundos.',
    canonical: 'v1',
    needsPrimeng: true,
    source: 'coa',
  },
  {
    id: 'sticky-head-reproductor',
    label: 'Sticky head del reproductor unitario',
    description: 'Audio bar + tabs pinned arriba. Al hacer scroll dentro del cuerpo, transporte y tabs siguen visibles.',
    canonical: 'v2',
    needsPrimeng: true,
    source: 'coa',
  },
  {
    id: 'multitramo-unificado',
    label: 'Reproductor multi-tramo unificado',
    description: 'Un solo componente de tres filas: transport con tiempo, barra segmentada proporcional, etiquetas con flechas.',
    canonical: 'v2',
    needsPrimeng: true,
    source: 'coa',
  },
  {
    id: 'per-tramo-check',
    label: 'Per-tramo Check icon',
    description: 'Cada tramo transcrito muestra un check pequeño. Asimetría presente/ausente, no verde/gris.',
    canonical: 'v2',
    needsPrimeng: false,
    source: 'coa',
  },
  {
    id: 'empty-states-refinados',
    label: 'Empty states refinados',
    description: 'Tres variantes consistentes para Transcripción y Análisis, centradas sobre el área visible real.',
    canonical: 'v2',
    needsPrimeng: true,
    source: 'coa',
  },
  {
    id: 'columna-estado-multi',
    label: 'Columna "Estado" → multi-columna explícita',
    description: 'Una columna por tipo (grabación · transcripción · clasificación · fallida) con check / vacío. Elimina carga cognitiva del icono.',
    canonical: 'v2',
    needsPrimeng: true,
    source: 'coa',
  },
];

export const CANONICAL_ASSIGNMENTS: Record<string, BagId> = POINTS.reduce(
  (acc, p) => {
    acc[p.id] = p.canonical;
    return acc;
  },
  {} as Record<string, BagId>,
);
