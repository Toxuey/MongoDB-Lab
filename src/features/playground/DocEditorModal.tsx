import React, { useState, useEffect } from 'react';
import { Save, Trash2, Code2, ListTree, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useDbStore } from '../../store/dbStore';
import { confirmModal } from '../../store/modalStore';

export const DocEditorModal: React.FC = () => {
  const { selectedDocForEdit, setSelectedDocForEdit, setActiveTab } = useEditorStore();
  const { insertDocument, updateDocument, deleteDocument, selectedCollection } = useDbStore();

  const isCreating = !selectedDocForEdit?.doc;
  const colName = selectedDocForEdit?.collection || selectedCollection;

  const [mode, setMode] = useState<'text' | 'tree'>('text');
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDocForEdit?.doc) {
      setJsonText(JSON.stringify(selectedDocForEdit.doc, null, 2));
    } else {
      setJsonText('{\n  "nombre": "Nuevo registro",\n  "activo": true\n}');
    }
  }, [selectedDocForEdit]);

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);

      if (isCreating) {
        await insertDocument(colName, parsed);
      } else {
        await updateDocument(colName, selectedDocForEdit!.doc._id, parsed);
      }

      setSelectedDocForEdit(null);
      setActiveTab('editor');
    } catch (err: any) {
      setError(`Error de validación JSON: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedDocForEdit?.doc) return;
    const ok = await confirmModal({
      title: 'Eliminar documento',
      message: `¿Eliminar definitivamente el documento con _id "${selectedDocForEdit.doc._id}"? Esta acción es irreversible.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (ok) {
      await deleteDocument(colName, selectedDocForEdit.doc._id);
      setSelectedDocForEdit(null);
      setActiveTab('editor');
    }
  };

  const renderTreeView = (obj: any, depth = 0): React.ReactNode => {
    if (obj === null) return <span className="text-neutral-500">null</span>;
    if (typeof obj !== 'object') {
      return <span className="text-emerald-400">{JSON.stringify(obj)}</span>;
    }

    const isArr = Array.isArray(obj);
    const keys = Object.keys(obj);

    return (
      <div style={{ paddingLeft: `${depth * 14}px` }} className="space-y-1 font-mono text-xs">
        {keys.map((k) => (
          <div key={k} className="flex flex-col">
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="text-purple-400 font-semibold">{isArr ? `[${k}]` : k}:</span>
              {typeof obj[k] !== 'object' && renderTreeView(obj[k], depth + 1)}
            </div>
            {typeof obj[k] === 'object' && obj[k] !== null && renderTreeView(obj[k], depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  let parsedTreeData: any = null;
  try {
    parsedTreeData = JSON.parse(jsonText);
  } catch {
    parsedTreeData = null;
  }

  return (
    <div className="h-full flex flex-col bg-neutral-950 text-neutral-200 font-mono text-xs select-none">
      {/* Top Header */}
      <div className="h-9 px-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-100">
            {isCreating ? 'Crear Documento' : `Editando Doc: ${selectedDocForEdit?.doc._id}`}
          </span>
          <span className="text-[11px] text-neutral-500">en {colName}</span>
        </div>

        {/* Mode Switcher and Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5">
            <button
              onClick={() => setMode('text')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                mode === 'text' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => setMode('tree')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] ${
                mode === 'tree' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400'
              }`}
            >
              <ListTree className="w-3 h-3" />
              <span>Árbol</span>
            </button>
          </div>

          {!isCreating && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-400 transition-colors"
              title="Eliminar documento"
            >
              <Trash2 className="w-3 h-3" />
              <span>Eliminar</span>
            </button>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00ED64] hover:bg-[#00ED64]/90 text-neutral-950 font-semibold transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-red-950/40 border-b border-red-800/80 text-red-400 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 overflow-hidden p-4">
        {mode === 'text' ? (
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-full bg-neutral-900/50 border border-neutral-800 rounded p-3 font-mono text-xs text-neutral-100 focus:outline-none focus:border-[#00ED64] resize-none leading-relaxed"
          />
        ) : (
          <div className="w-full h-full bg-neutral-900/40 border border-neutral-800 rounded p-4 overflow-auto">
            {parsedTreeData ? (
              renderTreeView(parsedTreeData)
            ) : (
              <div className="text-red-400 text-xs">Corrige los errores de sintaxis JSON en la vista texto para ver el árbol.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
