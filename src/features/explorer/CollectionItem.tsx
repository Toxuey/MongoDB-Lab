import React, { useState } from 'react';
import { Database, MoreVertical, Copy, Edit2, Trash2, Download } from 'lucide-react';
import { MongoCollection } from '../../types/mongo';

interface CollectionItemProps {
  collection: MongoCollection;
  isSelected: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export const CollectionItem: React.FC<CollectionItemProps> = ({
  collection,
  isSelected,
  onSelect,
  onRename,
  onDuplicate,
  onDelete,
  onExport,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-1.5 rounded cursor-pointer text-xs font-mono select-none transition-colors ${
        isSelected
          ? 'bg-neutral-800 text-[#00ED64]'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Database className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#00ED64]' : 'text-neutral-500'}`} />
        <span className="truncate">{collection.name}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded font-sans ${
            isSelected ? 'bg-neutral-900 text-neutral-300' : 'bg-neutral-900/60 text-neutral-500'
          }`}
        >
          {collection.documents.length}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-opacity"
          title="Opciones de colección"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Context dropdown menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
          <div className="absolute right-2 top-8 z-30 w-36 bg-neutral-900 border border-neutral-800 rounded shadow-xl py-1 text-neutral-300 font-sans text-xs">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRename(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 text-left"
            >
              <Edit2 className="w-3 h-3 text-neutral-400" />
              <span>Renombrar</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDuplicate(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 text-left"
            >
              <Copy className="w-3 h-3 text-neutral-400" />
              <span>Duplicar</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); onExport(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-800 text-left"
            >
              <Download className="w-3 h-3 text-neutral-400" />
              <span>Exportar JSON</span>
            </button>
            <hr className="border-neutral-800 my-1" />
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-red-950/60 text-red-400 text-left"
            >
              <Trash2 className="w-3 h-3" />
              <span>Eliminar</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
