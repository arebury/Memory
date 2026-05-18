import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

/**
 * DataExportImport Component
 * 
 * Sistema de backup y restauración de datos del Repositorio.
 * 
 * FUNCIONALIDADES:
 * - Exportar: Descarga un JSON con reglas, entidades y categorías
 * - Importar: Carga un JSON y reemplaza todos los datos actuales
 * 
 * FORMATO DEL JSON EXPORTADO:
 * {
 *   version: "1.0",
 *   exportDate: "2024-12-04T10:30:00.000Z",
 *   data: {
 *     rules: [...],      // Array de reglas de grabación
 *     entities: [...],   // Array de entidades IA (personalizadas)
 *     categories: [...]  // Array de categorías IA
 *   }
 * }
 * 
 * PERSISTENCIA:
 * - localStorage keys: 'ivr_rules', 'ivr_entities', 'ivr_categories'
 * - Auto-guardado: Los contextos guardan automáticamente en cada cambio
 * - Import: Sobrescribe localStorage y recarga la página
 */

interface ExportedData {
  version: string;
  exportDate: string;
  data: {
    rules: any[];
    entities: any[];
    categories: any[];
  };
}

export function DataExportImport() {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      // Leer datos de localStorage
      const rules = localStorage.getItem('ivr_rules');
      const entities = localStorage.getItem('ivr_entities');
      const categories = localStorage.getItem('ivr_categories');

      const exportData: ExportedData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          rules: rules ? JSON.parse(rules) : [],
          entities: entities ? JSON.parse(entities) : [],
          categories: categories ? JSON.parse(categories) : [],
        },
      };

      // Crear y descargar archivo
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ivr-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Datos exportados correctamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportDialog(true);
    }
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importFile) return;

    try {
      const fileContent = await importFile.text();
      const importedData: ExportedData = JSON.parse(fileContent);

      // Validar estructura básica
      if (!importedData.data || !importedData.data.rules || !importedData.data.entities || !importedData.data.categories) {
        throw new Error('Formato de archivo inválido');
      }

      // Guardar en localStorage
      localStorage.setItem('ivr_rules', JSON.stringify(importedData.data.rules));
      localStorage.setItem('ivr_entities', JSON.stringify(importedData.data.entities));
      localStorage.setItem('ivr_categories', JSON.stringify(importedData.data.categories));

      toast.success('Datos importados correctamente');
      setShowImportDialog(false);
      setImportFile(null);

      // Recargar la página para actualizar todos los contextos
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Error al importar: formato de archivo inválido');
      setShowImportDialog(false);
      setImportFile(null);
    }
  };

  const handleCancelImport = () => {
    setShowImportDialog(false);
    setImportFile(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} />
            Gestionar datos
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} className="gap-2">
            <Download size={16} />
            Exportar datos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportClick} className="gap-2">
            <Upload size={16} />
            Importar datos
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Input oculto para seleccionar archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      {/* Dialog de confirmación de importación */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-amber-600" size={20} />
              </div>
              <AlertDialogTitle>¿Importar datos?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Esta acción reemplazará <strong>todas las reglas, entidades y categorías actuales</strong> con los datos del archivo importado.
              <br /><br />
              Se recomienda exportar tus datos actuales como backup antes de continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelImport}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              className="bg-[#FF6B6B] hover:bg-[#FF5252]"
            >
              Importar y reemplazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}