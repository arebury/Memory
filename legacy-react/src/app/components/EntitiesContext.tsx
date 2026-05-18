import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type EntityType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'email' 
  | 'phone' 
  | 'list'
  | 'name'
  | 'age'
  | 'url'
  | 'ordinal'
  | 'currency'
  | 'datetime'
  | 'dimension'
  | 'geography'
  | 'key_phrase'
  | 'percentage'
  | 'phone_number'
  | 'temperature';

export interface EntityConfig {
  listValues?: { value: string; synonyms: string[] }[];
  defaultValue?: string;
  validation?: {
    regex: string;
    message?: string;
  };
  synonyms?: string[]; // Deprecated for List type, kept for backward compatibility or other types
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  type: EntityType;
  color?: string;
  isSystem: boolean;
  config?: EntityConfig;
  createdAt: string;
  updatedAt: string;
  format?: string;
}

// Mock initial system entities
const INITIAL_SYSTEM_ENTITIES: Entity[] = [
  // Call Metadata Variables
  { id: 'sys_ani', name: 'call_origin', description: 'Número origen (ANI / Caller ID)', type: 'phone_number', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: 'E.164' },
  { id: 'sys_dnis', name: 'call_dnis', description: 'Número marcado (DNIS)', type: 'phone_number', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: 'E.164' },
  { id: 'sys_timestamp', name: 'call_timestamp', description: 'Fecha y hora de la llamada', type: 'datetime', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: 'ISO 8601' },
  { id: 'sys_session_id', name: 'call_session_id', description: 'ID de llamada / sesión', type: 'text', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: 'UUID' },
  { id: 'sys_country', name: 'call_country', description: 'País / prefijo', type: 'geography', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: 'ISO 3166' },
  { id: 'sys_carrier', name: 'call_carrier', description: 'Carrier / Operador', type: 'text', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  // Standard Extraction Entities
  { id: 'sys_date', name: 'sys_date', description: 'Fechas mencionadas', type: 'date', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: 'YYYY-MM-DD' },
  { id: 'sys_time', name: 'sys_time', description: 'Horas mencionadas', type: 'datetime', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: 'HH:mm' },
  { id: 'sys_number', name: 'sys_number', description: 'Cualquier valor numérico genérico', type: 'number', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'sys_currency', name: 'sys_currency', description: 'Importes monetarios', type: 'currency', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: '0.00 EUR' },
  { id: 'sys_dni', name: 'sys_dni', description: 'DNI/NIF detectado', type: 'key_phrase', isSystem: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), format: '8 dígitos + letra' },
];

interface EntitiesContextType {
  entities: Entity[];
  systemEntities: Entity[];
  addEntity: (entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntity: (id: string, entity: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  getEntityById: (id: string) => Entity | undefined;
}

const EntitiesContext = createContext<EntitiesContextType | undefined>(undefined);

export function EntitiesProvider({ children }: { children: ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>(() => {
    // Cargar entidades desde localStorage al iniciar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ivr_entities');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading entities from localStorage', e);
        }
      }
    }
    return [];
  });
  const [systemEntities] = useState<Entity[]>(INITIAL_SYSTEM_ENTITIES);

  // Guardar en localStorage cada vez que cambien las entidades
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ivr_entities', JSON.stringify(entities));
    }
  }, [entities]);

  const addEntity = (newEntityData: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntity: Entity = {
      ...newEntityData,
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntities(prev => [...prev, newEntity]);
  };

  const updateEntity = (id: string, updates: Partial<Entity>) => {
    setEntities(prev => prev.map(e => 
      e.id === id 
        ? { ...e, ...updates, updatedAt: new Date().toISOString() } 
        : e
    ));
  };

  const deleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const getEntityById = (id: string) => {
    return [...systemEntities, ...entities].find(e => e.id === id);
  };

  return (
    <EntitiesContext.Provider value={{ 
      entities, 
      systemEntities, 
      addEntity, 
      updateEntity, 
      deleteEntity,
      getEntityById
    }}>
      {children}
    </EntitiesContext.Provider>
  );
}

export function useEntities() {
  const context = useContext(EntitiesContext);
  if (context === undefined) {
    throw new Error('useEntities must be used within an EntitiesProvider');
  }
  return context;
}