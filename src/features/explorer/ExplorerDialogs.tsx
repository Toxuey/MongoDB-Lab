import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Key,
  Sparkles,
  Database,
  Type,
  Hash,
  ToggleLeft,
  Calendar,
  List,
  Layers,
} from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import {
  ColumnDefinition,
  ColumnType,
  CollectionSchema,
  IdTypeOption,
  MongoDocument,
} from '../../types/mongo';
import { generateObjectId } from '../../utils/objectId';

interface CreateColDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    options?: { schema?: CollectionSchema; initialDocuments?: MongoDocument[] }
  ) => Promise<void>;
  existingCollections?: string[];
}

const COLUMN_TYPES: { type: ColumnType; label: string; icon: React.FC<{ className?: string }> }[] = [
  { type: 'string', label: 'Texto (String)', icon: Type },
  { type: 'number', label: 'Número (Number)', icon: Hash },
  { type: 'boolean', label: 'Booleano (Boolean)', icon: ToggleLeft },
  { type: 'date', label: 'Fecha (Date)', icon: Calendar },
  { type: 'array', label: 'Lista (Array)', icon: List },
  { type: 'object', label: 'Objeto (Object)', icon: Layers },
];

export const CreateColDialog: React.FC<CreateColDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingCollections = [],
}) => {
  const [name, setName] = useState('');
  const [idType, setIdType] = useState<IdTypeOption>('objectId');
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    { name: 'nombre', type: 'string', defaultValue: '', required: true },
    { name: 'activo', type: 'boolean', defaultValue: 'true', required: false },
  ]);
  const [createSampleDoc, setCreateSampleDoc] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const columnsListRef = useRef<HTMLDivElement>(null);

  // Column helpers
  const handleAddColumn = () => {
    const newColIndex = columns.length + 1;
    setColumns((prev) => [
      ...prev,
      { name: `campo_${newColIndex}`, type: 'string', defaultValue: '', required: false },
    ]);
    setTimeout(() => {
      if (columnsListRef.current) {
        columnsListRef.current.scrollTop = columnsListRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleUpdateColumn = (index: number, updates: Partial<ColumnDefinition>) => {
    setColumns((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleRemoveColumn = (index: number) => {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  };

  // Preset templates
  const applyPreset = (preset: 'basic' | 'ecommerce' | 'blog' | 'empty') => {
    if (preset === 'basic') {
      setColumns([
        { name: 'nombre', type: 'string', defaultValue: '', required: true },
        { name: 'email', type: 'string', defaultValue: '', required: false },
        { name: 'activo', type: 'boolean', defaultValue: 'true', required: false },
      ]);
    } else if (preset === 'ecommerce') {
      setColumns([
        { name: 'nombre', type: 'string', defaultValue: '', required: true },
        { name: 'categoria', type: 'string', defaultValue: 'General', required: false },
        { name: 'precio', type: 'number', defaultValue: '0', required: true },
        { name: 'stock', type: 'number', defaultValue: '10', required: false },
        { name: 'disponible', type: 'boolean', defaultValue: 'true', required: false },
      ]);
    } else if (preset === 'blog') {
      setColumns([
        { name: 'titulo', type: 'string', defaultValue: '', required: true },
        { name: 'contenido', type: 'string', defaultValue: '', required: false },
        { name: 'autor', type: 'string', defaultValue: 'Admin', required: false },
        { name: 'fecha', type: 'date', defaultValue: '', required: false },
        { name: 'publicado', type: 'boolean', defaultValue: 'true', required: false },
      ]);
    } else if (preset === 'empty') {
      setColumns([]);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!trimmedName) {
      setError('Por favor asigna un nombre para la colección.');
      return;
    }

    if (existingCollections.includes(trimmedName)) {
      setError(`La colección '${trimmedName}' ya existe. Elige otro nombre.`);
      return;
    }

    // Validar nombres de columnas
    const colNames = new Set<string>();
    for (const col of columns) {
      const cName = col.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (!cName) {
        setError('Todas las columnas deben tener un nombre válido.');
        return;
      }
      if (cName === '_id') {
        setError('La columna _id es gestionada automáticamente como clave primaria.');
        return;
      }
      if (colNames.has(cName)) {
        setError(`El nombre de columna '${cName}' está duplicado.`);
        return;
      }
      colNames.add(cName);
    }

    setIsSubmitting(true);
    try {
      // Normalizar columnas
      const sanitizedColumns: ColumnDefinition[] = columns.map((c) => ({
        ...c,
        name: c.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      }));

      const schema: CollectionSchema = {
        idType,
        columns: sanitizedColumns,
      };

      // Si el usuario quiere documento inicial de ejemplo
      let initialDocuments: MongoDocument[] | undefined = undefined;
      if (createSampleDoc) {
        let sampleId: any = '';
        if (idType === 'objectId') {
          sampleId = generateObjectId();
        } else if (idType === 'uuid') {
          sampleId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'sample-uuid-1';
        } else if (idType === 'incremental') {
          sampleId = 1;
        } else {
          sampleId = 'id_inicial_1';
        }

        const sampleDoc: MongoDocument = { _id: sampleId };
        sanitizedColumns.forEach((c) => {
          if (c.defaultValue !== undefined && c.defaultValue !== '') {
            if (c.type === 'number') sampleDoc[c.name] = Number(c.defaultValue) || 0;
            else if (c.type === 'boolean') sampleDoc[c.name] = c.defaultValue === 'true';
            else sampleDoc[c.name] = c.defaultValue;
          } else {
            if (c.type === 'string') sampleDoc[c.name] = `Ejemplo ${c.name}`;
            else if (c.type === 'number') sampleDoc[c.name] = 100;
            else if (c.type === 'boolean') sampleDoc[c.name] = true;
            else if (c.type === 'date') sampleDoc[c.name] = new Date().toISOString().split('T')[0];
            else if (c.type === 'array') sampleDoc[c.name] = ['elemento_1', 'elemento_2'];
            else if (c.type === 'object') sampleDoc[c.name] = { estado: 'activo' };
          }
        });
        initialDocuments = [sampleDoc];
      }

      await onSubmit(trimmedName, { schema, initialDocuments });
      setName('');
      setColumns([
        { name: 'nombre', type: 'string', defaultValue: '', required: true },
        { name: 'activo', type: 'boolean', defaultValue: 'true', required: false },
      ]);
      setError('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la colección.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Crear nueva colección"
      description="Configura el nombre, la clave primaria (_id) y las columnas iniciales estilo Supabase."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleConfirm} className="space-y-5">
        {/* 1. Nombre de la colección */}
        <div className="space-y-1.5">
          <Input
            label="Nombre de la colección"
            placeholder="ej. clientes, transacciones, inventario..."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            error={error}
            autoFocus
          />
        </div>

        {/* 2. Configuración de Clave Primaria (_id) */}
        <div className="bg-neutral-950/70 border border-neutral-800 rounded-lg p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-[#00ED64]" />
              <span className="text-xs font-semibold text-neutral-200">
                Clave Primaria (<code className="text-[#00ED64]">_id</code>)
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {idType === 'objectId' && '24-hex ObjectId con timestamp'}
              {idType === 'uuid' && 'UUIDv4 aleatorio'}
              {idType === 'incremental' && 'Secuencia 1, 2, 3...'}
              {idType === 'manual' && 'Ingreso manual por fila'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              {
                id: 'objectId' as IdTypeOption,
                title: 'ObjectId (Recomendado)',
                desc: 'Estándar nativo MongoDB',
              },
              {
                id: 'uuid' as IdTypeOption,
                title: 'UUIDv4',
                desc: 'Identificador único universal',
              },
              {
                id: 'incremental' as IdTypeOption,
                title: 'Auto-incremental',
                desc: 'Numérico (1, 2, 3...)',
              },
              {
                id: 'manual' as IdTypeOption,
                title: 'Manual',
                desc: 'Tú asignas el _id',
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setIdType(opt.id)}
                className={`p-2 text-left rounded border transition-all cursor-pointer ${
                  idType === opt.id
                    ? 'bg-[#00ED64]/10 border-[#00ED64] text-neutral-100 shadow-[0_0_12px_rgba(0,237,100,0.15)]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="text-[11px] font-medium leading-tight">{opt.title}</div>
                <div className="text-[9px] text-neutral-500 truncate mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Definición de Columnas (Schema Builder tipo Supabase) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-200">
                Columnas / Campos del Documento
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">({columns.length})</span>
            </div>

            {/* Plantillas rápidas */}
            <div className="flex flex-wrap items-center gap-1 text-[10px]">
              <span className="text-neutral-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00ED64]" />
                <span className="hidden xs:inline">Plantillas:</span>
              </span>
              <button
                type="button"
                onClick={() => applyPreset('basic')}
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              >
                Básica
              </button>
              <button
                type="button"
                onClick={() => applyPreset('ecommerce')}
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              >
                Tienda
              </button>
              <button
                type="button"
                onClick={() => applyPreset('blog')}
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              >
                Blog
              </button>
              <button
                type="button"
                onClick={() => applyPreset('empty')}
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 transition-colors cursor-pointer"
              >
                Limpia
              </button>
            </div>
          </div>

          {/* Lista de columnas con soporte de scroll horizontal en móviles */}
          <div className="border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950/60 divide-y divide-neutral-800/80">
            <div className="overflow-x-auto">
              <div className="min-w-[460px]">
                {/* Header del schema */}
                <div className="grid grid-cols-12 gap-2 px-3 py-1.5 bg-neutral-900/90 text-[10px] font-mono text-neutral-400 font-semibold">
                  <div className="col-span-4">Nombre de Columna</div>
                  <div className="col-span-4">Tipo de Dato</div>
                  <div className="col-span-3">Valor por Defecto</div>
                  <div className="col-span-1 text-center">Acción</div>
                </div>

                {/* Fila fija de clave primaria _id */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 items-center bg-neutral-900/30 text-xs font-mono">
              <div className="col-span-4 flex items-center gap-1.5 text-neutral-300">
                <Key className="w-3 h-3 text-[#00ED64] shrink-0" />
                <span className="font-bold text-[#00ED64]">_id</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#00ED64]/10 text-[#00ED64] border border-[#00ED64]/20">
                  PK
                </span>
              </div>
              <div className="col-span-4 text-neutral-400 text-[11px]">
                {idType === 'objectId' && 'ObjectId'}
                {idType === 'uuid' && 'UUID (String)'}
                {idType === 'incremental' && 'Integer (Number)'}
                {idType === 'manual' && 'Cualquiera (Manual)'}
              </div>
              <div className="col-span-3 text-neutral-500 text-[11px] italic">
                {idType === 'manual' ? 'Requerido' : 'Autogenerado'}
              </div>
              <div className="col-span-1 text-center text-neutral-600 text-[10px]">—</div>
            </div>

            {/* Filas dinámicas con scroll acotado */}
            <div
              ref={columnsListRef}
              className="max-h-56 overflow-y-auto divide-y divide-neutral-800/80 overscroll-contain"
            >
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 px-3 py-2 items-center text-xs hover:bg-neutral-900/40 transition-colors"
                >
                  {/* Nombre de columna */}
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleUpdateColumn(idx, { name: e.target.value })}
                      placeholder="ej. precio, email..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 font-mono focus:border-[#00ED64] focus:outline-none"
                    />
                  </div>

                  {/* Selector de Tipo */}
                  <div className="col-span-4">
                    <select
                      value={col.type}
                      onChange={(e) =>
                        handleUpdateColumn(idx, { type: e.target.value as ColumnType })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-200 font-mono focus:border-[#00ED64] focus:outline-none"
                    >
                      {COLUMN_TYPES.map((ct) => (
                        <option key={ct.type} value={ct.type}>
                          {ct.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Valor por defecto */}
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={col.defaultValue ?? ''}
                      onChange={(e) => handleUpdateColumn(idx, { defaultValue: e.target.value })}
                      placeholder={
                        col.type === 'number'
                          ? '0'
                          : col.type === 'boolean'
                          ? 'true'
                          : col.type === 'array'
                          ? '[]'
                          : 'Opcional'
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 font-mono focus:border-[#00ED64] focus:outline-none placeholder-neutral-600"
                    />
                  </div>

                  {/* Botón Eliminar */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(idx)}
                      className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Eliminar columna"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {columns.length === 0 && (
                <div className="py-6 text-center text-xs text-neutral-500 font-mono">
                  Sin columnas adicionales. Agrega una con el botón de abajo o selecciona una plantilla.
                </div>
              )}
            </div>
          </div>
        </div>

            {/* Botón Agregar Columna */}
            <div className="p-2 bg-neutral-900/30">
              <button
                type="button"
                onClick={handleAddColumn}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-dashed border-neutral-800 hover:border-[#00ED64]/50 hover:bg-[#00ED64]/5 text-xs text-neutral-400 hover:text-[#00ED64] transition-all cursor-pointer font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar nueva columna</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Checkbox de Documento Inicial de Ejemplo */}
        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={createSampleDoc}
              onChange={(e) => setCreateSampleDoc(e.target.checked)}
              className="rounded bg-neutral-900 border-neutral-700 text-[#00ED64] focus:ring-[#00ED64] cursor-pointer"
            />
            <span>Insertar 1 documento de ejemplo inicial con estas columnas</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <div className="text-[11px] text-neutral-500 font-mono">
            {columns.length + 1} columnas totales definidas
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded bg-[#00ED64] text-neutral-950 font-bold hover:bg-[#00ED64]/90 transition-colors cursor-pointer shadow disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Crear Colección</span>
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );
};

export interface ImportNewCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCollection: (collectionName: string, jsonString: string) => Promise<void>;
  existingCollections?: string[];
}

export const ImportNewCollectionDialog: React.FC<ImportNewCollectionDialogProps> = ({
  isOpen,
  onClose,
  onImportCollection,
  existingCollections = [],
}) => {
  const [name, setName] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Sugerir nombre de la colección a partir del archivo si aún no se escribió uno
    if (!name.trim()) {
      const suggestedName = file.name
        .replace(/\.json$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');
      setName(suggestedName);
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setJsonText(content);
      setError('');
      try {
        const parsed = JSON.parse(content);
        const count = Array.isArray(parsed) ? parsed.length : 1;
        setFileInfo(`Archivo "${file.name}" cargado (${count} documento${count === 1 ? '' : 's'}).`);
      } catch {
        setFileInfo(`Archivo "${file.name}" cargado.`);
      }
    };
    reader.onerror = () => {
      setError('Error al leer el archivo seleccionado.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const trimmedName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (!trimmedName) {
        setError('Por favor asigna un nombre para la nueva colección.');
        return;
      }
      if (existingCollections.includes(trimmedName)) {
        setError(`La colección '${trimmedName}' ya existe. Elige otro nombre.`);
        return;
      }
      if (!jsonText.trim()) {
        setError('Por favor pega un JSON o sube un archivo .json con los datos.');
        return;
      }

      await onImportCollection(trimmedName, jsonText);
      setName('');
      setJsonText('');
      setError('');
      setFileInfo(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'JSON inválido o error al crear la colección.');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Crear e Importar Colección"
      description="Define el nombre de la nueva colección y sube o pega su contenido JSON."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleImport} className="space-y-3.5">
        <div>
          <label className="block text-xs font-mono text-neutral-300 mb-1">
            Nombre de la nueva colección
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="ej. jugadores, equipos, partidos..."
            className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#00ED64]"
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono text-neutral-300">
              Datos JSON (subir archivo o pegar)
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-mono text-[#00ED64] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              <span>Elegir archivo .json</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setFileInfo(null);
              setError('');
            }}
            placeholder='[ { "nombre": "Ejemplo", "ciudad": "Bogotá" } ]'
            className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded font-mono text-xs text-neutral-200 focus:outline-none focus:border-[#00ED64]"
          />
        </div>

        {fileInfo && <p className="text-xs text-neutral-400 font-mono">✓ {fileInfo}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 items-center pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer"
            title="Seleccionar archivo .json del equipo"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-400" />
            <span>Subir JSON</span>
          </button>
          <button
            type="submit"
            className="px-3.5 py-1.5 text-xs rounded bg-[#00ED64] text-neutral-950 font-semibold hover:bg-[#00ED64]/90 transition-colors cursor-pointer shadow"
          >
            Crear Colección
          </button>
        </div>
      </form>
    </Dialog>
  );
};
