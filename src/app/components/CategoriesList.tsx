import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Search, MoreVertical, Edit2, Copy, Archive, Trash2 } from "lucide-react";
import { Category } from "./CategoriesContext";

interface CategoriesListProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDuplicateCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
}

export function CategoriesList({ 
  categories, 
  onEditCategory, 
  onDuplicateCategory, 
  onDeleteCategory 
}: CategoriesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Función para determinar el estado de uso de la categoría
  const getUsageStatus = (category: Category) => {
    if (!category.linkedRules || category.linkedRules.length === 0) {
      return { type: 'unused', text: '⚠️ Sin usar', color: 'text-amber-600' };
    }

    const hasActiveRule = category.linkedRules.some(rule => rule.isActive);
    
    if (hasActiveRule) {
      const count = category.linkedRules.length;
      return { 
        type: 'active', 
        text: `${count} ${count === 1 ? 'regla' : 'reglas'}`, 
        color: 'text-[#233155]' 
      };
    } else {
      return { type: 'inactive', text: '⏸️ Inactiva', color: 'text-[#8D939D]' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D939D]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar categorías..."
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Nombre</TableHead>
              <TableHead className="w-[40%]">Descripción</TableHead>
              <TableHead className="w-[10%]">Usada en</TableHead>
              <TableHead className="w-[15%]">Fecha de creación</TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-[#8D939D]">
                  {searchQuery ? "No se encontraron categorías" : "No hay categorías creadas"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow
                  key={category.id}
                  className="group cursor-pointer hover:bg-[#F4F6FC] transition-colors"
                  onClick={() => onEditCategory(category)}
                >
                  <TableCell className="font-medium text-[#233155]">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-[#8D939D] text-sm">
                    {truncateText(category.description)}
                  </TableCell>
                  <TableCell className={`text-sm ${getUsageStatus(category).color}`}>
                    {getUsageStatus(category).text}
                  </TableCell>
                  <TableCell className="text-[#8D939D] text-sm">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onEditCategory(category);
                        }}>
                          <Edit2 size={16} className="mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateCategory(category);
                        }}>
                          <Copy size={16} className="mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                        }}>
                          <Archive size={16} className="mr-2" />
                          Archivar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCategory(category);
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}