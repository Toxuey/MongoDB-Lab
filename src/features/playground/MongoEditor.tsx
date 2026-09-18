import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import { Play, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useDbStore } from '../../store/dbStore';
import { useHistoryStore } from '../../store/historyStore';
import { registerMongoLanguage } from '../../lib/autocomplete/monaco-mongodb';
import { createMongoCompletionProvider } from '../../lib/autocomplete/completion-provider';
import { formatMongoCommand } from '../../lib/formatter/mongo-formatter';

interface MongoEditorProps {
  onRunQuery?: () => void;
}

export const MongoEditor: React.FC<MongoEditorProps> = ({ onRunQuery }) => {
  const { code, setCode, isRunning, setIsRunning, setLastResult } = useEditorStore();
  const { theme, editorFontSize } = useSettingsStore();
  const { database, selectedCollection, runQuery } = useDbStore();
  const { addHistoryItem } = useHistoryStore();
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);

  const handleFormat = () => {
    if (!code.trim()) return;
    const formatted = formatMongoCommand(code);
    setCode(formatted);
  };

  const handleExecute = async () => {
    if (!code.trim() || isRunning) return;

    // Evitar parpadeo en consultas instantáneas locales (<150ms)
    const timer = setTimeout(() => setIsRunning(true), 150);

    try {
      const startTime = performance.now();
      const result = await runQuery(code);
      const duration = Math.max(1, Math.round(performance.now() - startTime));

      setLastResult(result);

      if (onRunQuery) onRunQuery();

      addHistoryItem({
        command: code,
        collection: result.collectionName || selectedCollection,
        operation: result.operation || 'query',
        success: result.success,
        executionTimeMs: result.stats?.executionTimeMs || duration,
      });
    } finally {
      clearTimeout(timer);
      setIsRunning(false);
    }
  };

  const handleBeforeMount: BeforeMount = (monaco) => {
    registerMongoLanguage(monaco);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    monacoRef.current = monaco;
    editorRef.current = editor;
    registerMongoLanguage(monaco);

    // Explicitly apply the dark theme immediately
    monaco.editor.setTheme(theme === 'dark' ? 'mongodb-dark' : 'mongodb-light');

    // Register completion provider
    const completionDisposable = monaco.languages.registerCompletionItemProvider(
      'mongodb',
      createMongoCompletionProvider(monaco, () => database, () => selectedCollection)
    );

    // Shortcut: Ctrl+Enter or Cmd+Enter to execute
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute();
    });

    return () => {
      completionDisposable.dispose();
    };
  };

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'mongodb-dark' : 'mongodb-light');
    }
  }, [theme]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden">
      {/* Editor toolbar */}
      <div className="h-9 px-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950 select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-400">Consola MongoDB</span>
          <span className="text-[10px] text-neutral-600 font-mono hidden sm:inline">Ctrl+Enter para ejecutar</span>
        </div>

        <div className="flex items-center gap-1.5">
          {code.trim() && (
            <>
              <button
                onClick={handleFormat}
                className="p-1 px-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                title="Formatear código (Shift+Alt+F)"
              >
                <Sparkles className="w-3 h-3 text-[#00ED64]" />
                <span className="text-[10px] font-mono">Formatear</span>
              </button>

              <button
                onClick={() => setCode('')}
                className="p-1 px-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                title="Limpiar consola de comandos"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="text-[10px] font-mono">Limpiar</span>
              </button>
            </>
          )}

          <button
            onClick={handleExecute}
            disabled={isRunning}
            className={`min-w-[88px] flex items-center justify-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold transition-all duration-150 cursor-pointer active:scale-95 select-none ${
              isRunning
                ? 'bg-[#00ED64]/80 text-neutral-950 cursor-wait'
                : 'bg-[#00ED64] hover:bg-[#00ED64]/90 text-neutral-950 shadow-sm'
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Ejecutando</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Ejecutar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full overflow-hidden bg-[#0a0a0a]">
        <Editor
          height="100%"
          language="mongodb"
          value={code}
          theme={theme === 'dark' ? 'mongodb-dark' : 'mongodb-light'}
          loading={
            <div className="h-full w-full bg-[#0a0a0a] flex items-center justify-center text-xs font-mono text-neutral-500">
              Cargando consola...
            </div>
          }
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          onChange={(val) => setCode(val || '')}
          options={{
            fontSize: editorFontSize,
            minimap: { enabled: false },
            lineNumbers: 'on',
            fontFamily: "'Fira Code', 'Geist Mono', Consolas, monospace",
            fontLigatures: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            bracketPairColorization: { enabled: true },
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            cursorBlinking: 'smooth',
            lineDecorationsWidth: 4,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
};
