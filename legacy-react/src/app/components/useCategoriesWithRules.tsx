import { useMemo } from 'react';
import { useCategories, Category } from './CategoriesContext';
import { useRules } from './RulesContext';

/**
 * Hook que enriquece las categorías con información de las reglas vinculadas
 */
export function useCategoriesWithRules() {
  const { categories, ...categoriesMethods } = useCategories();
  const { rules } = useRules();

  const categoriesWithRules = useMemo(() => {
    return categories.map(category => {
      // Buscar todas las reglas que usan esta categoría
      const linkedRules = rules
        .filter(rule => rule.categorias?.includes(category.id))
        .map(rule => ({
          id: rule.id,
          name: rule.name,
          services: rule.servicios,
          isActive: rule.active,
          categoriesCount: rule.categorias?.length || 0
        }));

      // Calcular usedInRules
      const usedInRules = linkedRules.length;

      return {
        ...category,
        linkedRules,
        usedInRules
      };
    });
  }, [categories, rules]);

  return {
    categories: categoriesWithRules,
    ...categoriesMethods
  };
}
