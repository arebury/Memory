import { useState, useMemo, useEffect } from "react";
import { Home, ChevronRight, Download, Columns3, AlignLeft, HelpCircle, Calculator, Palette, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Toaster } from "./ui/sonner";
import { scToast } from "./ui/sc-toast";
import { ConversationFilters } from "./ConversationFilters";
import { ConversationTable } from "./ConversationTable";
import { TypeFilterPanel } from "./TypeFilterPanel";
import { TypeFilterButton } from "./TypeFilterButton";
import { CategoryFilterButton } from "./CategoryFilterButton";
import { CategoryFilterPanel } from "./CategoryFilterPanel";
import { BulkTranscriptionModal } from "./BulkTranscriptionModal";
import { MockSampleSwitcher } from "./MockSampleSwitcher";
import { Conversation } from "../data/mockData";
import { defaultSampleId, getSample } from "../data/mockSamples";
import { generateTranscriptionFor } from "../data/mockTranscriptionGenerator";

/* Deterministic random AI categories for newly-analyzed conversations. */
const ANALYSIS_CATEGORY_POOL = [
  "Soporte Técnico",
  "Consulta de precio",
  "Queja Cliente",
  "Venta",
  "Seguimiento",
  "Prospección",
  "Incidencia Masiva",
  "Consulta Interna",
  "Retención",
];
const pickRandomCategories = (id: string): string[] => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const pool = ANALYSIS_CATEGORY_POOL;
  const count = (h % 2) + 1; // 1 or 2 categories
  const first = pool[h % pool.length];
  if (count === 1) return [first];
  const second = pool[(h * 7 + 3) % pool.length];
  return first === second ? [first] : [first, second];
};

interface ConversationsViewProps {
  onNavigateToRepository: () => void;
  filters: {
    services: string[];
    dateRange: string;
    origin: string;
    destination: string;
    groups: string[];
    agents: string[];
  };
  onFiltersChange: (filters: any) => void;
}

export function ConversationsView({ 
  onNavigateToRepository,
  filters,
  onFiltersChange 
}: ConversationsViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastSearchTime, setLastSearchTime] = useState("");
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
  const [newlyTranscribedIds, setNewlyTranscribedIds] = useState<string[]>([]);
  const [isTranscriptionModalOpen, setIsTranscriptionModalOpen] = useState(false);

  /* Mock-data sample switching ──────────────────────────────────────
     `currentSampleId` is the active preset; `conversations` is the
     working copy that local mutations (transcribe / analyze a row)
     write to. Switching presets resets selection + processing. */
  const [currentSampleId, setCurrentSampleId] = useState(defaultSampleId);
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getSample(defaultSampleId).build(),
  );

  const handleSampleChange = (sampleId: string) => {
    if (sampleId === currentSampleId) return;
    setCurrentSampleId(sampleId);
    const next = getSample(sampleId).build();
    setConversations(next);
    setSelectedIds([]);
    setProcessingIds([]);
    setAnalyzingIds([]);
    setNewlyTranscribedIds([]);

    // Reset state-dependent filters al cambiar de sample — diferente
    // sample, distinto set de fallidas y de multi-rec parciales.
    setShowOnlyFailed(false);
    setShowOnlyMultiRec(false);
    setShowOnlyPartialMulti(false);

    // Demo affordance: when the failed-transcription sample loads,
    // surface the error toast pattern with the "Ver fallidas" action
    // — same shape the real product would use after a batch run that
    // ended with failures.
    const failedCount = next.filter((c) => c.hasFailedTranscription).length;
    if (failedCount > 0) {
      // Sticky (15.45 · decisión PM): el supervisor decide cuándo
      // cerrar el toast. Si lo descarta, no pierde la acción · el
      // filtro "Solo fallidas" sigue accesible desde el panel.
      scToast.error({
        title: `${failedCount} transcripciones fallaron`,
        message: "Audio en silencio o formato no soportado en algunas conversaciones.",
        action: {
          label: "Ver fallidas",
          onClick: () => setShowOnlyFailed(true),
        },
        duration: Infinity,
      });
    }
  };

  const [columnFilters, setColumnFilters] = useState({
    hourStart: "",
    hourEnd: "",
    dateRange: "",
    withRecording: false,
    withTranscription: false,
    withClassification: false,
    service: "",
    origin: "",
    group: "",
    destination: "",
    durationMin: "",
    durationMax: "",
    waitingMin: "",
    waitingMax: "",
    id: "",
  });

  const [isTypeFilterPanelOpen, setIsTypeFilterPanelOpen] = useState(false);
  const [helpPopoverOpen, setHelpPopoverOpen] = useState(false);
  const [isCategoryFilterPanelOpen, setIsCategoryFilterPanelOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [unifiedTypeFilters, setUnifiedTypeFilters] = useState({
    types: { interna: true, externa: true },
    channels: { llamada: true, chat: true },
    directions: { entrante: true, saliente: true },
    rules: { recording: false, transcription: false, classification: false },
    status: { onlyFailed: false },
    multirec: { onlyMulti: false, onlyPartial: false },
  });

  // `showOnlyFailed` is derived from `unifiedTypeFilters.status.onlyFailed`.
  // Single source of truth so the chip in the toolbar and the panel
  // checkbox can never drift apart. The derived const keeps the existing
  // filter pipeline downstream untouched.
  const showOnlyFailed = unifiedTypeFilters.status.onlyFailed;
  const setShowOnlyFailed = (value: boolean) =>
    setUnifiedTypeFilters((prev) => ({
      ...prev,
      status: { ...prev.status, onlyFailed: value },
    }));

  // Multi-grabación filters (15.43+). `onlyMulti` reduce a llamadas con
  // varios tramos · `onlyPartial` adicionalmente exige mezcla (algunos
  // tramos transcritos, otros pendientes). El segundo es la protección
  // directa contra el footgun: el supervisor transcribe un tramo en
  // unitario, luego hace select-all sin querer reprocesar los otros
  // tramos. Activando el filtro encuentra esas conversaciones de un
  // vistazo y las puede excluir manualmente.
  const showOnlyMultiRec = unifiedTypeFilters.multirec.onlyMulti;
  const showOnlyPartialMulti = unifiedTypeFilters.multirec.onlyPartial;
  const setShowOnlyMultiRec = (value: boolean) =>
    setUnifiedTypeFilters((prev) => ({
      ...prev,
      multirec: { ...prev.multirec, onlyMulti: value },
    }));
  const setShowOnlyPartialMulti = (value: boolean) =>
    setUnifiedTypeFilters((prev) => ({
      ...prev,
      multirec: { ...prev.multirec, onlyPartial: value },
    }));

  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    conversations.forEach(conv => {
      if (conv.aiCategories) conv.aiCategories.forEach(cat => categoriesSet.add(cat));
    });
    return Array.from(categoriesSet).sort();
  }, [conversations]);

  /* `typeFilters` y `ruleFilters` son proyecciones planas de
     `unifiedTypeFilters`. Antes vivían en useState con un useEffect
     que sincronizaba al cambiar el unified — patrón "estado derivado
     vía effect" que React desaconseja: el effect corre TRAS el render,
     dejando un frame intermedio donde los downstream consumers ven
     valores stale. useMemo computa la proyección en el mismo render
     que el cambio del unified, sin frame intermedio y sin useState
     redundante. (Sec 17 P2 cerrado en 15.40.) */
  const typeFilters = useMemo(() => ({
    interna: unifiedTypeFilters.types.interna,
    externa: unifiedTypeFilters.types.externa,
    llamada: unifiedTypeFilters.channels.llamada,
    chat: unifiedTypeFilters.channels.chat,
    entrante: unifiedTypeFilters.directions.entrante,
    saliente: unifiedTypeFilters.directions.saliente,
  }), [unifiedTypeFilters]);

  const ruleFilters = useMemo(() => ({
    recording: unifiedTypeFilters.rules.recording,
    transcription: unifiedTypeFilters.rules.transcription,
    classification: unifiedTypeFilters.rules.classification,
  }), [unifiedTypeFilters]);

  useEffect(() => {
    const now = new Date();
    setLastSearchTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`);
  }, []);

  useEffect(() => {
    const now = new Date();
    setLastSearchTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`);
  }, [filters, typeFilters, columnFilters, selectedCategories, ruleFilters]);

  /* Date strings live in DD/MM/YYYY both in `filters.dateRange` (set by
     DateRangePicker) and in `conv.date` (mock entries). Compare as
     epoch ms after parsing so we don't depend on string ordering. The
     dateRange string can be either a single date "DD/MM/YYYY" or a
     range "DD/MM/YYYY - DD/MM/YYYY". */
  const parseDDMMYYYY = (s: string): number | null => {
    const [d, m, y] = s.trim().split("/").map(Number);
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d).getTime();
  };
  const dateBounds = useMemo(() => {
    const raw = filters.dateRange?.trim();
    if (!raw) return null;
    const parts = raw.split(" - ");
    const from = parseDDMMYYYY(parts[0] ?? "");
    if (from === null) return null;
    const to = parts[1] ? parseDDMMYYYY(parts[1]) : from;
    return { from, to: to ?? from };
  }, [filters.dateRange]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // "Ver fallidas" filter — applied first so an error-ridden batch
      // can be reviewed without losing other column filters.
      if (showOnlyFailed && !conv.hasFailedTranscription) return false;
      // Multi-grabación filters (15.43+).
      const recs = conv.recordings ?? [];
      const isMulti = recs.length > 1;
      if (showOnlyMultiRec && !isMulti) return false;
      if (showOnlyPartialMulti) {
        if (!isMulti) return false;
        const someTrans = recs.some((r) => r.hasTranscription);
        const allTrans = recs.every((r) => r.hasTranscription);
        if (!someTrans || allTrans) return false; // requiere mezcla
      }
      if (filters.services.length > 0) {
        const serviceMatch = filters.services.some(v => conv.service.toLowerCase().includes(v.toLowerCase()));
        if (!serviceMatch) return false;
      }
      if (dateBounds) {
        const convTs = parseDDMMYYYY(conv.date);
        if (convTs === null) return false;
        if (convTs < dateBounds.from || convTs > dateBounds.to) return false;
      }
      if (filters.origin && !conv.origin.toLowerCase().includes(filters.origin.toLowerCase())) return false;
      if (filters.destination && !conv.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
      if (filters.groups.length > 0) {
        const groupMatch = filters.groups.some(v => conv.group.toLowerCase().includes(v.toLowerCase()));
        if (!groupMatch) return false;
      }
      if (filters.agents.length > 0) {
        // En los mocks `origin` ES el nombre del agente para llamadas
        // salientes (Oscar Fernández, María García, …), así que filtrar
        // por origin coincide con filtrar por agente. Si en el futuro
        // el modelo separa los conceptos (ej. campo `agent` distinto
        // de `origin` para llamadas entrantes con DNI/teléfono cliente),
        // este filtro deja silenciosamente de matchear las entrantes.
        const agentMatch = filters.agents.some(v => conv.origin.toLowerCase().includes(v.toLowerCase()));
        if (!agentMatch) return false;
      }
      if (!typeFilters.interna && conv.type === "interna") return false;
      if (!typeFilters.externa && conv.type === "externa") return false;
      if (!typeFilters.llamada && conv.channel === "llamada") return false;
      if (!typeFilters.chat && conv.channel === "chat") return false;
      if (!typeFilters.entrante && conv.direction === "entrante") return false;
      if (!typeFilters.saliente && conv.direction === "saliente") return false;
      if (ruleFilters.recording && !conv.hasRecording) return false;
      if (ruleFilters.transcription && !conv.hasTranscription) return false;
      if (ruleFilters.classification && !conv.hasClassificationRule) return false;
      if (selectedCategories.length > 0) {
        if (!conv.aiCategories || conv.aiCategories.length === 0) return false;
        if (!selectedCategories.every(c => conv.aiCategories!.includes(c))) return false;
      }
      if (columnFilters.hourStart || columnFilters.hourEnd) {
        if (columnFilters.hourStart && conv.hour < columnFilters.hourStart) return false;
        if (columnFilters.hourEnd && conv.hour > columnFilters.hourEnd) return false;
      }
      if (columnFilters.withRecording && !conv.hasRecording) return false;
      if (columnFilters.withTranscription && !conv.hasTranscription) return false;
      if (columnFilters.withClassification && !conv.hasClassificationRule) return false;
      if (columnFilters.service && !conv.service.toLowerCase().includes(columnFilters.service.toLowerCase())) return false;
      if (columnFilters.origin && !conv.origin.toLowerCase().includes(columnFilters.origin.toLowerCase())) return false;
      if (columnFilters.group && !conv.group.toLowerCase().includes(columnFilters.group.toLowerCase())) return false;
      if (columnFilters.destination && !conv.destination.toLowerCase().includes(columnFilters.destination.toLowerCase())) return false;
      if (columnFilters.durationMin || columnFilters.durationMax) {
        if (columnFilters.durationMin && conv.duration < columnFilters.durationMin) return false;
        if (columnFilters.durationMax && conv.duration > columnFilters.durationMax) return false;
      }
      if (columnFilters.waitingMin || columnFilters.waitingMax) {
        if (columnFilters.waitingMin && conv.waiting < columnFilters.waitingMin) return false;
        if (columnFilters.waitingMax && conv.waiting > columnFilters.waitingMax) return false;
      }
      if (columnFilters.id && !conv.id.toLowerCase().includes(columnFilters.id.toLowerCase())) return false;
      return true;
    });
  }, [conversations, filters, typeFilters, ruleFilters, columnFilters, selectedCategories, showOnlyFailed, showOnlyMultiRec, showOnlyPartialMulti, dateBounds]);

  const handleDownload = () => {
    const n = selectedIds.length;
    scToast.info({
      title: n === 1 ? "Descargando 1 conversación" : `Descargando ${n} conversaciones`,
    });
  };

  /* ── Transcription: moves IDs through processing → newlyTranscribed.
        On completion, also generates a random transcription so the
        single-conversation player has content to render.

        Multi-rec rule (sec 13.13): bulk transcribe acts on the WHOLE
        conversation — every leg flips to transcribed. The aggregate
        `hasTranscription` is "all legs transcribed", so single-rec
        and multi-rec converge to the same shape on the conversation
        record. The toast counter uses tramos (not conversations) so
        the user sees the real cost. ──────────────────────────────── */
  const handleRequestTranscription = (ids: string | string[], inChain = false) => {
    const idArrayRaw = Array.isArray(ids) ? ids : [ids];
    // GDPR custody (15.40): conversaciones deleted no se transcriben
    // — la custodia ya venció. Filtro defensivo para que llamadas
    // directas (no vía bulk modal) tampoco las procesen accidentalmente.
    const deletedIds = new Set(
      conversations.filter((c) => c.deleted).map((c) => c.id),
    );
    const idArray = idArrayRaw.filter((id) => !deletedIds.has(id));
    if (idArray.length === 0) return;

    // Sticky kickoff toast (15.43 · Figma parity · sec 13.16). Persiste
    // mientras dura la operación para que el supervisor vea estado aun
    // si cambia de vista. Mismo id que la success final → sonner hace
    // update in-place. En chain (transcribir + analizar) suprimimos la
    // success de la fase 1 para que el toast pase a "Generando análisis..."
    // sin un flash intermedio de "Transcripción lista".
    scToast.info({
      title: "Generando transcripción...",
      duration: Infinity,
      dismiss: true,
      id: "progress-toast",
    });

    setProcessingIds(prev => [...new Set([...prev, ...idArray])]);
    let tramoCount = 0;
    setTimeout(() => {
      setProcessingIds(prev => prev.filter(id => !idArray.includes(id)));
      setNewlyTranscribedIds(prev => [...new Set([...prev, ...idArray])]);
      setConversations(prev =>
        prev.map(c => {
          if (!idArray.includes(c.id)) return c;
          // Multi-rec: flip every UNTRANSCRIBED leg (skip already done) and
          // recompute the aggregate. Counts only the legs we actually
          // touched so the toast doesn't lie when some legs were already
          // transcribed before the bulk run.
          if (c.recordings && c.recordings.length > 1) {
            const flipped = c.recordings.map(r =>
              r.hasTranscription ? r : { ...r, hasTranscription: true },
            );
            const newlyTranscribed = c.recordings.filter(r => !r.hasTranscription).length;
            tramoCount += newlyTranscribed;
            return {
              ...c,
              hasTranscription: true,
              recordings: flipped,
              transcription: c.transcription ?? generateTranscriptionFor(c),
            };
          }
          tramoCount += 1;
          return {
            ...c,
            hasTranscription: true,
            transcription: c.transcription ?? generateTranscriptionFor(c),
          };
        }),
      );
      if (inChain) return;
      const n = idArray.length;
      const multiRec = tramoCount > n;
      scToast.success({
        id: "progress-toast",
        title: n === 1 ? "Transcripción lista" : `${n} transcripciones listas`,
        message: multiRec
          ? `Incluye ${tramoCount} audios en total (algunas llamadas tienen varios tramos).`
          : n === 1
            ? "Ya puedes consultarla en el reproductor."
            : "Ya están disponibles en la tabla.",
      });
    }, 6000);
  };

  /* ── Analysis: flips `hasAnalysis` and seeds AI categories so the
        Análisis tab in the player has visible payload after the run.

        Invariant: analysis is derived FROM the transcript, so a row
        without transcription cannot be analyzed. The eligibility check
        runs INSIDE `setConversations(prev => …)` so it always reads
        the latest state — the previous closure-based filter broke the
        transcribe→analyze chain because the filter ran with stale
        conversations from click-time. */
  const handleRequestAnalysis = (ids: string | string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids];

    // Sticky kickoff toast (15.43 · sec 13.16). Reusa `progress-toast`:
    // si la fase anterior fue "Generando transcripción..." (chain), sonner
    // hace update in-place al cambiar el copy.
    scToast.info({
      title: "Generando análisis...",
      duration: Infinity,
      dismiss: true,
      id: "progress-toast",
    });

    setAnalyzingIds(prev => [...new Set([...prev, ...idArray])]);
    setTimeout(() => {
      setAnalyzingIds(prev => prev.filter(id => !idArray.includes(id)));
      // Yellow-row marker: any row that completed a state-changing op
      // (transcription OR analysis) should flag as "recently changed"
      // until the user clicks it. Previously only transcription added
      // here → bulk runs that fed already-transcribed rows through the
      // analysis-only path lost the yellow cue.
      setNewlyTranscribedIds(prev => [...new Set([...prev, ...idArray])]);
      setConversations(prev =>
        prev.map(c => {
          if (!idArray.includes(c.id)) return c;
          // Latest-state guard: only flip hasAnalysis if the row
          // actually has transcription. A non-transcribed id passes
          // through untouched.
          if (!c.hasTranscription) return c;
          return {
            ...c,
            hasAnalysis: true,
            aiCategories:
              c.aiCategories && c.aiCategories.length > 0
                ? c.aiCategories
                : pickRandomCategories(c.id),
          };
        }),
      );
      const n = idArray.length;
      scToast.success({
        id: "progress-toast",
        title: n === 1 ? "Análisis listo" : `${n} análisis listos`,
        message: "Resumen y sentimiento ya disponibles.",
      });
    }, 4000);
  };

  /* ── Chain: transcribe → analyze. Queue an id; when the
        transcription mutation lands (effect below), drain it and
        kick off analysis. Replaces the old setTimeout(6500) chain
        which was brittle — coupled to the parent's transcription
        timer and broke if anyone changed the 6000 ms value. The
        event-driven version works regardless of the timer. */
  const [chainAnalysisIds, setChainAnalysisIds] = useState<string[]>([]);

  useEffect(() => {
    if (chainAnalysisIds.length === 0) return;
    const ready = chainAnalysisIds.filter(id => {
      const conv = conversations.find(c => c.id === id);
      return conv?.hasTranscription === true;
    });
    if (ready.length === 0) return;
    setChainAnalysisIds(prev => prev.filter(id => !ready.includes(id)));
    handleRequestAnalysis(ready);
    // We DON'T list `handleRequestAnalysis` as a dep — it's a stable
    // reference within this component's lifetime (no useCallback needed).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, chainAnalysisIds]);

  const handleRequestTranscriptionAndAnalysis = (ids: string | string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    setChainAnalysisIds(prev => [...new Set([...prev, ...idArray])]);
    // inChain=true → suprime el success intermedio; el sticky pasa de
    // "Generando transcripción..." a "Generando análisis..." sin flash.
    handleRequestTranscription(idArray, true);
  };

  const handleClearNewlyTranscribed = (id: string) => {
    setNewlyTranscribedIds(prev => prev.filter(prevId => prevId !== id));
  };

  /* onConfirm from BulkTranscriptionModal — splits the eligible IDs
     into "needs transcription" vs "already-transcribed, just analyze"
     so each goes through the right handler. The bulk modal already
     classifies these internally; we mirror that split here. */
  const handleBulkConfirm = async (
    opts: { includeAnalysis: boolean },
    eligibleIds: string[],
  ) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTranscriptionModalOpen(false);
    setSelectedIds([]);

    // Classify against current conversations state.
    const needsTranscription: string[] = [];
    const alreadyTranscribed: string[] = [];
    for (const id of eligibleIds) {
      const conv = conversations.find(c => c.id === id);
      if (!conv) continue;
      if (conv.hasTranscription) alreadyTranscribed.push(id);
      else needsTranscription.push(id);
    }

    if (opts.includeAnalysis) {
      // Already-transcribed → analyze directly.
      if (alreadyTranscribed.length > 0) handleRequestAnalysis(alreadyTranscribed);
      // Needs transcription → chain transcribe → analyze.
      if (needsTranscription.length > 0)
        handleRequestTranscriptionAndAnalysis(needsTranscription);
    } else {
      // Toggle off: only transcribe what needs transcription. Already-
      // transcribed ids in eligibleIds shouldn't happen (the modal
      // sends only `readyToTranscribe` when toggle is off), but guard.
      if (needsTranscription.length > 0) handleRequestTranscription(needsTranscription);
    }
    // Kickoff acknowledgement vive ahora dentro de los handlers como
    // sticky toast `progress-toast` (15.43 · sec 13.16).
  };

  const showCategoryFilter = availableCategories.length > 0;
  const hasSelection = selectedIds.length > 0;

  // Memoized so BulkTranscriptionModal's inner useMemo doesn't re-fire
  // on every render of this view (parent re-renders are frequent).
  const selectedConversations = useMemo(
    () => conversations.filter(c => selectedIds.includes(c.id)),
    [selectedIds, conversations],
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Toaster />

      {/* Breadcrumb header */}
      <div className="bg-white border-b border-sc-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Home size={15} className="text-sc-muted" />
            <ChevronRight size={14} className="text-sc-border" />
            <span className="text-sc-muted">Monitor</span>
            <ChevronRight size={14} className="text-sc-border" />
            <span className="text-sc-primary font-medium">Conversaciones</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mock-data sample switcher · prototype-only */}
            <MockSampleSwitcher
              currentSampleId={currentSampleId}
              onChange={handleSampleChange}
            />
          </div>
        </div>
      </div>

      {/* Global filters bar */}
      <ConversationFilters 
        filters={filters} 
        onChange={onFiltersChange}
        onNavigateToRepository={onNavigateToRepository}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar row */}
        <div className="bg-white px-6 py-3.5 border-b border-sc-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            {/* Column filter toggle */}
            <Button 
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              variant="outline"
              className={`h-9 px-4 gap-2 text-sm font-medium border-sc-border hover:bg-sc-canvas ${showColumnFilters ? 'bg-sc-canvas' : ''}`}
            >
              <Columns3 size={15} className="text-sc-primary" />
              <span className="text-sc-primary">Filtros</span>
            </Button>
            
            {/* Type + Rules filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <TypeFilterButton
                  isActive={isTypeFilterPanelOpen}
                  hasActiveFilters={
                    !unifiedTypeFilters.types.interna ||
                    !unifiedTypeFilters.types.externa ||
                    !unifiedTypeFilters.channels.llamada ||
                    !unifiedTypeFilters.channels.chat ||
                    !unifiedTypeFilters.directions.entrante ||
                    !unifiedTypeFilters.directions.saliente ||
                    unifiedTypeFilters.rules.recording ||
                    unifiedTypeFilters.rules.transcription ||
                    unifiedTypeFilters.rules.classification ||
                    unifiedTypeFilters.status.onlyFailed ||
                    unifiedTypeFilters.multirec.onlyMulti ||
                    unifiedTypeFilters.multirec.onlyPartial
                  }
                  onClick={() => setIsTypeFilterPanelOpen(!isTypeFilterPanelOpen)}
                />
                <TypeFilterPanel
                  isOpen={isTypeFilterPanelOpen}
                  onClose={() => setIsTypeFilterPanelOpen(false)}
                  filters={unifiedTypeFilters}
                  onFiltersChange={setUnifiedTypeFilters}
                />
              </div>

              {/* Categorías IA — solo se muestra si los datos cargados
                  exponen categorías (samples sin clasificación lo ocultan
                  automáticamente para no enseñar un filtro vacío). */}
              {showCategoryFilter && (
                <div className="relative">
                  <CategoryFilterButton
                    isActive={isCategoryFilterPanelOpen}
                    hasActiveFilters={selectedCategories.length > 0}
                    onClick={() => setIsCategoryFilterPanelOpen(!isCategoryFilterPanelOpen)}
                    categoryCount={selectedCategories.length}
                  />
                  <CategoryFilterPanel
                    isOpen={isCategoryFilterPanelOpen}
                    onClose={() => setIsCategoryFilterPanelOpen(false)}
                    availableCategories={availableCategories}
                    selectedCategories={selectedCategories}
                    onSelectionChange={setSelectedCategories}
                  />
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-sc-border" />

            {/* Bulk transcribe trigger — AlignLeft icon mirrors the
                BulkTranscriptionModal header so the user maps trigger →
                destination by recognition. */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsTranscriptionModalOpen(true)}
                    disabled={!hasSelection}
                    variant="ghost"
                    size="icon"
                    aria-label={hasSelection ? `Transcribir selección (${selectedIds.length})` : "Transcribir selección"}
                    className={`h-9 w-9 relative transition-all ${
                      !hasSelection
                        ? 'text-sc-muted cursor-not-allowed hover:bg-transparent'
                        : 'text-sc-accent hover:text-sc-accent-strong hover:bg-sc-accent-soft'
                    }`}
                  >
                    <AlignLeft size={18} strokeWidth={1.75} />
                    {hasSelection && (
                      <span className="absolute -top-1 -right-1 bg-sc-primary text-white text-[9px] rounded-full min-w-[16px] h-4 px-0.5 flex items-center justify-center leading-none font-medium tabular-nums">
                        {selectedIds.length > 99 ? "99+" : selectedIds.length}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Transcribir selección ({selectedIds.length})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Download */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDownload}
                    disabled={!hasSelection}
                    variant="ghost"
                    size="icon"
                    className={`h-9 w-9 transition-all ${
                      !hasSelection
                        ? 'text-sc-muted cursor-not-allowed hover:bg-transparent'
                        : 'text-sc-accent hover:text-sc-accent-strong hover:bg-sc-accent-soft'
                    }`}
                  >
                    <Download size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Descargar ({selectedIds.length})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Help · popover con docs canónicos. Los .md viven en
                docs/ del repo; los enlaces abren la versión renderizada
                por GitHub (no inline · respeta la decisión 15.36 de no
                tener un DocumentationModal con render markdown propio).
                El item del Figma site sigue presente para validación UX. */}
            <Popover open={helpPopoverOpen} onOpenChange={setHelpPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-sc-muted transition-all hover:bg-sc-canvas hover:text-sc-primary data-[state=open]:bg-sc-canvas data-[state=open]:text-sc-primary"
                  aria-label="Documentación y validación"
                >
                  <HelpCircle size={18} strokeWidth={1.75} />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-[300px] p-[var(--sc-space-200)]"
              >
                <p className="px-[var(--sc-space-300)] pb-[var(--sc-space-200)] pt-[var(--sc-space-150)] text-sc-xs font-semibold uppercase tracking-wide text-sc-muted">
                  Documentación
                </p>

                {/* Tier 1 · documentación principal · full layout con
                    descripción + icon en accent-strong. Estos dos docs
                    son la entrada por defecto del stakeholder técnico. */}
                <button
                  type="button"
                  onClick={() => {
                    setHelpPopoverOpen(false);
                    window.open(
                      "https://github.com/arebury/Memory/blob/main/docs/logica-de-conteo.md",
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  className="flex w-full cursor-pointer items-start gap-[var(--sc-space-300)] rounded-sc-md px-[var(--sc-space-300)] py-[var(--sc-space-250)] text-left transition-colors hover:bg-sc-surface-muted focus:bg-sc-surface-muted focus:outline-none"
                >
                  <Calculator size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-sc-accent-strong" />
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-sc-sm font-medium text-sc-heading">Lógica de conteo y reglas</span>
                    <span className="text-sc-xs leading-snug text-sc-muted">Cómo cuenta cada componente, invariantes del modelo, casuísticas.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHelpPopoverOpen(false);
                    window.open(
                      "https://github.com/arebury/Memory/blob/main/docs/sistema-de-diseno.md",
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  className="flex w-full cursor-pointer items-start gap-[var(--sc-space-300)] rounded-sc-md px-[var(--sc-space-300)] py-[var(--sc-space-250)] text-left transition-colors hover:bg-sc-surface-muted focus:bg-sc-surface-muted focus:outline-none"
                >
                  <Palette size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-sc-accent-strong" />
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-sc-sm font-medium text-sc-heading">Sistema de diseño</span>
                    <span className="text-sc-xs leading-snug text-sc-muted">Tipografía, color, espacio, componentes y anti-patrones.</span>
                  </span>
                </button>

                {/* Separator + tier 2 · documentación complementaria.
                    Mismo icon size pero sin descripción y color muted
                    para reducir peso visual (jerarquía por layout, no
                    por chrome adicional). */}
                <div className="my-[var(--sc-space-200)] h-px bg-sc-border-soft" aria-hidden />
                <button
                  type="button"
                  onClick={() => {
                    setHelpPopoverOpen(false);
                    window.open(
                      "https://github.com/arebury/Memory/blob/main/docs/decisiones.md",
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  className="flex w-full cursor-pointer items-center gap-[var(--sc-space-300)] rounded-sc-md px-[var(--sc-space-300)] py-[var(--sc-space-200)] text-left transition-colors hover:bg-sc-surface-muted focus:bg-sc-surface-muted focus:outline-none"
                >
                  <BookOpen size={14} strokeWidth={1.75} className="shrink-0 text-sc-muted" />
                  <span className="text-sc-sm font-normal text-sc-body">Decisiones de diseño</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHelpPopoverOpen(false);
                    window.open(
                      "https://group-image-51851861.figma.site",
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  className="flex w-full cursor-pointer items-center gap-[var(--sc-space-300)] rounded-sc-md px-[var(--sc-space-300)] py-[var(--sc-space-200)] text-left transition-colors hover:bg-sc-surface-muted focus:bg-sc-surface-muted focus:outline-none"
                >
                  <ExternalLink size={14} strokeWidth={1.75} className="shrink-0 text-sc-muted" />
                  <span className="text-sc-sm font-normal text-sc-body">Validar UX en Figma</span>
                </button>
              </PopoverContent>
            </Popover>

          </div>

          {/* Result count */}
          <div className="flex items-center gap-4">
            {showOnlyFailed && (
              <button
                type="button"
                onClick={() => setShowOnlyFailed(false)}
                className="flex items-center gap-1.5 rounded-full border border-sc-error-base bg-sc-error-soft px-3 py-1 text-xs text-sc-error-strong hover:bg-sc-error-soft/70 cursor-pointer transition-colors"
              >
                <span className="font-medium">Solo fallidas</span>
                <span aria-hidden>·</span>
                <span>Limpiar filtro</span>
              </button>
            )}
            {showOnlyMultiRec && (
              <button
                type="button"
                onClick={() => setShowOnlyMultiRec(false)}
                className="flex items-center gap-1.5 rounded-full border border-sc-border bg-sc-surface-50 px-3 py-1 text-xs text-sc-body hover:bg-sc-canvas cursor-pointer transition-colors"
              >
                <span className="font-medium">Solo varios tramos</span>
                <span aria-hidden>·</span>
                <span>Limpiar filtro</span>
              </button>
            )}
            {showOnlyPartialMulti && (
              <button
                type="button"
                onClick={() => setShowOnlyPartialMulti(false)}
                className="flex items-center gap-1.5 rounded-full border border-sc-border bg-sc-surface-50 px-3 py-1 text-xs text-sc-body hover:bg-sc-canvas cursor-pointer transition-colors"
              >
                <span className="font-medium">Solo tramos parciales</span>
                <span aria-hidden>·</span>
                <span>Limpiar filtro</span>
              </button>
            )}
            <div className="text-sm text-sc-muted">
              Resultados: <span className="text-sc-primary font-medium tabular-nums">{filteredConversations.length}</span> | Última Búsqueda: <span className="text-sc-primary font-light tabular-nums">{lastSearchTime}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <ConversationTable
          conversations={filteredConversations}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showColumnFilters={showColumnFilters}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          ruleFilters={ruleFilters}
          processingIds={processingIds}
          analyzingIds={analyzingIds}
          newlyTranscribedIds={newlyTranscribedIds}
          onClearNewlyTranscribed={handleClearNewlyTranscribed}
          onRequestTranscription={(id) => handleRequestTranscription(id)}
          onRequestAnalysis={(id) => handleRequestAnalysis(id)}
          onRequestTranscriptionAndAnalysis={(id) =>
            handleRequestTranscriptionAndAnalysis(id)
          }
        />
      </div>

      {/* Transcription modal · always mounted so Radix can animate close */}
      <BulkTranscriptionModal
        isOpen={isTranscriptionModalOpen}
        onClose={() => setIsTranscriptionModalOpen(false)}
        selectedConversations={selectedConversations}
        processingIds={processingIds}
        analyzingIds={analyzingIds}
        onConfirm={handleBulkConfirm}
      />


    </div>
  );
}