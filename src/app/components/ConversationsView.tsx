import { useState, useMemo, useEffect } from "react";
import { Home, ChevronRight, Download, Columns3, AlignLeft, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Toaster } from "./ui/sonner";
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
    setConversations(getSample(sampleId).build());
    setSelectedIds([]);
    setProcessingIds([]);
    setAnalyzingIds([]);
    setNewlyTranscribedIds([]);
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

  const [typeFilters, setTypeFilters] = useState({
    interna: true,
    externa: true,
    llamada: true,
    chat: true,
    entrante: true,
    saliente: true,
  });

  const [ruleFilters, setRuleFilters] = useState({
    recording: false,
    transcription: false,
    classification: false,
  });

  const [isTypeFilterPanelOpen, setIsTypeFilterPanelOpen] = useState(false);
  const [isCategoryFilterPanelOpen, setIsCategoryFilterPanelOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [unifiedTypeFilters, setUnifiedTypeFilters] = useState({
    types: { interna: true, externa: true },
    channels: { llamada: true, chat: true },
    directions: { entrante: true, saliente: true },
    rules: { recording: false, transcription: false, classification: false },
  });

  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    conversations.forEach(conv => {
      if (conv.aiCategories) conv.aiCategories.forEach(cat => categoriesSet.add(cat));
    });
    return Array.from(categoriesSet).sort();
  }, [conversations]);

  useEffect(() => {
    setTypeFilters({
      interna: unifiedTypeFilters.types.interna,
      externa: unifiedTypeFilters.types.externa,
      llamada: unifiedTypeFilters.channels.llamada,
      chat: unifiedTypeFilters.channels.chat,
      entrante: unifiedTypeFilters.directions.entrante,
      saliente: unifiedTypeFilters.directions.saliente,
    });
    setRuleFilters({
      recording: unifiedTypeFilters.rules.recording,
      transcription: unifiedTypeFilters.rules.transcription,
      classification: unifiedTypeFilters.rules.classification,
    });
  }, [unifiedTypeFilters]);

  useEffect(() => {
    const now = new Date();
    setLastSearchTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`);
  }, []);

  useEffect(() => {
    const now = new Date();
    setLastSearchTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`);
  }, [filters, typeFilters, columnFilters, selectedCategories, ruleFilters]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      if (filters.services.length > 0) {
        const serviceMatch = filters.services.some(v => conv.service.toLowerCase().includes(v.toLowerCase()));
        if (!serviceMatch) return false;
      }
      if (filters.origin && !conv.origin.toLowerCase().includes(filters.origin.toLowerCase())) return false;
      if (filters.destination && !conv.destination.toLowerCase().includes(filters.destination.toLowerCase())) return false;
      if (filters.groups.length > 0) {
        const groupMatch = filters.groups.some(v => conv.group.toLowerCase().includes(v.toLowerCase()));
        if (!groupMatch) return false;
      }
      if (filters.agents.length > 0) {
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
  }, [conversations, filters, typeFilters, ruleFilters, columnFilters, selectedCategories]);

  const handleDownload = () => {
    alert(`Descargando ${selectedIds.length} conversación(es)`);
  };

  /* ── Transcription: moves IDs through processing → newlyTranscribed.
        On completion, also generates a random transcription so the
        single-conversation player has content to render. ──────────── */
  const handleRequestTranscription = (ids: string | string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    setProcessingIds(prev => [...new Set([...prev, ...idArray])]);
    setTimeout(() => {
      setProcessingIds(prev => prev.filter(id => !idArray.includes(id)));
      setNewlyTranscribedIds(prev => [...new Set([...prev, ...idArray])]);
      setConversations(prev =>
        prev.map(c => {
          if (!idArray.includes(c.id)) return c;
          return {
            ...c,
            hasTranscription: true,
            // Only seed lines for entries that don't already have them.
            transcription: c.transcription ?? generateTranscriptionFor(c),
          };
        }),
      );
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
    setAnalyzingIds(prev => [...new Set([...prev, ...idArray])]);
    setTimeout(() => {
      setAnalyzingIds(prev => prev.filter(id => !idArray.includes(id)));
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
    handleRequestTranscription(idArray);
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
      <div className="bg-white border-b border-[#CFD3DE] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Home size={15} className="text-[#8D939D]" />
            <ChevronRight size={14} className="text-[#CFD3DE]" />
            <span className="text-[#8D939D]">Monitor</span>
            <ChevronRight size={14} className="text-[#CFD3DE]" />
            <span className="text-[#233155] font-medium">Conversaciones</span>
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
        <div className="bg-white px-6 py-3.5 border-b border-[#CFD3DE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            {/* Column filter toggle */}
            <Button 
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              variant="outline"
              className={`h-9 px-4 gap-2 text-sm font-medium border-[#D2D6E0] hover:bg-[#F4F6FC] ${showColumnFilters ? 'bg-[#F4F6FC]' : ''}`}
            >
              <Columns3 size={15} className="text-[#233155]" />
              <span className="text-[#233155]">Filtros</span>
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
                    unifiedTypeFilters.rules.classification
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

              {/* Categorías IA — hidden, preserved for future re-enable */}
              {false && showCategoryFilter && (
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

            <div className="h-6 w-px bg-[#E5E7EB]" />

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
                    className={`h-9 w-9 relative transition-all ${
                      !hasSelection
                        ? 'text-[#9CA3AF] cursor-not-allowed hover:bg-transparent'
                        : 'text-[#60D3E4] hover:text-[#4FC3D3] hover:bg-[#EEFBFD]'
                    }`}
                  >
                    <AlignLeft size={18} strokeWidth={1.75} />
                    {hasSelection && (
                      <span className="absolute -top-1 -right-1 bg-[#233155] text-white text-[9px] rounded-full min-w-[16px] h-4 px-0.5 flex items-center justify-center leading-none font-medium">
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
                        ? 'text-[#9CA3AF] cursor-not-allowed hover:bg-transparent'
                        : 'text-[#60D3E4] hover:text-[#4FC3D3] hover:bg-[#EEFBFD]'
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

            {/* Help / docs — replaces the "avatar emoji" easter-egg.
                Lives in the toolbar where supervisors look for help. */}
            <span className="ml-1 h-6 w-px bg-[#E5E7EB]" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => window.open("https://group-image-51851861.figma.site", "_blank", "noopener,noreferrer")}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-[#8D939D] transition-all hover:bg-[#F4F6FC] hover:text-[#233155]"
                    aria-label="Abrir documentación"
                  >
                    <HelpCircle size={18} strokeWidth={1.75} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Documentación</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>

          {/* Result count */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-[#8D939D]">
              Resultados: <span className="text-[#233155] font-medium">{filteredConversations.length}</span> | Última Búsqueda: <span className="text-[#233155] font-light">{lastSearchTime}</span>
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
        onConfirm={handleBulkConfirm}
      />

    </div>
  );
}