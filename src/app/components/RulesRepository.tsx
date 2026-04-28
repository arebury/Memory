import { useState, useEffect, useMemo, useRef } from 'react';
import { useRules, Rule, RuleType } from './RulesContext';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Breadcrumbs } from './Breadcrumbs';
import {
  Plus, Edit2, Copy, Trash2, FileText,
  Sparkles, AlertTriangle, MoreVertical, ChevronDown, GripVertical,
  Circle
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner@2.0.3";
import { mockServices } from '../data/mockData';

import { RecordingRuleBuilder } from './rules/RecordingRuleBuilder';
import { TranscriptionRuleBuilder } from './rules/TranscriptionRuleBuilder';
import { ClassificationRuleBuilder } from './rules/ClassificationRuleBuilder';

interface RulesRepositoryProps {
  onNavigateBack: () => void;
  onNavigateToCategories: () => void;
  navigationParams?: {
    openRuleId?: number;
    highlightSection?: string;
    preConfiguredCategory?: string;
    autoOpenBuilder?: boolean;
  };
  onClearNavigationParams?: () => void;
}

// --- Helpers ---

function getRuleType(rule: Rule): RuleType {
  if (rule.type) return rule.type;
  if (rule.clasificacion) return 'classification';
  if (rule.transcripcion) return 'transcription';
  return 'recording';
}

function getTypeIcon(type: RuleType) {
  switch (type) {
    case 'recording':
      return <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center"><Circle size={10} className="text-red-500 fill-red-500" /></div>;
    case 'transcription':
      return <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><FileText size={14} /></div>;
    case 'classification':
      return <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500"><Sparkles size={14} /></div>;
  }
}

function getTypeLabel(type: RuleType) {
  switch (type) {
    case 'recording': return 'Grabación';
    case 'transcription': return 'Transcripción';
    case 'classification': return 'Clasificación IA';
  }
}

function getScopeText(rule: Rule): string {
  if (rule.servicios.length === 0) return 'Todos los servicios';
  const names = rule.servicios.map(v => mockServices.find(s => s.value === v)?.label || v);
  return names.length === 1 ? names[0] : `${names.length} servicios`;
}

function getRelativeTime(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins} min`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `hace ${diffHrs}h`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// Detect conflicts: two active rules with same type + overlapping scope
function detectConflicts(activeRules: Rule[]): Map<number, { conflictWith: Rule; reason: string }[]> {
  const conflicts = new Map<number, { conflictWith: Rule; reason: string }[]>();
  for (let i = 0; i < activeRules.length; i++) {
    for (let j = i + 1; j < activeRules.length; j++) {
      const a = activeRules[i];
      const b = activeRules[j];
      const typeA = getRuleType(a);
      const typeB = getRuleType(b);
      if (typeA !== typeB) continue;
      const sharedServices = a.servicios.filter(s => b.servicios.includes(s));
      if (sharedServices.length > 0) {
        const reason = `Alcance solapado en ${typeA === 'recording' ? 'grabación' : typeA === 'transcription' ? 'transcripción' : 'clasificación'}`;
        if (!conflicts.has(a.id)) conflicts.set(a.id, []);
        if (!conflicts.has(b.id)) conflicts.set(b.id, []);
        conflicts.get(a.id)!.push({ conflictWith: b, reason });
        conflicts.get(b.id)!.push({ conflictWith: a, reason });
      }
    }
  }
  return conflicts;
}

// --- Status Badge ---

function StatusBadge({ rule, conflicts }: { rule: Rule; conflicts?: { conflictWith: Rule; reason: string }[] }) {
  if (rule.isDraft) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle size={10} />
        Borrador
      </span>
    );
  }
  if (conflicts && conflicts.length > 0) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-50 text-red-600 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors">
            <AlertTriangle size={10} />
            En conflicto
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4 bg-white border-[#CFD3DE] shadow-lg" align="start">
          <p className="text-sm text-[#233155] mb-3">Conflictos detectados:</p>
          {conflicts.map((c, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-sm text-[#233155]">
                Con <span className="font-medium">"{c.conflictWith.name}"</span>
              </p>
              <p className="text-xs text-[#8D939D] mt-0.5">{c.reason}</p>
              <p className="text-xs text-[#60D3E4] mt-1">
                Gana la regla con mayor prioridad (más arriba en la lista).
              </p>
            </div>
          ))}
        </PopoverContent>
      </Popover>
    );
  }
  if (rule.active) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-600 border border-emerald-200">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        Activa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-50 text-[#8D939D] border border-gray-200">
      Inactiva
    </span>
  );
}

// --- Main Component ---

export function RulesRepository({ onNavigateBack, onNavigateToCategories, navigationParams, onClearNavigationParams }: RulesRepositoryProps) {
  const { rules, addRule, updateRule, deleteRule, duplicateRule, toggleRule, reorderRules } = useRules();
  const [view, setView] = useState<'list' | 'create_recording' | 'create_transcription' | 'create_classification' | 'edit'>('list');
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [highlightedRuleId, setHighlightedRuleId] = useState<number | null>(null);

  // Drag state (active rules only)
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  // Separate into three buckets
  const activeRules = useMemo(() =>
    rules.filter(r => r.active).sort((a, b) => (a.priority || 999) - (b.priority || 999)),
    [rules]
  );
  const inactiveRules = useMemo(() =>
    rules.filter(r => !r.active && !r.isDraft).sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA;
    }),
    [rules]
  );
  const draftRules = useMemo(() =>
    rules.filter(r => r.isDraft).sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA;
    }),
    [rules]
  );

  const conflictMap = useMemo(() => detectConflicts(activeRules), [activeRules]);

  useEffect(() => {
    if (navigationParams?.openRuleId !== undefined) {
      setEditingRuleId(navigationParams.openRuleId);
      setView('edit');
      onClearNavigationParams?.();
    } else if (navigationParams?.autoOpenBuilder) {
      if (navigationParams.preConfiguredCategory) {
        setView('create_classification');
      }
      onClearNavigationParams?.();
    }
  }, [navigationParams, onClearNavigationParams]);

  useEffect(() => {
    if (highlightedRuleId !== null) {
      const timer = setTimeout(() => setHighlightedRuleId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [highlightedRuleId]);

  const handleCreate = (type: 'recording' | 'transcription' | 'classification') => {
    setEditingRuleId(null);
    setView(`create_${type}` as any);
  };

  const handleEdit = (ruleId: number) => {
    setEditingRuleId(ruleId);
    setView('edit');
  };

  const handleDuplicate = (ruleId: number) => {
    duplicateRule(ruleId);
    toast.success("Regla duplicada. Edita al menos un campo para poder activarla.");
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteClick = (ruleId: number) => {
    setRuleToDelete(ruleId);
    setDeleteConfirmationText('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    const rule = rules.find(r => r.id === ruleToDelete);
    if (ruleToDelete !== null && rule && deleteConfirmationText === rule.name) {
      deleteRule(ruleToDelete);
      toast.success(`Regla "${rule.name}" eliminada`);
      setRuleToDelete(null);
      setDeleteDialogOpen(false);
      setDeleteConfirmationText('');
    }
  };

  const handleSaveRule = (ruleData: Partial<Rule>) => {
    if (view === 'edit' && editingRuleId !== null) {
      updateRule(editingRuleId, ruleData);
      toast.success("Regla actualizada correctamente");
    } else {
      addRule(ruleData);
      toast.success("Regla creada correctamente");
    }
    setView('list');
    setEditingRuleId(null);
  };

  const handleCancelBuilder = () => {
    setView('list');
    setEditingRuleId(null);
  };

  // Drag & drop handlers (active only)
  const handleDragStart = (e: React.DragEvent, ruleId: number) => {
    setDraggedId(ruleId);
    e.dataTransfer.effectAllowed = 'move';
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    if (draggedId !== null && dragOverIndex !== null) {
      const newOrder = [...activeRules];
      const draggedIndex = newOrder.findIndex(r => r.id === draggedId);
      if (draggedIndex !== -1 && dragOverIndex !== draggedIndex) {
        const [moved] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(dragOverIndex, 0, moved);
        reorderRules(newOrder.map(r => r.id));
        toast.success("Orden actualizado");
      }
    }
    setDraggedId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const editingRule = editingRuleId !== null ? rules.find(r => r.id === editingRuleId) : null;
  const editingRuleType = editingRule ? getRuleType(editingRule) : null;

  // --- Render Builder ---
  if (view !== 'list') {
    const type = view === 'edit' ? editingRuleType : view.replace('create_', '');
    const breadcrumbLabel = view === 'edit' ? `Editar "${editingRule?.name || 'regla'}"` : 'Nueva regla';

    const commonProps = {
      onCancel: handleCancelBuilder,
      onSave: handleSaveRule,
      initialData: editingRule || undefined,
      isEditMode: view === 'edit',
      breadcrumbs: [
        { label: 'Repositorio', onClick: onNavigateBack },
        { label: 'Reglas', onClick: () => setView('list') },
        { label: breadcrumbLabel }
      ],
      onDiscardDraft: editingRule?.isDraft ? () => {
        if (editingRule) {
          deleteRule(editingRule.id);
          toast.success("Borrador descartado");
          setView('list');
          setEditingRuleId(null);
        }
      } : undefined,
    };

    if (type === 'recording') return <RecordingRuleBuilder {...commonProps} />;
    if (type === 'transcription') return <TranscriptionRuleBuilder {...commonProps} />;
    if (type === 'classification') {
      return (
        <ClassificationRuleBuilder
          {...commonProps}
          onNavigateToCategories={onNavigateToCategories}
          onNavigateToEntities={() => toast.info("Navegar a entidades (TBI)")}
        />
      );
    }
    return <div>Error: Unknown rule type</div>;
  }

  // --- Render Row ---
  const renderRow = (rule: Rule, index: number, isActive: boolean) => {
    const type = getRuleType(rule);
    const conflicts = conflictMap.get(rule.id);
    const isHighlighted = highlightedRuleId === rule.id;
    const isDragging = draggedId === rule.id;
    const isDragTarget = isActive && dragOverIndex === index && draggedId !== null && draggedId !== rule.id;

    return (
      <tr
        key={rule.id}
        draggable={isActive}
        onDragStart={isActive ? (e) => handleDragStart(e, rule.id) : undefined}
        onDragEnd={isActive ? handleDragEnd : undefined}
        onDragOver={isActive ? (e) => handleDragOver(e, index) : undefined}
        className={`
          group border-b border-[#F4F6FC] last:border-b-0 transition-all duration-200
          ${isDragging ? 'opacity-50' : ''}
          ${isDragTarget ? 'bg-[#EEFBFD]' : 'hover:bg-[#FAFBFD]'}
          ${isHighlighted ? 'animate-highlight-fade' : ''}
          ${rule.isDraft ? 'bg-amber-50/30' : ''}
        `}
      >
        {/* Order / Handle */}
        <td className="w-12 pl-4 pr-2 py-4 text-center">
          {isActive ? (
            <div className="flex items-center gap-1">
              <GripVertical size={14} className="text-[#CFD3DE] cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-[#8D939D] tabular-nums w-4">{index + 1}</span>
            </div>
          ) : (
            <span className="text-xs text-[#CFD3DE]">—</span>
          )}
        </td>

        {/* Type icon + Name + Description */}
        <td className="py-4 pr-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{getTypeIcon(type)}</div>
            <div className="min-w-0">
              <button
                onClick={() => handleEdit(rule.id)}
                className="text-sm text-[#233155] hover:text-[#60D3E4] transition-colors text-left block"
              >
                {rule.name}
              </button>
              {rule.description && (
                <p className="text-xs text-[#A3A8B0] mt-1 leading-relaxed">{rule.description}</p>
              )}
              <span className="inline-block mt-1.5 text-[10px] text-[#8D939D] bg-[#F4F6FC] px-1.5 py-0.5 rounded">
                {getTypeLabel(type)}
              </span>
            </div>
          </div>
        </td>

        {/* Scope */}
        <td className="py-4 pr-4 align-top">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-[#5F6776] block max-w-[180px]">
                {getScopeText(rule)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">{getScopeText(rule)}</p>
            </TooltipContent>
          </Tooltip>
        </td>

        {/* Status */}
        <td className="py-4 pr-4 align-top">
          <StatusBadge rule={rule} conflicts={conflicts} />
        </td>

        {/* Last modified */}
        <td className="py-4 pr-4 align-top">
          <span className="text-xs text-[#8D939D]">{getRelativeTime(rule.lastModified)}</span>
        </td>

        {/* Toggle + Kebab */}
        <td className="py-4 pr-4 align-top">
          <div className="flex items-center gap-2">
            {rule.isDraft ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-not-allowed">
                    <Switch checked={false} disabled className="opacity-50" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-[200px]">Edita al menos un campo para poder activar esta regla.</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Switch
                checked={rule.active}
                onCheckedChange={() => toggleRule(rule.id)}
                className="data-[state=checked]:bg-[#60D3E4]"
              />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[#8D939D] hover:text-[#233155] opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(rule.id)}>
                  <Edit2 size={14} className="mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDuplicate(rule.id)}>
                  <Copy size={14} className="mr-2" /> Duplicar
                </DropdownMenuItem>
                {!rule.isDraft && (
                  <DropdownMenuItem onClick={() => toggleRule(rule.id)}>
                    {rule.active ? 'Desactivar' : 'Activar'}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(rule.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 size={14} className="mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
    );
  };

  // Shared table header
  const TableHeader = ({ showOrder = false }: { showOrder?: boolean }) => (
    <thead>
      <tr className="border-b border-[#F4F6FC]">
        <th className="w-12 pl-4 pr-2 py-2 text-left text-[10px] text-[#A3A8B0] uppercase tracking-wider">
          {showOrder ? '#' : ''}
        </th>
        <th className="py-2 pr-6 text-left text-[10px] text-[#A3A8B0] uppercase tracking-wider">Regla</th>
        <th className="py-2 pr-4 text-left text-[10px] text-[#A3A8B0] uppercase tracking-wider">Alcance</th>
        <th className="py-2 pr-4 text-left text-[10px] text-[#A3A8B0] uppercase tracking-wider">Estado</th>
        <th className="py-2 pr-4 text-left text-[10px] text-[#A3A8B0] uppercase tracking-wider">Modificada</th>
        <th className="py-2 pr-4 w-24"></th>
      </tr>
    </thead>
  );

  // --- List View ---
  return (
    <div className="h-full bg-[#F4F6FC] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#CFD3DE] px-6 py-4 shrink-0">
        <Breadcrumbs
          items={[
            { label: 'Repositorio', onClick: onNavigateBack },
            { label: 'Reglas' }
          ]}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-[#E5E7EB] px-8 py-5 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-[#233155] mb-1">Reglas de automatización</h2>
            <p className="text-sm text-[#8D939D]">
              Define qué llamadas grabar, transcribir y analizar. Las reglas aplican a futuro, en orden de prioridad.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#60D3E4] hover:bg-[#387983] text-white">
                <Plus size={16} className="mr-2" />
                Crear regla
                <ChevronDown size={14} className="ml-2 opacity-80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2">
              <DropdownMenuItem className="p-3 cursor-pointer hover:bg-[#F4F6FC] rounded-md flex items-start gap-3" onClick={() => handleCreate('recording')}>
                <div className="p-2 bg-red-50 text-red-500 rounded-full shrink-0"><Circle size={8} className="fill-current" /></div>
                <div>
                  <div className="text-sm text-[#233155] mb-0.5">Regla de Grabación</div>
                  <div className="text-xs text-[#8D939D]">Guarda el audio de las llamadas</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer hover:bg-[#F4F6FC] rounded-md flex items-start gap-3" onClick={() => handleCreate('transcription')}>
                <div className="p-2 bg-blue-50 text-blue-500 rounded-full shrink-0"><FileText size={14} /></div>
                <div>
                  <div className="text-sm text-[#233155] mb-0.5">Regla de Transcripción</div>
                  <div className="text-xs text-[#8D939D]">Convierte el audio en texto</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer hover:bg-[#F4F6FC] rounded-md flex items-start gap-3" onClick={() => handleCreate('classification')}>
                <div className="p-2 bg-purple-50 text-purple-500 rounded-full shrink-0"><Sparkles size={14} /></div>
                <div>
                  <div className="text-sm text-[#233155] mb-0.5">Regla de Clasificación IA</div>
                  <div className="text-xs text-[#8D939D]">Analiza con inteligencia artificial</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6" ref={listRef}>
        <div className="max-w-5xl mx-auto">
          {rules.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-16 text-center">
              <div className="w-14 h-14 bg-[#EEFBFD] rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-[#60D3E4]" />
              </div>
              <h3 className="text-[#233155] mb-2">No hay reglas configuradas</h3>
              <p className="text-sm text-[#8D939D] mb-6 max-w-md mx-auto">
                Las reglas definen qué conversaciones se graban, transcriben y analizan automáticamente. Crea tu primera regla para empezar.
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#60D3E4] hover:bg-[#387983] text-white">
                    <Plus size={16} className="mr-2" />
                    Crear primera regla
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-72 p-2">
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-[#F4F6FC] rounded-md" onClick={() => handleCreate('recording')}>
                    <div className="text-sm text-[#233155]">Regla de Grabación</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-[#F4F6FC] rounded-md" onClick={() => handleCreate('transcription')}>
                    <div className="text-sm text-[#233155]">Regla de Transcripción</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer hover:bg-[#F4F6FC] rounded-md" onClick={() => handleCreate('classification')}>
                    <div className="text-sm text-[#233155]">Regla de Clasificación IA</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="space-y-5">

              {/* ─── Active Rules ─── */}
              <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
                <div className="px-5 py-3 bg-[#FAFBFD] border-b border-[#F4F6FC] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-sm text-[#233155]">Reglas activas</span>
                    <span className="text-xs text-[#8D939D] bg-[#F4F6FC] px-1.5 py-0.5 rounded">{activeRules.length}</span>
                  </div>
                  {activeRules.length > 1 && (
                    <span className="text-[11px] text-[#A3A8B0]">Arrastra para reordenar · Arriba = más prioridad</span>
                  )}
                </div>

                {activeRules.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-[#8D939D]">Ninguna regla activa todavía.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <TableHeader showOrder />
                    <tbody>
                      {activeRules.map((rule, idx) => renderRow(rule, idx, true))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ─── Inactive Rules ─── */}
              {inactiveRules.length > 0 && (
                <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
                  <div className="px-5 py-3 bg-[#FAFBFD] border-b border-[#F4F6FC] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#CFD3DE] rounded-full" />
                    <span className="text-sm text-[#233155]">Inactivas</span>
                    <span className="text-xs text-[#8D939D] bg-[#F4F6FC] px-1.5 py-0.5 rounded">{inactiveRules.length}</span>
                  </div>
                  <table className="w-full">
                    <TableHeader />
                    <tbody>
                      {inactiveRules.map((rule, idx) => renderRow(rule, idx, false))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ─── Draft Rules ─── */}
              {draftRules.length > 0 && (
                <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                  <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-sm text-amber-800">Borradores</span>
                    <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">{draftRules.length}</span>
                    <span className="text-xs text-amber-500 ml-2">· Edita y guarda para poder activarlos</span>
                  </div>
                  <table className="w-full">
                    <TableHeader />
                    <tbody>
                      {draftRules.map((rule, idx) => renderRow(rule, idx, false))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              Eliminar regla permanentemente
            </DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. La regla se eliminará permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm text-[#233155] mb-2 block">
                Escribe el nombre de la regla para confirmar: <span className="font-medium">{rules.find(r => r.id === ruleToDelete)?.name}</span>
              </Label>
              <Input
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Escribe el nombre aquí..."
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmationText('');
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmationText !== rules.find(r => r.id === ruleToDelete)?.name}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              Eliminar regla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyframe for highlight animation */}
      <style>{`
        @keyframes highlight-fade {
          0% { background-color: rgba(96, 211, 228, 0.15); }
          100% { background-color: transparent; }
        }
        .animate-highlight-fade {
          animation: highlight-fade 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}