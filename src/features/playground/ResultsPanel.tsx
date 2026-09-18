import React, { useState } from 'react';
import { Table, Code2, Copy, Check, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { ResultsTable } from './ResultsTable';
import { ResultsJson } from './ResultsJson';

export const ResultsPanel: React.FC = () => {
  const { lastResult, resultViewMode, setResultViewMode } = useEditorStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!lastResult?.data) return;
    navigator.clipboard.writeText(JSON.stringify(lastResult.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!lastResult) {
    return (
      <div className="h-full flex items-center justify-center text-xs font-mono text-neutral-500 select-none bg-neutral-950">
        Ejecuta una consulta (Ctrl+Enter) para ver los resultados aquí.
      </div>
    );
  }

  const isArrayData = Array.isArray(lastResult.data);
  const docsCount = isArrayData ? lastResult.data.length : lastResult.data ? 1 : 0;
  const stats = lastResult.stats;

  return (
    <div className="h-full flex flex-col bg-neutral-950 border-t border-neutral-800 overflow-hidden select-none">
      {/* Metrics and Mode Bar */}
      <div className="h-9 px-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950 text-xs shrink-0">
        {/* Left: status and metrics */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {lastResult.success ? (
            <>
              <span className="text-[#00ED64] font-medium">
                {docsCount} {docsCount === 1 ? 'resultado' : 'resultados'}
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400">{stats?.executionTimeMs || 1} ms</span>
              {stats && stats.documentsExamined > 0 && (
                <span className="hidden sm:inline">
                  <span className="text-neutral-600 mr-2">•</span>
                  <span className="text-neutral-500">escaneados: {stats.documentsExamined}</span>
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1 text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Error</span>
            </div>
          )}
        </div>

        {/* Right: View Mode and Copy */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded p-0.5">
            <button
              onClick={() => setResultViewMode('json')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                resultViewMode === 'json' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => setResultViewMode('table')}
              disabled={!isArrayData}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                resultViewMode === 'table' ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              } ${!isArrayData ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <Table className="w-3 h-3" />
              <span>Tabla</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            disabled={!lastResult.data}
            className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-mono text-neutral-300 transition-colors"
            title="Copiar JSON al portapapeles"
          >
            {copied ? <Check className="w-3 h-3 text-[#00ED64]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-hidden">
        {lastResult.error ? (
          <div className="p-4 font-mono text-xs text-red-400 bg-red-950/20 border-l-2 border-red-500 m-3 rounded">
            <div className="font-bold mb-1">Error de ejecución MongoDB:</div>
            <div>{lastResult.error}</div>
          </div>
        ) : resultViewMode === 'table' && isArrayData ? (
          <ResultsTable data={lastResult.data} />
        ) : (
          <ResultsJson data={lastResult.data} />
        )}
      </div>
    </div>
  );
};
