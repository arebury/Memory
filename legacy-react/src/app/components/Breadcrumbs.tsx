import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="flex items-center gap-2 h-5">
      {/* Home Icon */}
      <Home size={15} className="text-[#8D939D] shrink-0" />
      
      {/* Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={index} className="flex items-center gap-2">
            {/* Separator */}
            <ChevronRight size={14} className="text-[#CFD3DE] shrink-0" />
            
            {/* Text */}
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="text-sm text-[#8D939D] hover:text-[#233155] transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ) : (
              <span className={`text-sm whitespace-nowrap ${isLast ? 'text-[#233155] font-medium' : 'text-[#8D939D]'}`}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
