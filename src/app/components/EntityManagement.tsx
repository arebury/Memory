import { useState } from "react";
import { useEntities, Entity } from "./EntitiesContext";
import { CreateEntityModal } from "./CreateEntityModal";
import { EditEntitySidepanel } from "./EditEntitySidepanel";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, Plus, Info, AlertTriangle, Pin, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner@2.0.3";

interface EntityManagementProps {
  onNavigateBack?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  text: "Texto",
  number: "Número",
  date: "Fecha",
  email: "Email",
  phone: "Teléfono",
  list: "Lista",
  name: "Nombre",
  age: "Edad",
  url: "URL",
  ordinal: "Ordinal",
  currency: "Moneda",
  datetime: "Fecha y hora",
  dimension: "Dimensión",
  geography: "Geografía",
  key_phrase: "Frase clave",
  percentage: "Porcentaje",
  phone_number: "Número de teléfono",
  temperature: "Temperatura",
};

export function EntityManagement({ onNavigateBack }: EntityManagementProps) {
  const { entities, systemEntities, deleteEntity, addEntity, updateEntity } = useEntities();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isSidepanelOpen, setIsSidepanelOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRowClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsSidepanelOpen(true);
  };

  const handleSystemEntityClick = (entity: Entity) => {
    setSelectedEntity(entity);
    setIsSidepanelOpen(true);
  };

  const handleSaveSidepanel = (id: string, updates: Partial<Entity>) => {
    updateEntity(id, updates);
  };

  const handleDeleteFromSidepanel = (entity: Entity) => {
    setEntityToDelete(entity);
  };

  const handleConfirmDelete = () => {
    if (entityToDelete) {
      deleteEntity(entityToDelete.id);
      setEntityToDelete(null);
      setIsSidepanelOpen(false);
      toast.success("Entidad eliminada correctamente");
    }
  };

  const handleDuplicate = (entity: Entity) => {
    const duplicated = {
      ...entity,
      name: `${entity.name}_copy`,
      isSystem: false,
    };
    addEntity(duplicated);
    toast.success("Entidad duplicada correctamente");
  };

  const handleSaveEntity = (entityData: any) => {
    addEntity(entityData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Filter entities based on search query
  const filteredEntities = entities.filter(entity =>
    (entity.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entity.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (TYPE_LABELS[entity.type] || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSystemEntities = systemEntities;

  return (
    <div className="h-full bg-[#F4F6FC] flex flex-col">
      {/* Header con breadcrumbs */}
      <div className="bg-white border-b border-[#CFD3DE] px-6 py-4">
        {onNavigateBack ? (
          <Breadcrumbs 
            items={[
              { label: 'Repositorio', onClick: onNavigateBack },
              { label: 'Entidades IA' }
            ]}
          />
        ) : (
          <h1 className="text-xl text-[#1C283D]">ENTIDADES IA</h1>
        )}
      </div>

      {/* Título y toolbar */}
      <div className="bg-white border-b border-[#E5E7EB] px-12 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#233155] mb-1">Entidades IA</h2>
            <p className="text-sm text-[#8D939D]">Gestiona las variables que la IA extraerá de tus conversaciones</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setIsCreateModalOpen(true);
              }}
              className="bg-[#60D3E4] hover:bg-[#387983] text-white"
            >
              <Plus size={16} className="mr-2" />
              Nueva entidad
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-12 py-8 space-y-8">
        
        {/* No results anywhere */}
        {searchQuery && filteredEntities.length === 0 && entities.length > 0 && (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#F4F6FC] rounded-full flex items-center justify-center mb-4">
              <Search size={32} className="text-[#8D939D]" />
            </div>
            <h3 className="text-lg font-medium text-[#233155] mb-2">No se encontraron resultados</h3>
            <p className="text-[#8D939D] max-w-md">
              No hay entidades que coincidan con tu búsqueda: "{searchQuery}"
            </p>
          </div>
        )}
        
        {/* System Entities Section - Always visible regardless of search */}
        {filteredSystemEntities.length > 0 && (
          <section>
            <h2 className="text-lg font-medium text-[#233155] mb-4">Entidades del sistema</h2>
            <div className="flex flex-wrap gap-2">
              {filteredSystemEntities.map((entity) => (
                <div 
                  key={entity.id} 
                  className="group bg-white hover:bg-[#EEFBFD] border border-[#E5E7EB] hover:border-[#60D3E4] rounded-full px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-all duration-200"
                  onClick={() => handleSystemEntityClick(entity)}
                >
                  <Pin size={12} className="text-[#8D939D] group-hover:text-[#60D3E4] transition-colors" />
                  <span className="text-sm font-medium text-[#233155] group-hover:text-[#387983]">{entity.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Entities Section */}
        {!(searchQuery && filteredEntities.length === 0 && entities.length > 0) && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#233155]">Entidades personalizadas</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8D939D]" size={16} />
                <Input
                  placeholder="Buscar entidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
            
            {entities.length === 0 ? (
              // Empty State
              <div className="bg-white border border-[#E5E7EB] rounded-lg p-12 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#EEFBFD] rounded-full flex items-center justify-center mb-4">
                  <Info size={32} className="text-[#60D3E4]" />
                </div>
                <h3 className="text-lg font-medium text-[#233155] mb-2">Aún no has creado entidades personalizadas</h3>
                <p className="text-[#8D939D] max-w-md mb-6">
                  Las entidades te permiten extraer datos específicos de tus conversaciones, como números de pedido, códigos de producto o motivos de llamada.
                </p>
                <Button
                  onClick={() => {
                    setIsCreateModalOpen(true);
                  }}
                  className="bg-[#60D3E4] hover:bg-[#387983] text-white"
                >
                  Crear mi primera entidad
                </Button>
              </div>
            ) : filteredEntities.length === 0 && searchQuery ? (
              // Don't show this section if search filtered everything out - show global message instead
              <></>
            ) : (
              // Table State with sticky header
              <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col max-h-[500px]">
                <div className="overflow-auto flex-1">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Formato esperado</TableHead>
                        <TableHead>Última modificación</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntities.map((entity) => (
                        <TableRow 
                          key={entity.id}
                          className="cursor-pointer hover:bg-[#FAFBFC] transition-colors"
                          onClick={() => handleRowClick(entity)}
                        >
                          <TableCell className="font-medium text-[#233155]">{entity.name}</TableCell>
                          <TableCell className="text-[#8D939D] max-w-xs truncate">
                            {entity.description || "–"}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4F6FC] text-[#233155]">
                              {TYPE_LABELS[entity.type] || entity.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-[#8D939D]">{(entity as any).format || "–"}</TableCell>
                          <TableCell className="text-[#8D939D]">{formatDate(entity.updatedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Create Modal */}
      <CreateEntityModal 
        open={isCreateModalOpen} 
        onOpenChange={setIsCreateModalOpen}
        onSave={handleSaveEntity}
      />

      {/* Edit Sidepanel */}
      <EditEntitySidepanel
        entity={selectedEntity}
        open={isSidepanelOpen}
        onOpenChange={setIsSidepanelOpen}
        onSave={handleSaveSidepanel}
        onDelete={handleDeleteFromSidepanel}
        onDuplicate={handleDuplicate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!entityToDelete} onOpenChange={(open) => !open && setEntityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} />
              ¿Eliminar {entityToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la entidad permanentemente.
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-xs">
                <span className="font-bold">Nota:</span> Si esta entidad está siendo usada en reglas activas, dejará de extraerse.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}