import React, { useState } from 'react';
import { Database, Plus, RefreshCw, X } from 'lucide-react';
import { GithubIcon } from '../../components/ui/icons';
import { useDbStore } from '../../store/dbStore';
import { useEditorStore } from '../../store/editorStore';
import { useSettingsStore } from '../../store/settingsStore';
import { confirmModal, alertModal, promptModal } from '../../store/modalStore';
import { CollectionItem } from './CollectionItem';
import { CreateColDialog, ImportNewCollectionDialog } from './ExplorerDialogs';

export const ExplorerSidebar: React.FC = () => {
  const {
    database,
    selectedCollection,
    selectCollection,
    createCollection,
    renameCollection,
    duplicateCollection,
    deleteCollection,
    resetDatabase,
    exportCollectionJson,
    importCollectionJson,
  } = useDbStore();

  const { setActiveTab } = useEditorStore();
  const { setMobileSidebarOpen } = useSettingsStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleSelectCollection = (name: string) => {
    selectCollection(name);
    setActiveTab('table');
    setMobileSidebarOpen(false);
  };

  const collections = Object.values(database.collections);
  const totalDocs = collections.reduce((acc, c) => acc + c.documents.length, 0);

  const handleExport = (name: string) => {
    const jsonStr = exportCollectionJson(name);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRename = async (oldName: string) => {
    const newName = await promptModal({
      title: 'Renombrar colección',
      message: `Ingresa el nuevo nombre para la colección '${oldName}':`,
      defaultValue: oldName,
      confirmText: 'Renombrar',
    });
    if (newName && newName !== oldName) {
      try {
        await renameCollection(oldName, newName);
      } catch (err: any) {
        await alertModal({
          title: 'Error al renombrar',
          message: err.message,
          variant: 'danger',
        });
      }
    }
  };

  const handleDuplicate = async (name: string) => {
    const newName = await promptModal({
      title: 'Duplicar colección',
      message: `Ingresa el nombre para la copia de '${name}':`,
      defaultValue: `${name}_copia`,
      confirmText: 'Duplicar',
    });
    if (newName) {
      try {
        await duplicateCollection(name, newName);
      } catch (err: any) {
        await alertModal({
          title: 'Error al duplicar',
          message: err.message,
          variant: 'danger',
        });
      }
    }
  };

  const handleDelete = async (name: string) => {
    const ok = await confirmModal({
      title: 'Eliminar colección',
      message: `¿Estás seguro de que deseas eliminar la colección '${name}' y todos sus documentos asociados?`,
      confirmText: 'Eliminar colección',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (ok) {
      try {
        await deleteCollection(name);
      } catch (err: any) {
        await alertModal({
          title: 'No se puede eliminar la colección',
          message: err.message,
          variant: 'danger',
        });
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-300 select-none">
      {/* DB Header */}
      <div className="h-9 px-3 border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-3.5 h-3.5 text-[#00ED64]" />
          <span className="text-xs font-mono font-bold text-neutral-200 truncate">
            {database.name}
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">({collections.length})</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            title="Crear nueva colección"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetDatabase}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            title="Restablecer base de datos"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          {/* Mobile close drawer button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer ml-1"
            title="Cerrar barra lateral"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collections list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {collections.map((col) => (
          <CollectionItem
            key={col.name}
            collection={col}
            isSelected={selectedCollection === col.name}
            onSelect={() => handleSelectCollection(col.name)}
            onRename={() => handleRename(col.name)}
            onDuplicate={() => handleDuplicate(col.name)}
            onDelete={() => handleDelete(col.name)}
            onExport={() => handleExport(col.name)}
          />
        ))}
      </div>

      {/* Bottom actions */}
      <div className="px-3 py-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500 font-mono shrink-0">
        <span>{totalDocs} docs</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="hover:text-neutral-300 transition-colors cursor-pointer"
            title="Crear nueva colección importando un JSON"
          >
            Importar
          </button>
          <span>•</span>
          <button
            onClick={() => handleExport(selectedCollection)}
            className="hover:text-neutral-300 transition-colors cursor-pointer"
            title="Exportar JSON de la colección actual"
          >
            Exportar
          </button>
        </div>
      </div>

      {/* Open Source / GitHub repository badge */}
      <div className="px-3 py-1.5 bg-neutral-950 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono text-neutral-500 shrink-0">
        <span className="text-neutral-500">Open Source</span>
        <a
          href="https://github.com/Toxuey/MongoDB-Lab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-neutral-400 hover:text-[#00ED64] transition-colors cursor-pointer"
          title="Ver repositorio Toxuey/MongoDB-Lab en GitHub"
        >
          <GithubIcon className="w-3 h-3" />
          <span>Toxuey/MongoDB-Lab</span>
        </a>
      </div>

      {/* Modals */}
      <CreateColDialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        existingCollections={Object.keys(database.collections)}
        onSubmit={async (name, options) => {
          await createCollection(name, options);
          setActiveTab('table');
          setMobileSidebarOpen(false);
        }}
      />
      <ImportNewCollectionDialog
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingCollections={Object.keys(database.collections)}
        onImportCollection={async (colName, json) => {
          await importCollectionJson(colName, json);
          setActiveTab('table');
          setMobileSidebarOpen(false);
        }}
      />
    </div>
  );
};
