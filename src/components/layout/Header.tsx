import React from 'react';
import {
  Moon,
  Sun,
  Database,
  RotateCcw,
  PanelLeft,
  HelpCircle,
} from 'lucide-react';
import { GithubIcon } from '../ui/icons';
import { useSettingsStore } from '../../store/settingsStore';
import { useDbStore } from '../../store/dbStore';
import { useEditorStore } from '../../store/editorStore';
import { confirmModal } from '../../store/modalStore';

export const Header: React.FC = () => {
  const { theme, toggleTheme, toggleMobileSidebar } = useSettingsStore();
  const { database, resetDatabase } = useDbStore();
  const { setCode, setLastResult, setActiveTab, activeTab } = useEditorStore();

  const handleResetDefaults = async () => {
    const confirmed = await confirmModal({
      title: 'Restablecer valores iniciales',
      message: '¿Deseas restablecer todas las colecciones y datos a sus valores predeterminados? Se perderán las modificaciones no guardadas.',
      confirmText: 'Restablecer',
      cancelText: 'Cancelar',
      variant: 'warning',
    });
    if (!confirmed) return;

    await resetDatabase();
    setLastResult(null);
    setCode('');
    setActiveTab('table');
  };

  return (
    <header className="h-12 border-b border-neutral-800 bg-neutral-950 px-3 sm:px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand, Drawer toggle & Database badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile toggle button for sidebar/drawer */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 -ml-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-[#00ED64] transition-colors cursor-pointer"
          title="Ver Colecciones"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm tracking-tight text-neutral-100">
          <img src="/mongodb-lab.svg" alt="MongoDB Lab Logo" className="w-5 h-5 rounded shrink-0 shadow-sm" />
          <span>MongoDB Lab</span>
        </div>

        <div className="hidden xs:flex sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] sm:text-[11px] font-mono text-neutral-400 max-w-[150px] truncate">
          <Database className="w-3 h-3 text-[#00ED64] shrink-0" />
          <span className="truncate">{database.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ED64] animate-pulse ml-1 shrink-0" />
        </div>
      </div>

      {/* Right actions: Reset, GitHub Repo & Theme Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Botón ? con todos los ejemplos y ejercicios */}
        <button
          onClick={() => setActiveTab('examples')}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded border text-xs font-mono transition-all cursor-pointer active:scale-95 shadow-sm ${
            activeTab === 'examples'
              ? 'bg-[#00ED64] text-neutral-950 font-semibold border-[#00ED64]'
              : 'bg-[#00ED64]/10 hover:bg-[#00ED64]/20 border-[#00ED64]/30 hover:border-[#00ED64]/60 text-[#00ED64]'
          }`}
          title="Ver todos los ejercicios y ejemplos prácticos (?)"
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline font-medium">Ejemplos</span>
          <span className="font-bold sm:hidden">?</span>
        </button>

        <a
          href="https://github.com/Toxuey/MongoDB-Lab"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
          title="Ver repositorio en GitHub (Open Source)"
        >
          <GithubIcon className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
          <span className="hidden md:inline text-[11px]">Open Source</span>
        </a>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer active:scale-95"
          title="Restablecer todas las tablas a valores predeterminados"
        >
          <RotateCcw className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="hidden sm:inline">Restablecer valores</span>
          <span className="sm:hidden text-[11px]">Reset</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
