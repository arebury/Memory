import { useState } from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Search } from "lucide-react";
import { Conversation } from "../data/mockData";
import { ConversationPlayerModal } from "./ConversationPlayerModal";
import { Input } from "./ui/input";
import { TimeRangeFilter } from "./TimeRangeFilter";
import { RecordingFilter } from "./RecordingFilter";
import { DurationFilter } from "./DurationFilter";
import { DateRangePicker } from "./DateRangePicker";
import { StatusIcon } from "./StatusIcons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ConversationTableProps {
  conversations: Conversation[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  showColumnFilters: boolean;
  columnFilters: {
    hourStart: string;
    hourEnd: string;
    dateRange: string;
    withRecording: boolean;
    withTranscription: boolean;
    service: string;
    origin: string;
    group: string;
    destination: string;
    durationMin: string;
    durationMax: string;
    waitingMin: string;
    waitingMax: string;
    id: string;
  };
  onColumnFiltersChange: (filters: any) => void;
  ruleFilters: {
    recording: boolean;
    transcription: boolean;
    classification: boolean;
  };
  processingIds?: string[];
  analyzingIds?: string[];
  newlyTranscribedIds?: string[];
  onClearNewlyTranscribed?: (id: string) => void;
  onRequestTranscription?: (id: string) => void;
  onRequestAnalysis?: (id: string) => void;
}

export function ConversationTable({ 
  conversations, 
  selectedIds, 
  onSelectionChange,
  showColumnFilters,
  columnFilters,
  onColumnFiltersChange,
  ruleFilters,
  processingIds = [],
  analyzingIds = [],
  newlyTranscribedIds = [],
  onClearNewlyTranscribed,
  onRequestTranscription,
  onRequestAnalysis,
}: ConversationTableProps) {
  // Track the active conversation by ID rather than reference so that
  // when the parent updates a conversation (e.g. transcription completes
  // mid-modal), the modal re-renders with the latest data.
  const [playerConversationId, setPlayerConversationId] = useState<string | null>(null);
  const playerConversation = playerConversationId
    ? conversations.find((c) => c.id === playerConversationId) ?? null
    : null;

  const allSelected = conversations.length > 0 && conversations.every(conv => selectedIds.includes(conv.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(conversations.map(conv => conv.id));
    }
  };

  const toggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleRowClick = (conv: Conversation) => {
    // STATE 2 → STATE 3: clear newly-transcribed badge on click
    onClearNewlyTranscribed?.(conv.id);
    setPlayerConversationId(conv.id);
  };

  const isRowDimmed = (conv: Conversation): boolean => {
    const hasActiveFilters = ruleFilters.recording || ruleFilters.transcription || ruleFilters.classification;
    if (!hasActiveFilters) return false;
    if (ruleFilters.recording && !conv.hasRecordingRule) return true;
    if (ruleFilters.transcription && !conv.hasTranscriptionRule) return true;
    if (ruleFilters.classification && !conv.hasClassificationRule) return true;
    return false;
  };

  const getRowBg = (conv: Conversation): string => {
    if (newlyTranscribedIds.includes(conv.id)) return "bg-yellow-50";
    return "";
  };

  return (
    <>
      <div className="flex-1 overflow-auto bg-white relative">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="bg-[#F4F6FC] sticky top-0 z-20 shadow-sm">
            <TableRow className="bg-[#F4F6FC] border-b border-[#CFD3DE] hover:bg-[#F4F6FC]">
              <TableHead className="w-[50px] h-11">
                <Checkbox 
                  checked={allSelected}
                  className={`border-[#A3A8B0] ${someSelected ? 'data-[state=checked]:bg-[#60D3E4]' : ''}`}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="w-[80px] h-11 text-center">
                 <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium cursor-help">Estado</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Estado de procesamiento</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="w-[100px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">Hora</span>
              </TableHead>
              <TableHead className="w-[120px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">Fecha</span>
              </TableHead>
              <TableHead className="w-[200px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">Servicio</span>
              </TableHead>
              <TableHead className="w-[180px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">Origen</span>
              </TableHead>
              <TableHead className="w-[200px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">Grupo</span>
              </TableHead>
              <TableHead className="w-[160px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">Destino</span>
              </TableHead>
              <TableHead className="w-[110px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">T. Conv.</span>
              </TableHead>
              <TableHead className="w-[110px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">T. Espera</span>
              </TableHead>
              <TableHead className="w-[140px] h-11">
                <span className="text-[13px] uppercase tracking-wide text-[#A3A8B0] font-medium">ID</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          
          {/* Sticky Filter Row */}
          {showColumnFilters && (
            <thead className="sticky top-[44px] z-10 bg-white border-b border-[#CFD3DE] filter-row-enter">
              <tr className="bg-white">
                <th className="w-[50px] h-11 px-3"></th>
                <th className="w-[80px] h-11 px-2">
                   <RecordingFilter
                    withRecording={columnFilters.withRecording}
                    withTranscription={columnFilters.withTranscription}
                    onChange={(recording, transcription) => 
                      onColumnFiltersChange({ ...columnFilters, withRecording: recording, withTranscription: transcription })
                    }
                  />
                </th>
                <th className="w-[100px] h-11 px-2">
                  <TimeRangeFilter
                    startTime={columnFilters.hourStart}
                    endTime={columnFilters.hourEnd}
                    onChange={(start, end) => onColumnFiltersChange({ ...columnFilters, hourStart: start, hourEnd: end })}
                  />
                </th>
                <th className="w-[120px] h-11 px-2">
                  <DateRangePicker
                    value={columnFilters.dateRange}
                    onChange={(value) => onColumnFiltersChange({ ...columnFilters, dateRange: value })}
                  />
                </th>
                <th className="w-[200px] h-11 px-2">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={columnFilters.service}
                      onChange={(e) => onColumnFiltersChange({ ...columnFilters, service: e.target.value })}
                      className={`h-8 text-xs border-[#CFD3DE] pr-7 placeholder:text-[#A3A8B0] ${
                        columnFilters.service ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983]' : 'bg-white hover:bg-[#F4F6FC] hover:border-[#A3A8B0]'
                      }`}
                    />
                    <Search size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A3A8B0] pointer-events-none" />
                  </div>
                </th>
                <th className="w-[180px] h-11 px-2">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={columnFilters.origin}
                      onChange={(e) => onColumnFiltersChange({ ...columnFilters, origin: e.target.value })}
                      className={`h-8 text-xs border-[#CFD3DE] pr-7 placeholder:text-[#A3A8B0] ${
                        columnFilters.origin ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983]' : 'bg-white hover:bg-[#F4F6FC] hover:border-[#A3A8B0]'
                      }`}
                    />
                    <Search size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A3A8B0] pointer-events-none" />
                  </div>
                </th>
                <th className="w-[200px] h-11 px-2">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={columnFilters.group}
                      onChange={(e) => onColumnFiltersChange({ ...columnFilters, group: e.target.value })}
                      className={`h-8 text-xs border-[#CFD3DE] pr-7 placeholder:text-[#A3A8B0] ${
                        columnFilters.group ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983]' : 'bg-white hover:bg-[#F4F6FC] hover:border-[#A3A8B0]'
                      }`}
                    />
                    <Search size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A3A8B0] pointer-events-none" />
                  </div>
                </th>
                <th className="w-[160px] h-11 px-2">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={columnFilters.destination}
                      onChange={(e) => onColumnFiltersChange({ ...columnFilters, destination: e.target.value })}
                      className={`h-8 text-xs border-[#CFD3DE] pr-7 placeholder:text-[#A3A8B0] ${
                        columnFilters.destination ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983]' : 'bg-white hover:bg-[#F4F6FC] hover:border-[#A3A8B0]'
                      }`}
                    />
                    <Search size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A3A8B0] pointer-events-none" />
                  </div>
                </th>
                <th className="w-[110px] h-11 px-2">
                  <DurationFilter
                    minTime={columnFilters.durationMin}
                    maxTime={columnFilters.durationMax}
                    onChange={(min, max) => onColumnFiltersChange({ ...columnFilters, durationMin: min, durationMax: max })}
                    label="Duración"
                  />
                </th>
                <th className="w-[110px] h-11 px-2">
                  <DurationFilter
                    minTime={columnFilters.waitingMin}
                    maxTime={columnFilters.waitingMax}
                    onChange={(min, max) => onColumnFiltersChange({ ...columnFilters, waitingMin: min, waitingMax: max })}
                    label="Espera"
                  />
                </th>
                <th className="w-[140px] h-11 px-2">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={columnFilters.id}
                      onChange={(e) => onColumnFiltersChange({ ...columnFilters, id: e.target.value })}
                      className={`h-8 text-xs border-[#CFD3DE] pr-7 placeholder:text-[#A3A8B0] ${
                        columnFilters.id ? 'bg-[#EEFBFD] border-[#60D3E4] text-[#387983]' : 'bg-white hover:bg-[#F4F6FC] hover:border-[#A3A8B0]'
                      }`}
                    />
                    <Search size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#A3A8B0] pointer-events-none" />
                  </div>
                </th>
              </tr>
            </thead>
          )}
          
          <TableBody>
            {conversations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-sm text-[#A3A8B0]">
                  No se encontraron conversaciones
                </TableCell>
              </TableRow>
            ) : (
              conversations.map((conv) => (
                <TableRow 
                  key={conv.id} 
                  className={`border-b border-[#CFD3DE] hover:bg-[#EEFBFD]/50 cursor-pointer transition-colors h-14 ${isRowDimmed(conv) ? 'opacity-50' : ''} ${getRowBg(conv)}`}
                  onClick={() => handleRowClick(conv)}
                >
                  <TableCell className="w-[50px] py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.includes(conv.id)}
                      onCheckedChange={() => toggleRow(conv.id)}
                      className="border-[#A3A8B0]" 
                    />
                  </TableCell>
                  
                  {/* STATUS Column — combined channel + processing-state pictogram */}
                  <TableCell className="w-[80px] py-3">
                    <div className="flex items-center justify-center">
                      <StatusIcon
                        conversation={conv}
                        isProcessing={processingIds.includes(conv.id)}
                        isAnalyzing={analyzingIds.includes(conv.id)}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="w-[100px] text-sm text-[#5F6776] py-3 font-light">{conv.hour}</TableCell>
                  <TableCell className="w-[120px] text-sm text-[#5F6776] py-3 font-light">{conv.date}</TableCell>
                  <TableCell className="w-[200px] text-sm text-[#5F6776] py-3">
                    <div className="flex items-center gap-1.5">
                      {conv.service}
                    </div>
                  </TableCell>
                  <TableCell className="w-[180px] text-sm text-[#5F6776] py-3">{conv.origin}</TableCell>
                  <TableCell className="w-[200px] text-sm text-[#5F6776] py-3">{conv.group}</TableCell>
                  <TableCell className="w-[160px] text-sm text-[#5F6776] py-3">{conv.destination}</TableCell>
                  <TableCell className="w-[110px] text-sm text-[#5F6776] py-3">{conv.duration}</TableCell>
                  <TableCell className="w-[110px] text-sm text-[#5F6776] py-3">{conv.waiting}</TableCell>
                  <TableCell className="w-[140px] text-xs text-[#5F6776] py-3 font-light font-mono">{conv.id}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>

      <ConversationPlayerModal
        isOpen={!!playerConversation}
        onClose={() => setPlayerConversationId(null)}
        conversation={playerConversation}
        isTranscribing={
          !!playerConversation && processingIds.includes(playerConversation.id)
        }
        isAnalyzing={
          !!playerConversation && analyzingIds.includes(playerConversation.id)
        }
        onRequestTranscription={onRequestTranscription}
        onRequestAnalysis={onRequestAnalysis}
      />
    </>
  );
}
