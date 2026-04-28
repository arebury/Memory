import { Home, Search, Grid, Phone, Users, Wrench, MessageSquare, BarChart3, Settings, Clock, FolderOpen, FileText, ArrowUpRight } from 'lucide-react';
import ScLogo from '../imports/ScLogo';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: 'conversations' | 'repository' | 'repository-rules') => void;
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const menuItems = [
    { icon: Grid, view: null, active: false },
    { icon: Search, view: null, active: false },
    { icon: BarChart3, view: null, active: false },
    { icon: Phone, view: null, active: false },
    { icon: Users, view: null, active: false },
    { icon: Wrench, view: null, active: false },
    { icon: MessageSquare, view: 'conversations' as const, active: currentView === 'conversations' },
    { icon: FolderOpen, view: 'repository' as const, active: currentView === 'repository' || currentView === 'repository-rules' },
    { icon: Settings, view: null, active: false },
    { icon: Clock, view: null, active: false },
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