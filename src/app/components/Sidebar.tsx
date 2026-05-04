import { Search, Grid, Phone, Users, Wrench, MessageSquare, BarChart3, Settings, Clock, FolderOpen } from 'lucide-react';
import ScLogo from '../imports/ScLogo';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: 'conversations' | 'repository' | 'repository-rules') => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  // `label` powers `aria-label` on each button — the icon-only buttons
  // were previously unlabeled, so screen readers announced "button" with
  // no context (audit P4 fix). Disabled items still get a label so a
  // keyboard user understands what's coming next.
  const menuItems: Array<{
    icon: typeof Grid;
    view: 'conversations' | 'repository' | null;
    active: boolean;
    label: string;
  }> = [
    { icon: Grid, view: null, active: false, label: 'Próximamente: dashboard' },
    { icon: Search, view: null, active: false, label: 'Próximamente: búsqueda' },
    { icon: BarChart3, view: null, active: false, label: 'Próximamente: analítica' },
    { icon: Phone, view: null, active: false, label: 'Próximamente: llamadas' },
    { icon: Users, view: null, active: false, label: 'Próximamente: usuarios' },
    { icon: Wrench, view: null, active: false, label: 'Próximamente: herramientas' },
    { icon: MessageSquare, view: 'conversations', active: currentView === 'conversations', label: 'Conversaciones' },
    { icon: FolderOpen, view: 'repository', active: currentView === 'repository' || currentView === 'repository-rules', label: 'Repositorio' },
    { icon: Settings, view: null, active: false, label: 'Próximamente: configuración' },
    { icon: Clock, view: null, active: false, label: 'Próximamente: historial' },
  ];

  return (
    <div className="w-[90px] bg-[#1C283D] flex flex-col items-center py-4 gap-1.5 border-r border-[#11131A]">
      <div className="mb-4 w-12 h-12 flex items-center justify-center overflow-hidden">
        <div className="scale-[0.5] origin-center">
          <ScLogo />
        </div>
      </div>

      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={() => item.view && onNavigate(item.view)}
          disabled={!item.view}
          aria-label={item.label}
          aria-current={item.active ? 'page' : undefined}
          className={`p-2.5 rounded-lg transition-all ${
            item.active
              ? 'bg-[#60D3E4] text-white shadow-md'
              : item.view
                ? 'text-[#CFD3DE] hover:bg-[#2C3E50] hover:text-white cursor-pointer'
                : 'text-[#CFD3DE] opacity-50 cursor-not-allowed'
          }`}
        >
          <item.icon size={19} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}