import { useState, useEffect, useRef } from "react";
import { 
  X, Play, Pause, RotateCcw, RotateCw, FileText, Download, Sparkles, 
  Volume2, Search, Info, FileX, Mic, TrendingDown, Tag, DollarSign,
  Headphones, User, Loader2, MoreHorizontal, Users
} from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { EntityResults, EntityResult } from "./EntityResults";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TranscriptionRequestModal } from "./TranscriptionRequestModal";
import { DiarizationRequestModal } from "./DiarizationRequestModal";
import { RetranscriptionConfirmModal } from "./RetranscriptionConfirmModal";

// Styles for animations and highlights
const styles = `
  .transcript-section {
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
  }
  .transcript-section.highlight-active {
    background: linear-gradient(90deg, rgba(96, 211, 228, 0.15) 0%, rgba(96, 211, 228, 0.05) 100%);
    border-left: 4px solid #60D3E4;
    padding-left: 12px;
    transform: translateX(4px);
    box-shadow: 0 0 20px rgba(96, 211, 228, 0.2);
    animation: highlightPulse 0.6s ease-out;
  }
  @keyframes highlightPulse {
    0% { background: rgba(96, 211, 228, 0.3); }
    50% { background: rgba(96, 211, 228, 0.15); }
    100% { background: rgba(96, 211, 228, 0.05); }
  }
  
  /* Entity styles */
  .entity-highlight {
    text-decoration: underline;
    text-decoration-color: #D1D5DB;
    text-decoration-thickness: 1px;
    transition: all 0.3s ease;
  }
  .highlight-active .entity-highlight {
    text-decoration-thickness: 3px;
    text-decoration-style: solid;
    animation: entityReveal 0.4s ease-out forwards;
  }
  .highlight-active .entity-importe { text-decoration-color: #10B981 !important; }
  .highlight-active .entity-dni { text-decoration-color: #3B82F6 !important; }
  .highlight-active .entity-negative { text-decoration-color: #EF4444 !important; }
  
  @keyframes entityReveal {
    from { text-decoration-color: #D1D5DB; text-decoration-thickness: 1px; }
    to { text-decoration-thickness: 3px; }
  }

  /* Sentiment dot pulse */
  @keyframes sentimentPulse {
    0%, 100% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.4); }
  }
`;

interface TranscriptionLine {
  time: string;
  speaker: string;
  text: string;
}

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isProcessing?: boolean;
  onRequestTranscription?: (id: string) => void;
  conversation: {
    service: string;
    origin: string;
    destination: string;
    date: string;
    hour: string;
    id: string;
    duration: string;
    waiting: string;
    hasTranscription?: boolean;
    hasDiarization?: boolean;
    transcription?: TranscriptionLine[];
    aiCategories?: string[];
    hasRecording?: boolean;
  };
}

export function PlayerModal({ isOpen, onClose, conversation, isProcessing = false, onRequestTranscription }: PlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0");
  const [activeTab, setActiveTab] = useState("audio");
  const [transcriptFilter, setTranscriptFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isTranscriptionModalOpen, setIsTranscriptionModalOpen] = useState(false);
  const [isDiarizationModalOpen, setIsDiarizationModalOpen] = useState(false);
  const [isRetranscriptionModalOpen, setIsRetranscriptionModalOpen] = useState(false);
  
  // Parse duration string "MM:SS" to seconds
  const parseDuration = (dur: string) => {
    if (!dur) return 0;
    const parts = dur.split(':');
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    if (parts.length === 3) return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    return 0;
  };

  const totalDuration = parseDuration(conversation.duration) || 103;

  const mockEntityResults: EntityResult[] = [
    { entityName: "ID_Cliente", value: "1847263", confidence: 95, color: "#3B82F6" },
    { entityName: "DNI", value: "12345678Z", confidence: 88, color: "#10B981" },
    { entityName: "Operador", value: "Vodafone", confidence: 75, color: "#F59E0B", detectedSynonym: "voda" },
    { entityName: "Motivo_Queja", value: null, confidence: 0, color: "#EF4444" },
    { entityName: "Importe", value: "45,50€", confidence: 98, color: "#10B981" },
  ];

  // Sentiment timeline — no emojis, colored circles (Component 7)
  const sentimentTimeline = [
    { type: 'positive', time: Math.floor(totalDuration * 0.1) },
    { type: 'neutral',  time: Math.floor(totalDuration * 0.3) },
    { type: 'negative', time: Math.floor(totalDuration * 0.45) },
    { type: 'neutral',  time: Math.floor(totalDuration * 0.7) },
    { type: 'positive', time: Math.floor(totalDuration * 0.9) },
  ];

  // Key moments — Lucide icons instead of emojis (Component 7)
  const keyMoments = [
    { label: "Enfado",      time: Math.floor(totalDuration * 0.45), icon: "trending-down", type: "sentiment" },
    { label: "Competencia", time: Math.floor(totalDuration * 0.7),  icon: "tag",           type: "category" },
    { label: "Precio",      time: Math.floor(totalDuration * 0.25), icon: "dollar-sign",   type: "entity" },
  ];

  const sentimentColor = (type: string) => {
    if (type === 'positive') return '#10B981';
    if (type === 'negative') return '#F59E0B'; // amber, not harsh red
    return '#9CA3AF'; // neutral gray
  };

  const sentimentLabel = (type: string) => {
    if (type === 'positive') return 'Positivo';
    if (type === 'negative') return 'Negativo';
    return 'Neutral';
  };

  const renderKeyMomentIcon = (icon: string) => {
    const cls = "shrink-0";
    if (icon === 'trending-down') return <TrendingDown size={11} className={`${cls} text-[#EF4444]`} />;
    if (icon === 'tag') return <Tag size={11} className={`${cls} text-[#5F6776]`} />;
    if (icon === 'dollar-sign') return <DollarSign size={11} className={`${cls} text-[#10B981]`} />;
    return null;
  };

  const renderSpeakerIcon = (speaker: string) => {
    const isAgent = speaker === 'Agente' || speaker.includes('López') || speaker.includes('García');
    if (isAgent) return <Headphones size={11} className="text-[#60D3E4] shrink-0" />;
    return <User size={11} className="text-[#8D939D] shrink-0" />;
  };

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / parseFloat(playbackSpeed));

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed]);

  const parseTimeLine = (timeStr: string) => {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  // Auto-scroll transcript to active line
  useEffect(() => {
    if (transcriptContainerRef.current) {
      const activeElement = transcriptContainerRef.current.querySelector('.highlight-active');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(totalDuration, time)));
  };

  const handleTranscriptionConfirm = async (_opts: { diarization: boolean }) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsTranscriptionModalOpen(false);
    if (onRequestTranscription) {
      onRequestTranscription(conversation.id);
    }
  };

  const handleDiarizationConfirm = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsDiarizationModalOpen(false);
  };

  const handleRetranscriptionConfirm = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRetranscriptionModalOpen(false);
    if (onRequestTranscription) {
      onRequestTranscription(conversation.id);
    }
  };

  if (!isOpen) return null;

  /* ─── Transcript empty state (Component 4) ─── */
  const renderTranscriptEmptyState = () => {
    if (isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <Loader2 size={36} className="text-[#60D3E4] animate-spin mb-4" />
          <p className="font-medium text-[#233155]">Transcripción en proceso</p>
          <p className="text-sm text-[#8D939D] mt-1.5 max-w-xs leading-relaxed">
            La transcripción se está generando. Estará disponible en breve.
          </p>
        </div>
      );
    }

    if (!conversation.hasRecording) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <FileX size={36} className="text-[#D2D6E0] mb-4" />
          <p className="font-medium text-[#233155]">Sin grabación disponible</p>
          <p className="text-sm text-[#8D939D] mt-1.5 max-w-xs leading-relaxed">
            Esta conversación no tiene grabación de audio asociada.
          </p>
        </div>
      );
    }

    // Has recording but no transcription → Component 4
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <FileX size={36} className="text-[#D2D6E0] mb-4" />
        <p className="font-medium text-[#233155]">Sin transcripción disponible</p>
        <p className="text-sm text-[#8D939D] mt-1.5 max-w-xs leading-relaxed">
          Esta grabación no ha sido transcrita. Puedes solicitarla manualmente.
        </p>
        <Button
          variant="outline"
          className="mt-5 gap-2 text-[#60D3E4] border-[#60D3E4] hover:bg-[#EEFBFD]"
          onClick={() => setIsTranscriptionModalOpen(true)}
        >
          <Mic size={14} />
          Solicitar transcripción
        </Button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <style>{styles}</style>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#233155] p-4 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wide opacity-70 font-medium">CONVERSACIÓN #{conversation.id}</span>
              <Badge variant="outline" className="text-xs border-white/20 text-white hover:bg-white/10">
                {conversation.service}
              </Badge>
            </div>
            <div className="text-sm font-light flex items-center gap-2">
              <span className="font-medium">{conversation.origin}</span>
              <span className="opacity-60">→</span>
              <span className="font-medium">{conversation.destination}</span>
              <span className="opacity-40">|</span>
              <span>{conversation.date} {conversation.hour}</span>
              <span className="opacity-40">|</span>
              <span>Duración: {conversation.duration}</span>
              <span className="opacity-40">|</span>
              <span className="opacity-80">Espera: {conversation.waiting}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="bg-white shrink-0">
             <TabsList className="h-auto bg-transparent p-0 gap-6 border-b border-[#E5E7EB] w-full justify-start px-6">
              <TabsTrigger 
                value="audio" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#60D3E4] data-[state=active]:text-[#60D3E4] px-1 py-3 font-medium text-[#6B7280] hover:text-[#4B5563] data-[state=active]:bg-transparent shadow-none transition-all"
              >
                Audio y Transcripción
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                disabled={!conversation.hasTranscription}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#60D3E4] data-[state=active]:text-[#60D3E4] px-1 py-3 font-medium text-[#6B7280] hover:text-[#4B5563] data-[state=active]:bg-transparent shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Análisis IA
              </TabsTrigger>
              <TabsTrigger 
                value="metadata" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#60D3E4] data-[state=active]:text-[#60D3E4] px-1 py-3 font-medium text-[#6B7280] hover:text-[#4B5563] data-[state=active]:bg-transparent shadow-none transition-all"
              >
                Metadatos
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: AUDIO & TRANSCRIPT */}
          <TabsContent value="audio" className="flex-1 overflow-hidden flex flex-col m-0 p-0">
            {/* Audio Player Section */}
            <div className="bg-[#F8F9FC] border-b border-[#E5E7EB] p-4 shrink-0">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                   {/* Back 10s */}
                   <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSeek(currentTime - 10)}
                    className="text-[#5F6776] hover:bg-[#E5E7EB] w-8 h-8 rounded-full relative"
                  >
                    <RotateCcw size={16} />
                  </Button>

                  {/* Play/Pause */}
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="bg-[#233155] hover:bg-[#1C283D] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md shrink-0"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                  </Button>

                  {/* Forward 10s */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSeek(currentTime + 10)}
                    className="text-[#5F6776] hover:bg-[#E5E7EB] w-8 h-8 rounded-full relative"
                  >
                    <RotateCw size={16} />
                  </Button>

                  {/* Progress Bar Container */}
                  <div className="flex items-center gap-3 flex-1 mx-2">
                    <span className="text-xs text-[#5F6776] tabular-nums font-medium w-10">{formatTime(currentTime)}</span>
                    
                    <div className="flex-1 relative h-8 flex items-center group">
                      {/* Sentiment dots — Component 7: colored circles, no emojis */}
                      {conversation.hasTranscription && (
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                          {sentimentTimeline.map((point, i) => (
                            <TooltipProvider key={i}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="absolute -translate-x-1/2 top-1/2 -translate-y-1/2 hover:scale-150 transition-transform cursor-pointer pointer-events-auto"
                                    style={{ left: `${(point.time / totalDuration) * 100}%` }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSeek(point.time);
                                    }}
                                  >
                                    <div
                                      className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
                                      style={{ backgroundColor: sentimentColor(point.type) }}
                                    />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">
                                    Sentimiento: {sentimentLabel(point.type)}<br />
                                    {formatTime(point.time)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      )}

                      {/* Actual Progress Bar */}
                      <div 
                        className="w-full h-2 bg-[#D2D6E0] rounded-full cursor-pointer relative overflow-visible"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percent = (e.clientX - rect.left) / rect.width;
                          handleSeek(percent * totalDuration);
                        }}
                      >
                        <div 
                          className="h-full bg-[#60D3E4] rounded-full relative transition-all duration-100 ease-linear"
                          style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                        >
                           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#387983] border-2 border-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                    </div>

                    <span className="text-xs text-[#5F6776] tabular-nums font-medium w-10">{formatTime(totalDuration)}</span>
                  </div>
                </div>

                {/* Lower Controls */}
                <div className="flex items-center justify-between text-xs text-[#5F6776] px-1">
                   <div className="flex items-center gap-1">
                     <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 min-w-[32px] text-xs font-medium text-[#5F6776] hover:text-[#233155] hover:bg-[#E5E7EB]"
                        onClick={() => {
                          const speeds = ["0.5", "1.0", "1.5", "2.0"];
                          const currentIndex = speeds.indexOf(playbackSpeed);
                          const nextIndex = (currentIndex + 1) % speeds.length;
                          setPlaybackSpeed(speeds[nextIndex]);
                        }}
                        title="Cambiar velocidad"
                      >
                        {playbackSpeed}x
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#5F6776] hover:text-[#233155] hover:bg-[#E5E7EB]"
                        onClick={() => setVolume(prev => prev[0] === 0 ? [80] : [0])}
                        title={volume[0] === 0 ? "Activar sonido" : "Silenciar"}
                      >
                        <Volume2 size={16} className={volume[0] === 0 ? "opacity-40" : ""} />
                      </Button>
                   </div>
                   
                   <Button variant="ghost" size="sm" className="h-6 text-xs text-[#5F6776] hover:text-[#233155] gap-1 px-2">
                      <Download size={12} />
                      Descargar Audio
                   </Button>
                </div>
              </div>

              {/* Key Moments — Component 7: Lucide icons */}
              {conversation.hasTranscription && (
                <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                   <span className="text-xs font-semibold text-[#233155] mr-2">Momentos clave:</span>
                   <div className="inline-flex gap-2 flex-wrap">
                      {keyMoments.map((moment, idx) => (
                        <button 
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeek(moment.time);
                            setIsPlaying(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-[#D2D6E0] rounded-full text-[11px] hover:border-[#60D3E4] hover:bg-[#EEFBFD] transition-colors group cursor-pointer"
                          title={`Ir a momento de ${moment.label}`}
                        >
                          {renderKeyMomentIcon(moment.icon)}
                          <span className="font-medium text-[#233155]">{moment.label}</span>
                          <span className="text-[#8D939D]">{formatTime(moment.time)}</span>
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </div>

            {/* Transcript Section */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white">
               <div className="p-3 border-b border-[#F4F6FC] flex items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-[#233155] font-semibold text-sm">
                     <FileText size={16} className="text-[#60D3E4]" />
                     Transcripción
                  </div>
                  
                  <div className="flex items-center gap-2">
                     {/* Diarization button — if transcribed but not diarized */}
                     {conversation.hasTranscription && !conversation.hasDiarization && (
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setIsDiarizationModalOpen(true)}
                         className="h-7 px-2.5 gap-1.5 text-xs border-[#D2D6E0] text-[#5F6776] hover:border-[#60D3E4] hover:text-[#387983] hover:bg-[#EEFBFD]"
                       >
                         <Users size={12} />
                         Generar diarización
                       </Button>
                     )}

                     {/* Diarization badge — already diarized */}
                     {conversation.hasDiarization && (
                       <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDF4] rounded-full border border-[#10B981]/20">
                         <Users size={11} className="text-[#10B981]" />
                         <span className="text-[11px] text-[#10B981]">Diarización activa</span>
                       </div>
                     )}

                     {conversation.hasTranscription && (
                       <>
                         <div className="relative">
                           <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#8D939D]" />
                           <input 
                             type="text" 
                             placeholder="Buscar..." 
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="h-7 w-40 pl-7 pr-2 text-xs border border-[#D2D6E0] rounded-full focus:outline-none focus:border-[#60D3E4]"
                           />
                         </div>
                         <Select value={transcriptFilter} onValueChange={setTranscriptFilter}>
                           <SelectTrigger className="h-7 w-[110px] text-xs border-[#D2D6E0] rounded-full">
                             <SelectValue placeholder="Filtrar" />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="all">Todos</SelectItem>
                             <SelectItem value="agent">Solo Agente</SelectItem>
                             <SelectItem value="client">Solo Cliente</SelectItem>
                           </SelectContent>
                         </Select>

                         {/* Re-transcription kebab menu */}
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button
                               variant="ghost"
                               size="icon"
                               className="h-7 w-7 text-[#8D939D] hover:text-[#233155] hover:bg-[#F4F6FC]"
                             >
                               <MoreHorizontal size={15} />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-44">
                             <DropdownMenuItem
                               onClick={() => setIsRetranscriptionModalOpen(true)}
                               className="gap-2 cursor-pointer text-[#5F6776]"
                             >
                               <Loader2 size={13} className="shrink-0" />
                               Re-transcribir
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </>
                     )}
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-2" ref={transcriptContainerRef}>
                  {conversation.transcription ? conversation.transcription.filter(line => {
                    if (transcriptFilter === 'agent' && line.speaker !== 'Agente') return false;
                    if (transcriptFilter === 'client' && line.speaker === 'Agente') return false;
                    if (searchTerm && !line.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                    return true;
                  }).map((line, idx) => {
                    const lineTime = parseTimeLine(line.time);
                    const isActive = currentTime >= lineTime && currentTime < (lineTime + 10); 

                    // Entity highlight logic
                    const renderText = (text: string) => {
                       const entities = [
                         { pattern: /45,50€/g, type: 'importe', label: 'Importe', color: '16, 185, 129', confidence: 98 },
                         { pattern: /2,500 euros/g, type: 'importe', label: 'Importe Mensual', color: '16, 185, 129', confidence: 95 },
                         { pattern: /1847263/g, type: 'dni', label: 'ID Cliente', color: '59, 130, 246', confidence: 99 },
                         { pattern: /ticket #4521/g, type: 'dni', label: 'ID Ticket', color: '59, 130, 246', confidence: 99 },
                         { pattern: /error 502/g, type: 'tech', label: 'Error Técnico', color: '245, 158, 11', confidence: 92 },
                         { pattern: /servidor/g, type: 'tech', label: 'Componente', color: '245, 158, 11', confidence: 85 },
                         { pattern: /router/g, type: 'tech', label: 'Dispositivo', color: '245, 158, 11', confidence: 88 },
                         { pattern: /DNS/g, type: 'tech', label: 'Protocolo', color: '245, 158, 11', confidence: 90 },
                         { pattern: /molesto/g, type: 'negative', label: 'Sentimiento Negativo', color: '239, 68, 68', confidence: 85 },
                         { pattern: /frustración/g, type: 'negative', label: 'Sentimiento Negativo', color: '239, 68, 68', confidence: 88 },
                         { pattern: /gracias/gi, type: 'positive', label: 'Sentimiento Positivo', color: '16, 185, 129', confidence: 90 },
                         { pattern: /excelente/gi, type: 'positive', label: 'Sentimiento Positivo', color: '16, 185, 129', confidence: 92 },
                         { pattern: /urgente/gi, type: 'negative', label: 'Urgencia', color: '239, 68, 68', confidence: 80 },
                         { pattern: /20%/g, type: 'importe', label: 'Descuento', color: '16, 185, 129', confidence: 95 },
                         { pattern: /bonificación/gi, type: 'concept', label: 'Acción Comercial', color: '139, 92, 246', confidence: 85 },
                         { pattern: /500GB/g, type: 'tech', label: 'Capacidad', color: '245, 158, 11', confidence: 95 },
                         { pattern: /encriptación/gi, type: 'tech', label: 'Seguridad', color: '245, 158, 11', confidence: 90 },
                         { pattern: /plan empresarial/gi, type: 'concept', label: 'Producto', color: '139, 92, 246', confidence: 90 },
                         { pattern: /migración/gi, type: 'tech', label: 'Acción Técnica', color: '245, 158, 11', confidence: 85 }
                       ];
                       
                       let parts: { text: string; entity?: any }[] = [{ text }];

                       entities.forEach(entity => {
                         const newParts: { text: string; entity?: any }[] = [];
                         parts.forEach(part => {
                           if (part.entity) {
                             newParts.push(part);
                             return;
                           }
                           
                           const matches = [...part.text.matchAll(entity.pattern)];
                           if (matches.length === 0) {
                             newParts.push(part);
                             return;
                           }

                           let lastIndex = 0;
                           matches.forEach(match => {
                             if (match.index !== undefined) {
                               if (match.index > lastIndex) {
                                 newParts.push({ text: part.text.slice(lastIndex, match.index) });
                               }
                               newParts.push({ text: match[0], entity: entity });
                               lastIndex = match.index + match[0].length;
                             }
                           });
                           if (lastIndex < part.text.length) {
                             newParts.push({ text: part.text.slice(lastIndex) });
                           }
                         });
                         parts = newParts;
                       });

                       return parts.map((part, i) => {
                         if (part.entity) {
                           const baseBg = `rgba(${part.entity.color}, 0.15)`;
                           const activeBg = `rgba(${part.entity.color}, 0.3)`;
                           return (
                             <TooltipProvider key={i}>
                               <Tooltip delayDuration={0}>
                                 <TooltipTrigger asChild>
                                   <span 
                                     className={`px-1 rounded-[3px] transition-all duration-300 cursor-pointer ${isActive ? 'font-medium' : ''}`}
                                     style={{ backgroundColor: isActive ? activeBg : baseBg, color: '#233155' }}
                                   >
                                     {part.text}
                                   </span>
                                 </TooltipTrigger>
                                 <TooltipContent className="bg-[#233155] text-white border-none text-xs">
                                   <p className="font-semibold">{part.entity.label}</p>
                                   <p className="opacity-80">Confianza: {part.entity.confidence}%</p>
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                           );
                         }
                         return <span key={i}>{part.text}</span>;
                       });
                    };

                    return (
                      <div 
                        key={idx} 
                        className={`transcript-section p-3 rounded-r-lg group relative transition-all duration-300 ${
                          isActive 
                            ? 'highlight-active bg-gradient-to-r from-[#60D3E4]/15 to-[#60D3E4]/5 border-l-4 border-[#60D3E4] pl-3 shadow-[0_0_20px_rgba(96,211,228,0.2)]' 
                            : 'hover:bg-[#F8F9FA] border-l-4 border-transparent pl-3'
                        }`}
                      >
                         <div className="flex gap-4">
                           <div className="w-12 shrink-0 pt-0.5">
                              <button 
                                onClick={() => handleSeek(lineTime)}
                                className={`text-xs font-mono font-medium hover:underline ${isActive ? 'text-[#387983]' : 'text-[#60D3E4]'}`}
                              >
                                 {line.time}
                              </button>
                           </div>
                           <div className="flex-1">
                              <div className="text-xs font-bold text-[#233155] mb-1 flex items-center gap-1.5">
                                 {renderSpeakerIcon(line.speaker)}
                                 {line.speaker}
                              </div>
                              <p className="text-sm text-[#4B5563] leading-relaxed">
                                 {renderText(line.text)}
                              </p>
                           </div>
                         </div>
                      </div>
                    );
                  }) : renderTranscriptEmptyState()}
               </div>
            </div>
          </TabsContent>

          {/* TAB 2: AI ANALYSIS */}
          <TabsContent value="analysis" className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
             <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Summary */}
                <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
                   <div className="flex items-center gap-2 mb-3">
                      <FileText size={18} className="text-[#60D3E4]" />
                      <h3 className="font-semibold text-[#233155]">Resumen Automático</h3>
                   </div>
                   <p className="text-sm text-[#4B5563] leading-relaxed">
                      El cliente contacta para reportar un problema con su factura de 45,50€. 
                      Manifiesta frustración inicial por cobros indebidos. 
                      El agente explica el origen del cobro y ofrece una bonificación.
                      El cliente acepta la solución y la llamada finaliza con tono positivo.
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Sentiment Graph */}
                   <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                         <TrendingDown size={18} className="text-[#60D3E4]" />
                         <h3 className="font-semibold text-[#233155]">Análisis de Sentimiento</h3>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-[#8D939D]">Inicio</span>
                            <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                              Positivo (65%)
                            </span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-[#8D939D]">Medio</span>
                            <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                              Negativo (-85%)
                            </span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-[#8D939D]">Final</span>
                            <span className="text-gray-600 font-medium bg-gray-50 px-2 py-0.5 rounded flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-[#9CA3AF]" />
                              Neutral (50%)
                            </span>
                         </div>
                         
                         {/* Visual Graph Mock */}
                         <div className="h-24 flex items-end gap-1 mt-4 border-b border-[#E5E7EB] pb-1 px-2">
                            {[40, 30, 20, 10, -20, -50, -80, -40, 10, 30, 50, 60].map((val, i) => (
                               <div 
                                key={i} 
                                className={`flex-1 rounded-t-sm ${val > 0 ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}
                                style={{ height: `${Math.abs(val)}%`, opacity: 0.6 }}
                               ></div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Categories */}
                   <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                         <Tag size={18} className="text-[#60D3E4]" />
                         <h3 className="font-semibold text-[#233155]">Categorías Detectadas</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {conversation.aiCategories && conversation.aiCategories.length > 0 ? (
                           conversation.aiCategories.map((cat, i) => (
                             <Badge key={i} variant="secondary" className="bg-[#EEFBFD] text-[#387983] hover:bg-[#D3F2F8] cursor-pointer border border-[#60D3E4]/30">
                               {cat}
                             </Badge>
                           ))
                         ) : (
                           <>
                             <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Queja</Badge>
                             <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Facturación</Badge>
                             <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">Riesgo de baja</Badge>
                           </>
                         )}
                      </div>
                   </div>
                </div>

                {/* Entities */}
                {(() => {
                   const entityConfig = [
                     { pattern: /45,50€/g, type: 'importe', label: 'Importe', color: '16, 185, 129', confidence: 98 },
                     { pattern: /2,500 euros/g, type: 'importe', label: 'Importe Mensual', color: '16, 185, 129', confidence: 95 },
                     { pattern: /1847263/g, type: 'dni', label: 'ID Cliente', color: '59, 130, 246', confidence: 99 },
                     { pattern: /ticket #4521/g, type: 'dni', label: 'ID Ticket', color: '59, 130, 246', confidence: 99 },
                     { pattern: /error 502/g, type: 'tech', label: 'Error Técnico', color: '245, 158, 11', confidence: 92 },
                     { pattern: /servidor/g, type: 'tech', label: 'Componente', color: '245, 158, 11', confidence: 85 },
                     { pattern: /router/g, type: 'tech', label: 'Dispositivo', color: '245, 158, 11', confidence: 88 },
                     { pattern: /DNS/g, type: 'tech', label: 'Protocolo', color: '245, 158, 11', confidence: 90 },
                     { pattern: /500GB/g, type: 'tech', label: 'Capacidad', color: '245, 158, 11', confidence: 95 },
                     { pattern: /encriptación/gi, type: 'tech', label: 'Seguridad', color: '245, 158, 11', confidence: 90 },
                     { pattern: /20%/g, type: 'importe', label: 'Descuento', color: '16, 185, 129', confidence: 95 },
                     { pattern: /bonificación/gi, type: 'concept', label: 'Acción Comercial', color: '139, 92, 246', confidence: 85 },
                     { pattern: /plan empresarial/gi, type: 'concept', label: 'Producto', color: '139, 92, 246', confidence: 90 },
                     { pattern: /migración/gi, type: 'tech', label: 'Acción Técnica', color: '245, 158, 11', confidence: 85 }
                   ];
                   
                   const detectedEntities: EntityResult[] = [];
                   const seenValues = new Set();
                   
                   if (conversation.transcription) {
                      conversation.transcription.forEach(line => {
                        entityConfig.forEach(config => {
                           const matches = line.text.match(config.pattern);
                           if (matches) {
                              matches.forEach(match => {
                                 const key = `${config.label}-${match}`;
                                 if (!seenValues.has(key)) {
                                    seenValues.add(key);
                                    detectedEntities.push({
                                       entityName: config.label,
                                       value: match,
                                       confidence: config.confidence,
                                       color: `rgb(${config.color})`
                                    });
                                 }
                              });
                           }
                        });
                      });
                   }
                   
                   return <EntityResults results={detectedEntities.length > 0 ? detectedEntities : []} />;
                })()}

                {/* Key Points */}
                <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <Info size={18} className="text-[#60D3E4]" />
                      <h3 className="font-semibold text-[#233155]">Puntos Clave</h3>
                   </div>
                   <ul className="space-y-3">
                      <li className="flex gap-3 text-sm">
                         <span className="text-[#60D3E4] font-mono cursor-pointer hover:underline" onClick={() => {setActiveTab('audio'); handleSeek(12);}}>[00:12]</span>
                         <span className="text-[#4B5563]">Cliente menciona problema con factura incorrecta.</span>
                      </li>
                      <li className="flex gap-3 text-sm">
                         <span className="text-[#60D3E4] font-mono cursor-pointer hover:underline" onClick={() => {setActiveTab('audio'); handleSeek(45);}}>[00:45]</span>
                         <span className="text-[#4B5563]">Momento de máxima frustración del cliente.</span>
                      </li>
                      <li className="flex gap-3 text-sm">
                         <span className="text-[#60D3E4] font-mono cursor-pointer hover:underline" onClick={() => {setActiveTab('audio'); handleSeek(90);}}>[01:30]</span>
                         <span className="text-[#4B5563]">Resolución confirmada y cliente satisfecho.</span>
                      </li>
                   </ul>
                </div>
             </div>
          </TabsContent>

          {/* TAB 3: METADATA */}
          <TabsContent value="metadata" className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
             <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <Info size={18} className="text-[#60D3E4]" />
                      <h3 className="font-semibold text-[#233155]">Información General</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-y-4 text-sm">
                      <div>
                         <span className="block text-[#8D939D] text-xs">ID Conversación</span>
                         <span className="font-mono text-[#233155]">{conversation.id}</span>
                      </div>
                      <div>
                         <span className="block text-[#8D939D] text-xs">Servicio</span>
                         <span className="text-[#233155]">{conversation.service}</span>
                      </div>
                      <div>
                         <span className="block text-[#8D939D] text-xs">Agente</span>
                         <span className="text-[#233155]">{conversation.origin}</span>
                      </div>
                      <div>
                         <span className="block text-[#8D939D] text-xs">Cliente / Destino</span>
                         <span className="text-[#233155]">{conversation.destination}</span>
                      </div>
                      <div>
                         <span className="block text-[#8D939D] text-xs">Fecha y Hora</span>
                         <span className="text-[#233155]">{conversation.date} {conversation.hour}</span>
                      </div>
                      <div>
                         <span className="block text-[#8D939D] text-xs">Duración Total</span>
                         <span className="text-[#233155]">{conversation.duration}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={18} className="text-[#9B59B6]" />
                      <h3 className="font-semibold text-[#233155]">Reglas Aplicadas</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="flex items-start gap-3">
                         <div className={`mt-0.5 w-2 h-2 rounded-full ${conversation.hasRecording !== false ? 'bg-[#E74C3C]' : 'bg-gray-300'}`}></div>
                         <div>
                            <p className="text-sm font-medium text-[#233155]">Grabación</p>
                            <p className="text-xs text-[#8D939D]">Regla: "Grabar Todo Comercial"</p>
                            {conversation.hasRecording !== false ? (
                                <p className="text-xs text-green-600 mt-0.5">Aplicada correctamente</p>
                            ) : (
                                <p className="text-xs text-gray-500 mt-0.5">No disponible</p>
                            )}
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="mt-0.5"><FileText size={10} className={conversation.hasTranscription ? "text-[#60D3E4]" : "text-gray-400"} /></div>
                         <div>
                            <p className="text-sm font-medium text-[#233155]">Transcripción</p>
                            <p className="text-xs text-[#8D939D]">Regla: "Transcribir Soporte"</p>
                            {conversation.hasTranscription ? (
                                <p className="text-xs text-green-600 mt-0.5">Aplicada correctamente ({conversation.duration})</p>
                            ) : (
                                <p className="text-xs text-orange-500 mt-0.5">No ejecutada — Audio no transcrito</p>
                            )}
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="mt-0.5"><Sparkles size={10} className={conversation.hasTranscription ? "text-[#9B59B6]" : "text-gray-400"} /></div>
                         <div>
                            <p className="text-sm font-medium text-[#233155]">Clasificación IA</p>
                            <p className="text-xs text-[#8D939D]">Regla: "Análisis IA Quejas"</p>
                            {conversation.hasTranscription ? (
                                <p className="text-xs text-green-600 mt-0.5">Categorías: {conversation.aiCategories?.length || 3} | Entidades: {mockEntityResults.length} | Confianza: 94%</p>
                            ) : (
                                <p className="text-xs text-gray-400 mt-0.5">No iniciada — Requiere transcripción</p>
                            )}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-[#E5E7EB] shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <Download size={18} className="text-[#5F6776]" />
                      <h3 className="font-semibold text-[#233155]">Archivos</h3>
                   </div>
                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#F8F9FC] rounded border border-[#E5E7EB]">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#E5E7EB] rounded flex items-center justify-center text-[#5F6776]"><Play size={14} /></div>
                            <div>
                               <p className="text-sm font-medium text-[#233155]">Audio original</p>
                               <p className="text-xs text-[#8D939D]">MP3 • 2.1 MB</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon"><Download size={16} className="text-[#5F6776]" /></Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#F8F9FC] rounded border border-[#E5E7EB]">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#E5E7EB] rounded flex items-center justify-center text-[#5F6776]"><FileText size={14} /></div>
                            <div>
                               <p className="text-sm font-medium text-[#233155]">Transcripción</p>
                               <p className="text-xs text-[#8D939D]">TXT • 15 KB</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon"><Download size={16} className="text-[#5F6776]" /></Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#F8F9FC] rounded border border-[#E5E7EB]">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#E5E7EB] rounded flex items-center justify-center text-[#5F6776]"><Sparkles size={14} /></div>
                            <div>
                               <p className="text-sm font-medium text-[#233155]">Análisis IA</p>
                               <p className="text-xs text-[#8D939D]">JSON • 45 KB</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon"><Download size={16} className="text-[#5F6776]" /></Button>
                      </div>
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals rendered above the player */}
      <TranscriptionRequestModal
        isOpen={isTranscriptionModalOpen}
        onClose={() => setIsTranscriptionModalOpen(false)}
        duration={conversation.duration}
        onConfirm={handleTranscriptionConfirm}
      />

      <DiarizationRequestModal
        isOpen={isDiarizationModalOpen}
        onClose={() => setIsDiarizationModalOpen(false)}
        onConfirm={handleDiarizationConfirm}
      />

      <RetranscriptionConfirmModal
        isOpen={isRetranscriptionModalOpen}
        onClose={() => setIsRetranscriptionModalOpen(false)}
        onConfirm={handleRetranscriptionConfirm}
      />
    </div>
  );
}