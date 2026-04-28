import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type RuleType = 'recording' | 'transcription' | 'classification';
export type RuleStatus = 'active' | 'inactive' | 'draft' | 'conflict';

export interface Rule {
  id: number;
  type?: RuleType;
  name: string;
  description?: string;
  servicios: string[];
  grupos: string[];
  agentes: string[];
  origen: string;
  destino: string;
  transcripcion: boolean;
  clasificacion: boolean;
  sentimiento?: boolean;
  categorias?: string[];
  entidades?: string[];
  active: boolean;

  // Memory 3.0
  invertCondition?: boolean;
  direction?: string;
  schedule?: {
    enabled: boolean;
    from: string;
    to: string;
  };
  
  percentage?: number;
  durationMin?: number;
  durationMax?: number;
  tipificaciones?: string[];

  includeIVR?: boolean;
  includeTransfers?: boolean;
  includeConsultations?: boolean;
  
  analyzeSummary?: boolean;
  analyzeCategories?: boolean;
  analyzeEntities?: boolean;

  // OR scope groups (multi-condition)
  scopeOrGroups?: { services: string[]; groups: string[]; agents: string[] }[];

  // Priorización y borradores
  priority?: number;
  isDraft?: boolean;
  duplicatedFromId?: number | null;
  lastModified?: string;
}

interface RulesContextType {
  rules: Rule[];
  addRule: (rule: Partial<Omit<Rule, 'id' | 'active'>>) => void;
  updateRule: (id: number, rule: Partial<Rule>) => void;
  deleteRule: (id: number) => void;
  duplicateRule: (id: number) => void;
  toggleRule: (id: number) => void;
  reorderRules: (activeRuleIds: number[]) => void;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

// Seed data for demo purposes
const seedRules: Rule[] = [
  {
    id: 1001,
    type: 'recording',
    name: 'Grabar llamadas comerciales',
    description: 'Grabación automática de todas las llamadas del departamento comercial para control de calidad.',
    servicios: ['ventas-comercial', 'atencion-cliente'],
    grupos: ['acd-demo-c2cb'],
    agentes: [],
    origen: '', destino: '',
    transcripcion: false, clasificacion: false,
    active: true, priority: 1,
    direction: 'all',
    lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1002,
    type: 'transcription',
    name: 'Transcribir soporte técnico',
    description: 'Transcripción de llamadas de soporte para análisis posterior y detección de incidencias recurrentes.',
    servicios: ['soporte-tecnico'],
    grupos: ['soporte-nivel-1', 'soporte-nivel-2'],
    agentes: [],
    origen: '', destino: '',
    transcripcion: true, clasificacion: false,
    active: true, priority: 2,
    direction: 'inbound',
    durationMin: 30,
    lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1003,
    type: 'classification',
    name: 'Clasificar quejas y reclamaciones',
    description: 'Análisis IA para detectar sentimiento negativo y categorizar automáticamente las quejas.',
    servicios: ['atencion-cliente', 'postventa'],
    grupos: [],
    agentes: ['oscar-fernandez', 'maria-garcia'],
    origen: '', destino: '',
    transcripcion: true, clasificacion: true,
    active: true, priority: 3,
    analyzeSummary: true,
    analyzeCategories: true,
    sentimiento: true,
    lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1004,
    type: 'recording',
    name: 'Grabar llamadas VIP',
    description: 'Grabación de alta prioridad para clientes VIP.',
    servicios: [],
    grupos: ['clientes-vip'],
    agentes: [],
    origen: '', destino: '',
    transcripcion: false, clasificacion: false,
    active: false,
    direction: 'all',
    lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1005,
    type: 'transcription',
    name: 'Copia de Transcribir soporte técnico',
    description: 'Transcripción de llamadas de soporte para análisis posterior y detección de incidencias recurrentes.',
    servicios: ['soporte-tecnico'],
    grupos: ['soporte-nivel-1', 'soporte-nivel-2'],
    agentes: [],
    origen: '', destino: '',
    transcripcion: true, clasificacion: false,
    active: false,
    isDraft: true,
    duplicatedFromId: 1002,
    direction: 'inbound',
    durationMin: 30,
    lastModified: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export function RulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<Rule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ivr_rules_v2');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading rules from localStorage', e);
        }
      }
    }
    return seedRules;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ivr_rules_v2', JSON.stringify(rules));
    }
  }, [rules]);

  const addRule = useCallback((rule: Partial<Omit<Rule, 'id' | 'active'>>) => {
    const activeRules = rules.filter(r => r.active);
    const maxPriority = activeRules.reduce((max, r) => Math.max(max, r.priority || 0), 0);
    const newRule: Rule = {
      name: rule.name || '',
      servicios: rule.servicios || [],
      grupos: rule.grupos || [],
      agentes: rule.agentes || [],
      origen: rule.origen || '',
      destino: rule.destino || '',
      transcripcion: rule.transcripcion || false,
      clasificacion: rule.clasificacion || false,
      ...rule,
      id: Date.now(),
      active: true,
      priority: maxPriority + 1,
      lastModified: new Date().toISOString(),
    };
    setRules(prev => [...prev, newRule]);
  }, [rules]);

  const updateRule = useCallback((id: number, updatedFields: Partial<Rule>) => {
    setRules(prev => prev.map(rule => {
      if (rule.id !== id) return rule;
      const updated = { ...rule, ...updatedFields, lastModified: new Date().toISOString() };
      // If it was a draft and got edited, unlock it
      if (rule.isDraft && Object.keys(updatedFields).some(k => !['active'].includes(k))) {
        updated.isDraft = false;
        updated.duplicatedFromId = null;
      }
      return updated;
    }));
  }, []);

  const deleteRule = useCallback((id: number) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  const duplicateRule = useCallback((id: number) => {
    setRules(prev => {
      const ruleToDuplicate = prev.find(rule => rule.id === id);
      if (!ruleToDuplicate) return prev;
      const duplicated: Rule = {
        ...ruleToDuplicate,
        id: Date.now(),
        name: `Copia de ${ruleToDuplicate.name}`,
        active: false,
        isDraft: true,
        duplicatedFromId: ruleToDuplicate.id,
        priority: undefined,
        lastModified: new Date().toISOString(),
      };
      return [...prev, duplicated];
    });
  }, []);

  const toggleRule = useCallback((id: number) => {
    setRules(prev => {
      const rule = prev.find(r => r.id === id);
      if (!rule) return prev;
      // Can't activate a draft
      if (!rule.active && rule.isDraft) return prev;
      
      if (rule.active) {
        // Deactivating: remove priority
        return prev.map(r => r.id === id ? { ...r, active: false, priority: undefined, lastModified: new Date().toISOString() } : r);
      } else {
        // Activating: assign lowest priority
        const maxPriority = prev.filter(r => r.active).reduce((max, r) => Math.max(max, r.priority || 0), 0);
        return prev.map(r => r.id === id ? { ...r, active: true, priority: maxPriority + 1, lastModified: new Date().toISOString() } : r);
      }
    });
  }, []);

  const reorderRules = useCallback((activeRuleIds: number[]) => {
    setRules(prev => prev.map(rule => {
      const newIndex = activeRuleIds.indexOf(rule.id);
      if (newIndex === -1) return rule;
      return { ...rule, priority: newIndex + 1, lastModified: new Date().toISOString() };
    }));
  }, []);

  return (
    <RulesContext.Provider value={{
      rules,
      addRule,
      updateRule,
      deleteRule,
      duplicateRule,
      toggleRule,
      reorderRules
    }}>
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return context;
}