import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ConversationsView } from "./components/ConversationsView";
import { Repository } from "./components/Repository";
import { RulesRepository } from "./components/RulesRepository";
import { RulesProvider } from "./components/RulesContext";

import { EntitiesProvider } from "./components/EntitiesContext";
import { EntityManagement } from "./components/EntityManagement";
import { CategoriesProvider } from "./components/CategoriesContext";
import { CategoriesManagement } from "./components/CategoriesManagement";

type View = 'conversations' | 'repository' | 'repository-rules' | 'repository-entities' | 'repository-categories';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('conversations');
  
  // Estados para navegación con parámetros
  const [navigationParams, setNavigationParams] = useState<{
    openRuleId?: number;
    highlightSection?: string;
    preConfiguredCategory?: string;
    autoOpenBuilder?: boolean;
  }>({});
  
  const [filters, setFilters] = useState({
    services: [] as string[],
    dateRange: "",
    origin: "",
    destination: "",
    groups: [] as string[],
    agents: [] as string[],
  });

  return (
    <RulesProvider>
      <EntitiesProvider>
        <CategoriesProvider>
          <div className="flex h-screen bg-[#F4F6FC]">
        <Sidebar 
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
        />
        
        {currentView === 'conversations' && (
          <ConversationsView
            onNavigateToRepository={() => setCurrentView('repository-rules')}
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {currentView === 'repository' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <Repository 
              onNavigateToRules={() => setCurrentView('repository-rules')}
              onNavigateToEntities={() => setCurrentView('repository-entities')}
              onNavigateToCategories={() => setCurrentView('repository-categories')}
            />
          </div>
        )}

        {currentView === 'repository-rules' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <RulesRepository 
              onNavigateBack={() => {
                setCurrentView('repository');
                setNavigationParams({});
              }}
              onNavigateToCategories={() => setCurrentView('repository-categories')}
              navigationParams={navigationParams}
              onClearNavigationParams={() => setNavigationParams({})}
            />
          </div>
        )}

        {currentView === 'repository-entities' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <EntityManagement 
              onNavigateBack={() => setCurrentView('repository')}
            />
          </div>
        )}

        {currentView === 'repository-categories' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <CategoriesManagement 
              onNavigateBack={() => setCurrentView('repository')}
              onNavigateToRules={(ruleId?: number, highlightSection?: string) => {
                setNavigationParams({
                  openRuleId: ruleId,
                  highlightSection: highlightSection
                });
                setCurrentView('repository-rules');
              }}
              onCreateFirstRule={(categoryId: string) => {
                setNavigationParams({
                  autoOpenBuilder: true,
                  preConfiguredCategory: categoryId
                });
                setCurrentView('repository-rules');
              }}
            />
          </div>
        )}
      </div>
      </CategoriesProvider>
      </EntitiesProvider>
    </RulesProvider>
  );
}
