import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Breadcrumbs } from "./Breadcrumbs";
import { Home, ChevronRight, Lightbulb, X, Plus } from "lucide-react";
import { Category } from "./CategoriesContext";
import { useCategoriesWithRules } from "./useCategoriesWithRules";
import { CategoriesEmpty } from "./CategoriesEmpty";
import { CategoriesList } from "./CategoriesList";
import { CreateCategoryPanel } from "./CreateCategoryPanel";
import { EditCategoryPanel } from "./EditCategoryPanel";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { toast } from "sonner@2.0.3";

interface CategoriesManagementProps {
  onNavigateBack: () => void;
  onNavigateToRules?: (ruleId?: number, highlightSection?: string) => void;
  onCreateFirstRule?: (categoryId: string) => void;
}

export function CategoriesManagement({ onNavigateBack, onNavigateToRules, onCreateFirstRule }: CategoriesManagementProps) {
  const { categories, deleteCategory, duplicateCategory } = useCategoriesWithRules();
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [template, setTemplate] = useState<"complaint" | "churn" | "competitor" | "incident" | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);

  // Show onboarding banner when first category is created
  useEffect(() => {
    const prevCount = categories.length - 1;
    if (categories.length === 1 && prevCount === 0) {
      setShowOnboardingBanner(true);
    }
  }, [categories.length]);

  const handleCreateCategory = () => {
    setTemplate(null);
    setShowCreatePanel(true);
  };

  const handleUseTemplate = (templateType: "complaint" | "churn" | "competitor" | "incident") => {
    setTemplate(templateType);
    setShowCreatePanel(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDuplicateCategory = (category: Category) => {
    duplicateCategory(category.id);
    toast.success("Categoría duplicada correctamente");
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
  };

  const handleConfirmDelete = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
      toast.success("Categoría eliminada correctamente");
      setDeletingCategory(null);
    }
  };

  const isEmpty = categories.length === 0;

  return (
    <>
      <div className="h-full bg-[#F4F6FC] flex flex-col overflow-hidden">
        {/* Header - Breadcrumb style */}
        <div className="bg-white border-b border-[#CFD3DE] px-6 py-4 flex-shrink-0">
          <Breadcrumbs 
            items={[
              { label: 'Repositorio', onClick: onNavigateBack },
              { label: 'Categorías IA' }
            ]}
          />
        </div>

        {/* Main content */}
        {isEmpty ? (
          <CategoriesEmpty
            onCreateCategory={handleCreateCategory}
            onUseTemplate={handleUseTemplate}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Título y toolbar */}
            <div className="bg-white border-b border-[#E5E7EB] px-12 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[#233155] mb-1">Categorías IA</h2>
                  <p className="text-sm text-[#8D939D]">
                    Clasificaciones personalizadas para el análisis automático de llamadas
                  </p>
                </div>
                <Button
                  onClick={handleCreateCategory}
                  className="bg-[#60D3E4] hover:bg-[#4FC3D3] text-white"
                >
                  <Plus size={16} className="mr-2" />
                  Nueva categoría
                </Button>
              </div>
            </div>

            {/* Categories list */}
            <div className="px-12 py-6">
              {/* Onboarding banner */}
              {showOnboardingBanner && (
                <div className="bg-gradient-to-r from-[#EEFBFD] to-[#F0F9FF] border border-[#60D3E4]/30 rounded-lg p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Lightbulb size={24} className="text-[#60D3E4]" />
                    </div>
                    <div>
                      <h3 className="text-[#233155] font-medium mb-1">
                        ¡Categoría creada!
                      </h3>
                      <p className="text-sm text-[#8D939D]">
                        Ahora añádela a una regla de grabación para que la IA empiece a detectarla en tus llamadas.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-[#60D3E4] text-[#60D3E4] hover:bg-[#60D3E4] hover:text-white"
                      onClick={() => onNavigateToRules && onNavigateToRules()}
                    >
                      Ir a Reglas de Grabación →
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowOnboardingBanner(false)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              )}

              <CategoriesList
                categories={categories}
                onEditCategory={handleEditCategory}
                onDuplicateCategory={handleDuplicateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </div>
          </div>
        )}
      </div>

      {/* Create panel */}
      <CreateCategoryPanel
        open={showCreatePanel}
        onOpenChange={(open) => {
          setShowCreatePanel(open);
          if (!open) setTemplate(null);
        }}
        template={template}
      />

      {/* Edit panel */}
      <EditCategoryPanel
        category={editingCategory}
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        onDelete={handleDeleteCategory}
        onNavigateToRules={onNavigateToRules}
        onCreateFirstRule={() => editingCategory && onCreateFirstRule && onCreateFirstRule(editingCategory.id)}
      />

      {/* Delete dialog */}
      <DeleteCategoryDialog
        category={deletingCategory}
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}