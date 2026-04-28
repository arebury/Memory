import { useState, useMemo, useEffect } from "react";
import { Home, ChevronRight, Download, Columns3, FileText, ArrowUpRight } from "lucide-react";
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
import { mockConversations } from "../data/mockData";

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
  const [newlyTranscribedIds, setNewlyTranscribedIds] = useState<string[]>([]);
  const [isTranscriptionModalOpen, setIsTranscriptionModalOpen] = useState(false);

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
    mockConversations.forEach(conv => {
      if (conv.aiCategories) conv.aiCategories.forEach(cat => categoriesSet.add(cat));
    });
    return Array.from(categoriesSet).sort();
  }, []);

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
    return mockConversations.filter(conv => {
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
  }, [filters, typeFilters, ruleFilters, columnFilters, selectedCategories]);

  const handleDownload = () => {
    alert(`Descargando ${selectedIds.length} conversación(es)`);
  };

  /* ── Transcription: moves IDs through processing → newlyTranscribed ── */
  const handleRequestTranscription = (ids: string | string[]) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    setProcessingIds(prev => [...new Set([...prev, ...idArray])]);
    setTimeout(() => {
      setProcessingIds(prev => prev.filter(id => !idArray.includes(id)));
      setNewlyTranscribedIds(prev => [...new Set([...prev, ...idArray])]);
    }, 6000);
  };

  const handleClearNewlyTranscribed = (id: string) => {
    setNewlyTranscribedIds(prev => prev.filter(prevId => prevId !== id));
  };

  /* onConfirm from BulkTranscriptionModal */
  const handleBulkConfirm = async (_opts: { includeAnalysis: boolean }, eligibleIds: string[]) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    handleRequestTranscription(eligibleIds);
    setIsTranscriptionModalOpen(false);
    setSelectedIds([]);
  };

  const showCategoryFilter = availableCategories.length > 0;
  const hasSelection = selectedIds.length > 0;

  // Memoized so BulkTranscriptionModal's inner useMemo doesn't re-fire
  // on every render of this view (parent re-renders are frequent).
  const selectedConversations = useMemo(
    () => mockConversations.filter(c => selectedIds.includes(c.id)),
    [selectedIds],
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
            {/* Documentation easter-egg button */}
            <div className="relative group">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center relative cursor-pointer doc-button group-hover:scale-110 transition-transform duration-300"
                aria-label="¡Ah, esto no es un avatar, pero encontraste la validación de UX!"
              >
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none group-hover:opacity-0 transition-opacity duration-300"
                  style={{ 
                    animation: 'glow-gradient 4s ease-in-out infinite',
                    padding: '2px',
                    background: 'linear-gradient(45deg, #60D3E4, #4FC3D3, #60D3E4, #7FDBEA)',
                    backgroundSize: '200% 200%',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }}
                />
                <div className="absolute inset-0 rounded-full border-2 border-white shadow-sm bg-[#40A52B] group-hover:bg-[#60D3E4] transition-all duration-300" />
                <span className="relative z-10 text-xl group-hover:hidden transition-opacity duration-200">🤔</span>
                <span className="relative z-10 text-xl hidden group-hover:inline-block emoji-surprised">😱</span>
              </div>
              <div className="absolute right-0 top-0 w-48 h-20 -translate-y-1 translate-x-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-40" />
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-50 transition-opacity duration-300">
                <div className="relative bg-white rounded-xl px-3.5 py-2.5 shadow-2xl border border-[#60D3E4]/30">
                  <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-px">
                    <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                      <path d="M0 6 L10 8 L0 10 Z" fill="white" stroke="#60D3E4" strokeWidth="1" strokeOpacity="0.3"/>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#1C283D] whitespace-nowrap">
                      ¡Ah, esto no es un avatar, pero encontraste la validación de UX!
                    </p>
                    <div className="flex items-center gap-2 justify-center">
                      <button
                        onClick={() => window.open('https://group-image-51851861.figma.site', '_blank')}
                        className="flex items-center gap-1.5 bg-[#60D3E4] hover:bg-[#4FC3D3] text-white px-2.5 py-1 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 doc-glow-btn"
                      >
                        <FileText size={12} strokeWidth={2} />
                        <span className="text-xs">Ver documentación</span>
                        <ArrowUpRight size={12} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

            {/* Transcription icon button */}
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
                    <FileText size={18} />
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
          newlyTranscribedIds={newlyTranscribedIds}
          onClearNewlyTranscribed={handleClearNewlyTranscribed}
          onRequestTranscription={(id) => handleRequestTranscription(id)}
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