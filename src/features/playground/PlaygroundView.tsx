import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Table, Code2, Copy, Check, GripHorizontal, BookOpen } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useDbStore } from '../../store/dbStore';
import { ResizablePanels } from '../../components/layout/ResizablePanels';
import { ExplorerSidebar } from '../explorer/ExplorerSidebar';
import { MongoEditor } from './MongoEditor';
import { ResultsPanel } from './ResultsPanel';
import { ResultsTable } from './ResultsTable';
import { ResultsJson } from './ResultsJson';
import { ExamplesView } from './ExamplesView';

const STORAGE_EDITOR_HEIGHT_KEY = 'mongolab_playground_editor_height';

export const PlaygroundView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
  } = useEditorStore();

  const { database, selectedCollection } = useDbStore();
  const [editorHeight, setEditorHeight] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_EDITOR_HEIGHT_KEY);
    return saved ? Math.max(80, Number(saved)) : 260;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [collectionViewMode, setCollectionViewMode] = useState<'table' | 'json'>('table');
  const [copiedJson, setCopiedJson] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleResetHeight = () => {
    if (containerRef.current) {
      const balanced = Math.round(containerRef.current.clientHeight * 0.4);
      const clamped = Math.max(120, Math.min(containerRef.current.clientHeight - 120, balanced));
      setEditorHeight(clamped);
      localStorage.setItem(STORAGE_EDITOR_HEIGHT_KEY, String(clamped));
    } else {
      setEditorHeight(260);
      localStorage.setItem(STORAGE_EDITOR_HEIGHT_KEY, '260');
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const minHeight = 80;
      const maxHeight = Math.max(minHeight, rect.height - 100);
      const newHeight = Math.max(minHeight, Math.min(maxHeight, e.clientY - rect.top));
      setEditorHeight(newHeight);
      localStorage.setItem(STORAGE_EDITOR_HEIGHT_KEY, String(Math.round(newHeight)));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const activeColDocs = database.collections[selectedCollection]?.documents || [];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeColDocs, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <ResizablePanels
      left={<ExplorerSidebar />}
      center={
        <div className="h-full flex flex-col bg-neutral-950 overflow-hidden select-none">
          {/* Main Tab Navigation: Colección vs Consola */}
          <div className="h-9 px-3 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'table'
                    ? 'bg-neutral-800 text-[#00ED64]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Colección</span>
              </button>

              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-neutral-800 text-[#00ED64]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Consola</span>
              </button>

              <button
                onClick={() => setActiveTab('examples')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'examples'
                    ? 'bg-neutral-800 text-[#00ED64]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Ejemplos</span>
              </button>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {activeTab === 'table' ? (
                <>
                  {/* Toggle Tabla vs JSON para explorar la colección */}
                  <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5">
                    <button
                      onClick={() => setCollectionViewMode('table')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                        collectionViewMode === 'table'
                          ? 'bg-neutral-800 text-neutral-100 font-semibold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="Ver como tabla interactiva"
                    >
                      <Table className="w-3 h-3" />
                      <span className="hidden xs:inline sm:inline">Tabla</span>
                    </button>
                    <button
                      onClick={() => setCollectionViewMode('json')}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                        collectionViewMode === 'json'
                          ? 'bg-neutral-800 text-neutral-100 font-semibold'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                      title="Ver como formato JSON"
                    >
                      <Code2 className="w-3 h-3" />
                      <span>JSON</span>
                    </button>
                  </div>

                  {collectionViewMode === 'json' && (
                    <button
                      onClick={handleCopyJson}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-mono text-neutral-300 transition-colors cursor-pointer"
                      title="Copiar colección completa en formato JSON"
                    >
                      {copiedJson ? <Check className="w-3 h-3 text-[#00ED64]" /> : <Copy className="w-3 h-3" />}
                      <span className="hidden sm:inline">{copiedJson ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  )}

                  <span className="text-[11px] font-mono text-neutral-500 border-l border-neutral-800 pl-2 sm:pl-3 truncate max-w-[120px] sm:max-w-[200px]">
                    <span className="hidden sm:inline">Colección: </span>
                    <strong className="text-neutral-300 font-normal">{selectedCollection}</strong>
                  </span>
                </>
              ) : activeTab === 'editor' ? (
                <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                  Consola interactiva e independiente
                </span>
              ) : (
                <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                  Catálogo de ejercicios y consultas prácticas
                </span>
              )}
            </div>
          </div>

          {/* Main Workspace Area */}
          {activeTab === 'table' ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
              {collectionViewMode === 'table' ? (
                <ResultsTable data={activeColDocs} />
              ) : (
                <ResultsJson data={activeColDocs} />
              )}
            </div>
          ) : activeTab === 'examples' ? (
            <ExamplesView />
          ) : (
            <div
              ref={containerRef}
              className={`flex-1 flex flex-col overflow-hidden relative ${
                isDragging ? 'cursor-row-resize select-none' : ''
              }`}
            >
              {/* Upper Console (Mongo Editor) */}
              <div
                style={{ height: `${editorHeight}px` }}
                className="shrink-0 overflow-hidden"
              >
                <MongoEditor />
              </div>

              {/* Resizable Divider Handle */}
              <div
                onMouseDown={handleMouseDown}
                onDoubleClick={handleResetHeight}
                title="Arrastrar para redimensionar consola / Doble clic para restablecer"
                className={`group relative h-2.5 -my-0.5 z-20 cursor-row-resize flex items-center justify-center transition-colors shrink-0 select-none ${
                  isDragging
                    ? 'bg-[#00ED64] shadow-[0_0_12px_rgba(0,237,100,0.4)]'
                    : 'bg-neutral-800/90 hover:bg-[#00ED64]/80'
                }`}
              >
                <div
                  className={`h-1.5 px-2.5 rounded-full flex items-center justify-center transition-all ${
                    isDragging
                      ? 'bg-neutral-950 scale-110 shadow-sm'
                      : 'bg-neutral-600 group-hover:bg-neutral-950 group-hover:scale-105'
                  }`}
                >
                  <GripHorizontal
                    className={`w-3.5 h-3.5 transition-colors ${
                      isDragging ? 'text-[#00ED64]' : 'text-neutral-300 group-hover:text-[#00ED64]'
                    }`}
                  />
                </div>
              </div>

              {/* Lower Results Panel (Takes full remaining space) */}
              <div className="flex-1 overflow-hidden">
                <ResultsPanel />
              </div>

              {/* Invisible overlay during drag to prevent Monaco/Table stealing mouse events */}
              {isDragging && (
                <div className="absolute inset-0 z-50 cursor-row-resize select-none bg-transparent" />
              )}
            </div>
          )}
        </div>
      }
      right={null}
    />
  );
};
