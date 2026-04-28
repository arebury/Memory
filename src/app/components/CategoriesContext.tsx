import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Category {
  id: string;
  name: string;
  description: string;
  group?: string;
  isActive: boolean;
  usedInRules: number;
  classifiedCalls: number;
  createdAt: string;
  isTemplate?: boolean;
  linkedRules?: Array<{ id: number; name: string; services: string[]; isActive: boolean; categoriesCount: number }>;
}

interface CategoriesContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, "id" | "createdAt" | "usedInRules" | "classifiedCalls">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  duplicateCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    // Cargar categorías desde localStorage al iniciar
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ivr_categories');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error loading categories from localStorage', e);
        }
      }
    }
    return [];
  });

  // Guardar en localStorage cada vez que cambien las categorías
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ivr_categories', JSON.stringify(categories));
    }
  }, [categories]);

  const addCategory = (category: Omit<Category, "id" | "createdAt" | "usedInRules" | "classifiedCalls">) => {
    const newCategory: Category = {
      ...category,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
      usedInRules: 0,
      classifiedCalls: 0,
    };
    setCategories([newCategory, ...categories]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const duplicateCategory = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (category) {
      const newCategory: Category = {
        ...category,
        id: Math.random().toString(36).substring(7),
        name: `${category.name} (copia)`,
        createdAt: new Date().toISOString(),
        usedInRules: 0,
        classifiedCalls: 0,
      };
      setCategories([newCategory, ...categories]);
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        duplicateCategory,
        getCategoryById,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}