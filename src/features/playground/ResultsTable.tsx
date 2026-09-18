import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Database,
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  Upload,
} from 'lucide-react';
import { useDbStore } from '../../store/dbStore';
import { useEditorStore } from '../../store/editorStore';
import { confirmModal, alertModal } from '../../store/modalStore';
import { generateObjectId } from '../../utils/objectId';

interface ResultsTableProps {
  data: any[];
  isReadOnly?: boolean;
  operation?: string;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  isReadOnly = false,
  operation,
}) => {
  const {
    selectedCollection,
    database,
    insertDocument,
    updateDocument,
    deleteDocument,
    importCollectionJson,
    runQuery,
  } = useDbStore();

  const currentCollectionObj = database.collections[selectedCollection];
  const currentSchema = currentCollectionObj?.schema;

  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(15);
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  // New row insertion state (Supabase style)
  const [isInserting, setIsInserting] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});

  // Inline cell editing state (Supabase style)
  const [editingCell, setEditingCell] = useState<{ id: string; col: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus on active inline edit input
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Reset insertion, editing, and pagination when switching collection
  useEffect(() => {
    setIsInserting(false);
    setNewRowData({});
    setEditingCell(null);
    setFilterText('');
    setCurrentPage(0);
  }, [selectedCollection]);

  // Detect if data is an array of primitive values (strings, numbers, etc.) like from getCollectionNames or distinct
  const isPrimitiveArray = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.some((item) => item === null || typeof item !== 'object');
  }, [data]);

  // Extract all columns
  const allColumns = useMemo(() => {
    if (isPrimitiveArray) {
      if (operation === 'getCollectionNames') return ['colección'];
      if (operation === 'distinct') return ['valor'];
      return ['resultado'];
    }

    const schemaCols = currentSchema?.columns?.map((c) => c.name) || [];

    if (!data || data.length === 0) {
      if (!isReadOnly) {
        if (schemaCols.length > 0) {
          return ['_id', ...schemaCols.filter((c) => c !== '_id')];
        }
        // Default fallback columns per collection if empty
        if (selectedCollection === 'usuarios') return ['_id', 'nombre', 'email', 'edad', 'ciudad', 'activo'];
        if (selectedCollection === 'peliculas') return ['_id', 'titulo', 'director', 'anio', 'genero', 'calificacion', 'disponible'];
        if (selectedCollection === 'productos') return ['_id', 'nombre', 'categoria', 'precio', 'stock', 'disponible'];
        return ['_id', 'nombre'];
      }
      return [];
    }

    const keys = new Set<string>();
    // Pre-insert schema columns only if we are managing collection directly
    if (!isReadOnly) {
      schemaCols.forEach((k) => keys.add(k));
    }

    data.slice(0, 50).forEach((item) => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach((k) => keys.add(k));
      }
    });

    const list = Array.from(keys);
    const idIdx = list.indexOf('_id');
    if (idIdx > 0) {
      list.splice(idIdx, 1);
      list.unshift('_id');
    } else if (idIdx === -1 && !isReadOnly) {
      list.unshift('_id');
    }
    return list;
  }, [data, isPrimitiveArray, operation, isReadOnly, selectedCollection, currentSchema]);

  // Filter rows by quick search
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!filterText.trim()) return data;
    const term = filterText.toLowerCase();

    return data.filter((doc) => {
      if (isPrimitiveArray) {
        return String(doc).toLowerCase().includes(term);
      }
      if (!doc || typeof doc !== 'object') return false;
      return Object.values(doc).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') {
          return JSON.stringify(val).toLowerCase().includes(term);
        }
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, filterText, isPrimitiveArray]);

  // Sort rows
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const valA = isPrimitiveArray ? a : a?.[sortCol];
      const valB = isPrimitiveArray ? b : b?.[sortCol];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return sortAsc ? 1 : -1;
      if (valB === undefined || valB === null) return sortAsc ? -1 : 1;
      return valA < valB ? (sortAsc ? -1 : 1) : sortAsc ? 1 : -1;
    });
    return sorted;
  }, [filteredData, sortCol, sortAsc, isPrimitiveArray]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const pageData = sortedData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  // Start new row insertion (Supabase style)
  const handleStartInsert = () => {
    const idType = currentSchema?.idType || 'objectId';
    let initialId: any = '';
    if (idType === 'uuid') {
      initialId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'uuid-' + Math.random().toString(36).slice(2, 11);
    } else if (idType === 'incremental') {
      const numericIds = (currentCollectionObj?.documents || [])
        .map((d) => Number(d._id))
        .filter((n) => !isNaN(n) && isFinite(n));
      initialId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    } else if (idType === 'manual') {
      initialId = '';
    } else {
      initialId = generateObjectId();
    }

    const initialDraft: Record<string, any> = {
      _id: initialId,
    };

    const schemaCols = currentSchema?.columns || [];

    allColumns.forEach((col) => {
      if (col !== '_id') {
        const schemaDef = schemaCols.find((c) => c.name === col);
        if (schemaDef) {
          if (schemaDef.defaultValue !== undefined && schemaDef.defaultValue !== '') {
            if (schemaDef.type === 'number') initialDraft[col] = Number(schemaDef.defaultValue) || 0;
            else if (schemaDef.type === 'boolean') initialDraft[col] = schemaDef.defaultValue === 'true';
            else initialDraft[col] = schemaDef.defaultValue;
          } else if (schemaDef.type === 'boolean') {
            initialDraft[col] = true;
          } else if (schemaDef.type === 'number') {
            initialDraft[col] = 0;
          } else {
            initialDraft[col] = '';
          }
        } else {
          const sampleDoc = data[0];
          const sampleVal = sampleDoc ? sampleDoc[col] : undefined;
          if (typeof sampleVal === 'boolean') {
            initialDraft[col] = true;
          } else if (typeof sampleVal === 'number') {
            initialDraft[col] = 0;
          } else {
            initialDraft[col] = '';
          }
        }
      }
    });

    setNewRowData(initialDraft);
    setIsInserting(true);
  };

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const content = ev.target?.result as string;
        await importCollectionJson(selectedCollection, content);
        const q = `db.${selectedCollection}.find()`;
        useEditorStore.getState().setCode(q);
        const res = await runQuery(q);
        useEditorStore.getState().setLastResult(res);
        setImportNotice(`Archivo "${file.name}" importado exitosamente en ${selectedCollection}.`);
        setTimeout(() => setImportNotice(null), 3500);
      } catch (err: any) {
        await alertModal({
          title: 'Error al importar archivo JSON',
          message: err.message || 'El archivo seleccionado no contiene un formato JSON válido.',
          variant: 'danger',
        });
      }
    };
    reader.onerror = async () => {
      await alertModal({
        title: 'Error de lectura',
        message: 'No fue posible leer el archivo seleccionado desde el disco.',
        variant: 'danger',
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save new row to MongoDB database
  const handleSaveNewRow = async () => {
    try {
      const docToInsert: Record<string, any> = { ...newRowData };
      const idType = currentSchema?.idType || 'objectId';

      if (!docToInsert._id) {
        if (idType === 'manual') {
          await alertModal({
            title: 'Clave primaria requerida',
            message: 'Esta colección requiere asignar un valor manual para el _id.',
            variant: 'warning',
          });
          return;
        }
        if (idType === 'uuid') {
          docToInsert._id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'uuid-' + Math.random().toString(36).slice(2, 11);
        } else if (idType === 'incremental') {
          const numericIds = (currentCollectionObj?.documents || [])
            .map((d) => Number(d._id))
            .filter((n) => !isNaN(n) && isFinite(n));
          docToInsert._id = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
        } else {
          docToInsert._id = generateObjectId();
        }
      }

      const schemaCols = currentSchema?.columns || [];

      // Parse types based on schema or heuristics
      allColumns.forEach((col) => {
        if (col === '_id') return;
        const val = docToInsert[col];
        const colDef = schemaCols.find((c) => c.name === col);

        if (colDef) {
          if (colDef.type === 'number') {
            docToInsert[col] = (val === '' || val === undefined || isNaN(Number(val))) ? 0 : Number(val);
          } else if (colDef.type === 'boolean') {
            docToInsert[col] = val === true || val === 'true';
          } else if (colDef.type === 'array') {
            try {
              docToInsert[col] = typeof val === 'string' ? JSON.parse(val) : (Array.isArray(val) ? val : []);
            } catch {
              docToInsert[col] = typeof val === 'string' ? val.split(',').map((s: string) => s.trim()) : [];
            }
          } else if (colDef.type === 'object') {
            try {
              docToInsert[col] = typeof val === 'string' ? JSON.parse(val) : (val || {});
            } catch {
              docToInsert[col] = {};
            }
          } else {
            docToInsert[col] = val ?? '';
          }
        } else {
          if (val === 'true') docToInsert[col] = true;
          if (val === 'false') docToInsert[col] = false;
          if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)) && !isNaN(parseFloat(val))) {
            const sample = data[0]?.[col];
            if (typeof sample === 'number') {
              docToInsert[col] = Number(val);
            }
          }
        }
      });

      await insertDocument(selectedCollection, docToInsert);
      setIsInserting(false);
      setNewRowData({});
      setCurrentPage(0);
      setFilterText('');

      // Visual feedback
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error al insertar fila:', err);
      await alertModal({
        title: 'Error al insertar fila',
        message: err.message || 'No fue posible insertar el documento en la base de datos.',
        variant: 'danger',
      });
    }
  };

  // Delete row (Supabase style)
  const handleDeleteRow = async (id: string) => {
    const ok = await confirmModal({
      title: 'Eliminar fila',
      message: `¿Estás seguro de que deseas eliminar la fila con _id "${id}"? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar fila',
      cancelText: 'Cancelar',
      variant: 'danger',
    });
    if (ok) {
      await deleteDocument(selectedCollection, id);
    }
  };

  // Start cell editing
  const handleStartEditCell = (id: string, col: string, currentVal: any) => {
    if (col === '_id') return; // Primary key read-only inline
    setEditingCell({ id, col });
    setEditValue(currentVal === null || currentVal === undefined ? '' : String(currentVal));
  };

  // Save cell edit
  const handleSaveCell = async (id: string, col: string) => {
    if (!editingCell) return;
    const doc = data.find((d) => d._id === id);
    let parsed: any = editValue;

    if (doc) {
      const original = doc[col];
      if (typeof original === 'number') {
        parsed = isNaN(Number(editValue)) ? 0 : Number(editValue);
      } else if (typeof original === 'boolean') {
        parsed = editValue.toLowerCase() === 'true';
      }
    }

    await updateDocument(selectedCollection, id, { [col]: parsed });
    setEditingCell(null);
  };

  const renderCell = (val: any, col?: string) => {
    if (val === null) return <span className="text-neutral-600">null</span>;
    if (val === undefined) return <span className="text-neutral-700">-</span>;
    if (col === 'colección') {
      return (
        <div className="flex items-center gap-1.5 font-mono">
          <Database className="w-3.5 h-3.5 text-[#00ED64] shrink-0" />
          <span className="text-neutral-200 font-semibold">{String(val)}</span>
        </div>
      );
    }
    if (col === '_id') {
      return (
        <span className="font-mono text-neutral-400 text-xs block select-all" title={String(val)}>
          {String(val)}
        </span>
      );
    }
    if (typeof val === 'object') {
      return (
        <span className="font-mono text-neutral-400 truncate max-w-xs block" title={JSON.stringify(val)}>
          {Array.isArray(val) ? `[ ${val.length} items ]` : `{ ... }`}
        </span>
      );
    }
    if (typeof val === 'boolean') {
      return (
        <span
          className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
            val ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-900 text-neutral-500'
          }`}
        >
          {String(val)}
        </span>
      );
    }
    if (typeof val === 'number') {
      return <span className="text-neutral-300 font-mono">{val.toLocaleString('es-CO')}</span>;
    }
    return <span className="truncate max-w-xs block text-neutral-200">{String(val)}</span>;
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden select-none bg-neutral-950">
      {/* Quick Filter & Action Bar (Supabase style) */}
      <div className="h-9 px-2 sm:px-3 border-b border-neutral-800 bg-neutral-950/90 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-1 max-w-xs px-2 py-1 rounded bg-neutral-900/80 border border-neutral-800 min-w-[90px]">
            <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(0);
              }}
              placeholder={isReadOnly ? 'Buscar en resultados...' : `Buscar en ${selectedCollection}...`}
              className="w-full bg-transparent text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none font-mono"
            />
          </div>

          {/* Supabase-style "Insert row" action buttons in the table toolbar (only when managing collection directly) */}
          {!isReadOnly && (
            isInserting ? (
              <div className="flex items-center gap-1.5 animate-fadeIn shrink-0">
                <button
                  type="button"
                  onClick={handleSaveNewRow}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded bg-[#00ED64] hover:bg-[#00ED64]/90 text-neutral-950 font-bold text-xs shadow transition-all cursor-pointer"
                  title="Guardar fila en la colección (Enter)"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="hidden sm:inline">Guardar fila</span>
                  <span className="sm:hidden">Guardar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInserting(false)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs border border-neutral-700 transition-colors cursor-pointer"
                  title="Cancelar (Escape)"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cancelar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={handleStartInsert}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer shrink-0"
                  title="Agregar una nueva fila a la colección (estilo Supabase)"
                >
                  <Plus className="w-3.5 h-3.5 text-[#00ED64] shrink-0" />
                  <span className="hidden sm:inline">Insertar fila</span>
                  <span className="sm:hidden text-[11px]">Insertar</span>
                </button>

                <input
                  ref={uploadFileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleUploadJsonFile}
                  className="hidden"
                />
                <button
                  onClick={() => uploadFileInputRef.current?.click()}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer shrink-0"
                  title="Subir archivo .json directamente a esta colección"
                >
                  <Upload className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="hidden sm:inline">Subir JSON</span>
                  <span className="sm:hidden text-[11px]">Subir</span>
                </button>
              </div>
            )
          )}
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-neutral-500 shrink-0">
          <span>{allColumns.length} columnas</span>
          <span>{sortedData.length} registros</span>
        </div>
      </div>

      {/* Success feedback notifications */}
      {saveSuccess && (
        <div className="h-7 px-3 bg-emerald-950/50 border-b border-[#00ED64]/40 text-[#00ED64] text-xs font-mono flex items-center gap-2 animate-fadeIn shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Fila guardada exitosamente en la colección {selectedCollection}</span>
        </div>
      )}
      {importNotice && (
        <div className="h-7 px-3 bg-emerald-950/50 border-b border-[#00ED64]/40 text-[#00ED64] text-xs font-mono flex items-center gap-2 animate-fadeIn shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{importNotice}</span>
        </div>
      )}

      {/* Table Data */}
      <div className="flex-1 overflow-auto bg-neutral-950">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="sticky top-0 bg-neutral-950 border-b border-neutral-800 z-10">
            <tr>
              <th
                className={`px-2 py-2 text-neutral-500 font-mono border-r border-neutral-800/60 bg-neutral-950 text-center text-[11px] select-none ${
                  isInserting ? 'w-36 min-w-[140px]' : 'w-10'
                }`}
              >
                {isInserting ? 'Acción' : '#'}
              </th>
              {allColumns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-3 py-2 text-neutral-300 font-mono font-medium text-xs border-r border-neutral-800/60 last:border-r-0 whitespace-nowrap cursor-pointer hover:bg-neutral-900 bg-neutral-950 transition-colors select-none"
                  title={`Ordenar por "${col}"`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={sortCol === col ? 'text-[#00ED64] font-bold' : 'text-neutral-200'}>{col}</span>
                    <ArrowUpDown className={`w-3 h-3 ${sortCol === col ? 'text-[#00ED64]' : 'opacity-30 text-neutral-400'}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/40">
            {/* Draft New Row (when inserting directly into the table) */}
            {isInserting && (
              <tr className="bg-neutral-900/90 border-b-2 border-[#00ED64]/70">
                <td className="px-2 py-1.5 text-center border-r border-neutral-800/40 bg-neutral-900">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSaveNewRow}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00ED64] hover:bg-[#00ED64]/90 text-neutral-950 font-bold text-[11px] shadow transition-colors cursor-pointer"
                      title="Guardar fila (Enter)"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Guardar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInserting(false)}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] border border-neutral-700 transition-colors cursor-pointer"
                      title="Cancelar (Escape)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                {allColumns.map((col, idx) => {
                  const colDef = currentSchema?.columns?.find((c) => c.name === col);
                  const isNum = colDef ? colDef.type === 'number' : typeof data[0]?.[col] === 'number';
                  const isBool = colDef ? colDef.type === 'boolean' : typeof data[0]?.[col] === 'boolean';
                  const isDate = colDef?.type === 'date';
                  const isArr = colDef?.type === 'array';
                  const isObj = colDef?.type === 'object';
                  const isId = col === '_id';
                  const isManualId = isId && currentSchema?.idType === 'manual';

                  return (
                    <td key={col} className="px-2 py-1.5 border-r border-neutral-800/40 last:border-r-0">
                      {isId ? (
                        isManualId ? (
                          <input
                            type="text"
                            placeholder="Escribir _id..."
                            value={newRowData._id ?? ''}
                            onChange={(e) => setNewRowData({ ...newRowData, _id: e.target.value })}
                            className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100 font-mono focus:border-[#00ED64] focus:outline-none"
                            autoFocus={idx === 0}
                          />
                        ) : (
                          <span className="font-mono text-neutral-400 text-xs block truncate" title={newRowData._id}>
                            {newRowData._id}
                          </span>
                        )
                      ) : isBool ? (
                        <select
                          value={String(newRowData[col] ?? true)}
                          onChange={(e) =>
                            setNewRowData({ ...newRowData, [col]: e.target.value === 'true' })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveNewRow();
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              setIsInserting(false);
                            }
                          }}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 font-mono focus:border-[#00ED64] focus:outline-none"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : (
                        <input
                          type={isNum ? 'number' : isDate ? 'date' : 'text'}
                          autoFocus={idx === 1}
                          placeholder={
                            isArr
                              ? "['item1', 'item2']"
                              : isObj
                              ? "{'campo': 'valor'}"
                              : `Escribir ${col}...`
                          }
                          value={newRowData[col] ?? ''}
                          onChange={(e) =>
                            setNewRowData({ ...newRowData, [col]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveNewRow();
                            }
                            if (e.key === 'Escape') {
                              e.preventDefault();
                              setIsInserting(false);
                            }
                          }}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-100 font-mono focus:border-[#00ED64] focus:outline-none placeholder-neutral-600"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            )}

            {/* Existing Rows */}
            {pageData.map((doc, rIdx) => {
              const rowNum = currentPage * pageSize + rIdx + 1;
              const rowKey = isPrimitiveArray ? `prim-${rIdx}-${String(doc)}` : doc?._id || `row-${rIdx}`;
              return (
                <tr key={rowKey} className="group hover:bg-neutral-900/60 transition-colors">
                  <td className="px-2 py-1.5 text-center border-r border-neutral-800/40 relative">
                    <span className={!isReadOnly ? 'group-hover:hidden text-neutral-600 text-[10px]' : 'text-neutral-600 text-[10px]'}>
                      {rowNum}
                    </span>
                    {!isReadOnly && (
                      <button
                        onClick={() => handleDeleteRow(doc?._id)}
                        className="hidden group-hover:inline-flex items-center justify-center p-0.5 rounded hover:bg-neutral-800 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Eliminar fila"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </td>
                  {allColumns.map((col) => {
                    const cellVal = isPrimitiveArray ? doc : doc?.[col];
                    const isCellEditing = !isReadOnly && editingCell?.id === doc?._id && editingCell?.col === col;
                    return (
                      <td
                        key={col}
                        onDoubleClick={() => !isReadOnly && handleStartEditCell(doc?._id, col, cellVal)}
                        className={`px-3 py-1.5 border-r border-neutral-800/40 last:border-r-0 whitespace-nowrap text-neutral-300 relative group/cell ${
                          !isReadOnly && col !== '_id' ? 'cursor-text' : ''
                        }`}
                        title={!isReadOnly && col !== '_id' ? 'Doble clic para editar' : undefined}
                      >
                        {isCellEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              ref={editInputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveCell(doc._id, col)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveCell(doc._id, col);
                                if (e.key === 'Escape') setEditingCell(null);
                              }}
                              className="w-full bg-neutral-950 border border-[#00ED64] rounded px-1 py-0.5 text-xs text-neutral-100 font-mono outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span>{renderCell(cellVal, col)}</span>
                            {!isReadOnly && col !== '_id' && (
                              <button
                                onClick={() => handleStartEditCell(doc?._id, col, cellVal)}
                                className="opacity-0 group-hover/cell:opacity-100 text-neutral-600 hover:text-neutral-300 p-0.5 transition-opacity"
                                title="Editar celda"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty State or "+ Insertar fila" button at the bottom of the table (Supabase/Airtable style) */}
        {!isInserting && !isReadOnly && (
          <button
            onClick={handleStartInsert}
            className="w-full py-2 px-4 flex items-center justify-start gap-2 text-xs font-mono text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/40 border-b border-neutral-800/40 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#00ED64]" />
            <span>Insertar nueva fila...</span>
          </button>
        )}

        {data.length === 0 && !isInserting && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-neutral-500 font-mono">
            <Database className="w-8 h-8 mb-2 text-neutral-700" />
            <p>{isReadOnly ? 'La consulta no retornó resultados.' : 'La colección está vacía.'}</p>
            {!isReadOnly && (
              <button
                onClick={handleStartInsert}
                className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-[#00ED64]" />
                <span>Insertar primer documento</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="h-8 px-2 sm:px-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0">
        <div className="truncate max-w-[150px] sm:max-w-none">
          <span className="hidden sm:inline">Mostrando </span>
          {pageData.length} de {sortedData.length} <span className="hidden sm:inline">documentos</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span>
            {currentPage + 1} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-1 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent text-neutral-300 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
