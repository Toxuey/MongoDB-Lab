import React, { useState, useMemo } from 'react';
import {
  Search,
  Copy,
  Check,
  Terminal,
  Filter,
  Database,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { MONGO_EXAMPLES } from '../../data/examples';
import { MongoCodeHighlight } from '../../components/ui/MongoCodeHighlight';

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'find', label: 'Consultas' },
  { id: 'filter', label: 'Filtros' },
  { id: 'insert', label: 'Insertar' },
  { id: 'update', label: 'Actualizar' },
  { id: 'delete', label: 'Borrar' },
  { id: 'aggregate', label: 'Agregaciones' },
  { id: 'collections', label: 'Colecciones' },
];

export const ExamplesView: React.FC = () => {
  const { setCode, setActiveTab } = useEditorStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColFilter, setSelectedColFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');

  // Filtrado reactivo de ejemplos
  const filteredExamples = useMemo(() => {
    return MONGO_EXAMPLES.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchCollection = selectedColFilter === 'all' || item.collection === selectedColFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.tags.some((t) => t.toLowerCase().includes(term));

      return matchCategory && matchCollection && matchSearch;
    });
  }, [searchTerm, selectedCategory, selectedColFilter]);

  const handleCopy = (e: React.MouseEvent, id: string, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleLoadIntoConsole = (code: string) => {
    setCode(code);
    setActiveTab('editor');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-950 overflow-hidden select-none">
      {/* Top Controls: Barra limpia y minimalista */}
      <div className="px-4 py-2.5 border-b border-neutral-800/80 bg-neutral-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por método, operador ($gte, $or), campo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-md pl-8 pr-7 py-1 text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#00ED64] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-0.5 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Center & Right: Category & Collection Filters */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none">
          {/* Collection Filter */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
            <Database className="w-3 h-3 text-neutral-500 shrink-0" />
            <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5">
              {['all', 'usuarios', 'peliculas', 'productos'].map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColFilter(col)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    selectedColFilter === col
                      ? 'bg-neutral-800 text-[#00ED64] font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {col === 'all' ? 'Todas' : col}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Mode Toggle: 1 Columna (Lista proporcional) vs 2 Columnas (Cuadrícula) */}
          <div className="hidden md:flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5 shrink-0">
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                layoutMode === 'list' ? 'bg-neutral-800 text-[#00ED64]' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Vista lista (1 columna proporcional)"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                layoutMode === 'grid' ? 'bg-neutral-800 text-[#00ED64]' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Vista cuadrícula (2 columnas)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[11px] font-mono text-neutral-500 shrink-0">
            {filteredExamples.length} {filteredExamples.length === 1 ? 'ejemplo' : 'ejemplos'}
          </span>
        </div>
      </div>

      {/* Category Pills Bar: Compacta y sutil */}
      <div className="px-4 py-1.5 border-b border-neutral-800/60 bg-neutral-900/40 flex items-center gap-1.5 overflow-x-auto scrollbar-thin shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-[#00ED64] text-neutral-950 font-semibold shadow-xs'
                : 'bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content Area: Tarjetas proporcionadas sin espacios vacíos */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-neutral-950">
        {filteredExamples.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Filter className="w-8 h-8 text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-400">No se encontraron ejemplos coincidentes</p>
            <p className="text-xs text-neutral-600 mt-1">Prueba con otra búsqueda o selecciona otra categoría.</p>
          </div>
        ) : (
          <div
            className={
              layoutMode === 'list'
                ? 'max-w-4xl mx-auto space-y-4'
                : 'grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto'
            }
          >
            {filteredExamples.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-neutral-900/60 hover:bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 rounded-xl p-4 transition-all duration-150 flex flex-col h-full shadow-sm"
                >
                  {/* Card Header: Eyebrow, Badges & Typography */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-400 font-medium">
                        {item.categoryLabel}
                      </span>
                      {item.collection !== 'general' ? (
                        <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-medium">
                          db.{item.collection}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-800/60 text-neutral-400 border border-neutral-700/40">
                          db
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors leading-snug mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Body: Code Block con flex-grow: 1, min-height y max-height con scroll suave */}
                  <div className="flex-1 flex flex-col min-h-[110px] relative group/code bg-[#080808] border border-neutral-800/90 rounded-lg overflow-hidden">
                    {/* Botón copiar minimalista solo icono */}
                    <button
                      onClick={(e) => handleCopy(e, item.id, item.code)}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/60 text-neutral-400 hover:text-neutral-100 transition-all cursor-pointer shadow-sm opacity-80 group-hover/code:opacity-100"
                      title={isCopied ? '¡Copiado!' : 'Copiar código al portapapeles'}
                      aria-label="Copiar código"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#00ED64]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Contenido con resaltado de sintaxis y scroll si excede la altura máxima */}
                    <div className="flex-1 p-3 font-mono text-xs overflow-y-auto max-h-[180px] scrollbar-thin overflow-x-auto whitespace-pre leading-relaxed pr-9">
                      <MongoCodeHighlight code={item.code} />
                    </div>
                  </div>

                  {/* Card Footer: Botón de acción con estilo outline elegante anclado abajo */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
                      {item.tags?.[0] ? `#${item.tags[0]}` : ''}
                    </span>

                    <button
                      onClick={() => handleLoadIntoConsole(item.code)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#00ED64]/10 hover:bg-[#00ED64]/20 border border-[#00ED64]/30 hover:border-[#00ED64]/60 text-[#00ED64] text-xs font-mono font-medium transition-all shadow-xs cursor-pointer active:scale-95 ml-auto"
                      title="Cargar y abrir en la consola"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Probar en consola</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
