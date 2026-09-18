import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Edit3,
} from 'lucide-react';
import { useModalStore } from '../../store/modalStore';

export const GlobalModal: React.FC = () => {
  const { isOpen, options, close } = useModalStore();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const [promptVal, setPromptVal] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (options.isPrompt) {
        setPromptVal(options.defaultValue || '');
        setTimeout(() => {
          promptInputRef.current?.focus();
          promptInputRef.current?.select();
        }, 50);
      } else {
        setTimeout(() => {
          confirmButtonRef.current?.focus();
        }, 50);
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (options.isPrompt) {
            close(true, promptVal);
          } else {
            close(true);
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen, options.isPrompt, options.defaultValue, promptVal, close]);

  if (!isOpen) return null;

  const variant = options.variant || (options.isPrompt ? 'info' : 'info');

  // Config based on variant
  const variantConfig = {
    danger: {
      icon: AlertCircle,
      iconContainer: 'bg-red-500/10 text-red-400 border-red-500/25',
      glow: 'shadow-[0_0_50px_-10px_rgba(239,68,68,0.25)] border-red-500/30',
      confirmBtn: 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50 shadow-md',
      tag: 'Acción Destructiva',
      tagClass: 'text-red-400/80 bg-red-950/40 border-red-800/40',
    },
    warning: {
      icon: AlertTriangle,
      iconContainer: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      glow: 'shadow-[0_0_50px_-10px_rgba(245,158,11,0.2)] border-amber-500/30',
      confirmBtn: 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold shadow-md',
      tag: 'Advertencia',
      tagClass: 'text-amber-400/80 bg-amber-950/40 border-amber-800/40',
    },
    info: {
      icon: options.isPrompt ? Edit3 : Info,
      iconContainer: 'bg-[#00ED64]/10 text-[#00ED64] border-[#00ED64]/25',
      glow: 'shadow-[0_0_50px_-10px_rgba(0,237,100,0.18)] border-[#00ED64]/30',
      confirmBtn: 'bg-[#00ED64] hover:bg-[#00ED64]/90 text-neutral-950 font-semibold shadow-md',
      tag: options.isPrompt ? 'Entrada de datos' : 'Confirmación',
      tagClass: 'text-[#00ED64]/80 bg-emerald-950/40 border-emerald-800/40',
    },
    success: {
      icon: CheckCircle2,
      iconContainer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      glow: 'shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)] border-emerald-500/30',
      confirmBtn: 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold shadow-md',
      tag: 'Correcto',
      tagClass: 'text-emerald-400/80 bg-emerald-950/40 border-emerald-800/40',
    },
  }[variant];

  const IconComponent = variantConfig.icon;

  const handleConfirmClick = () => {
    if (options.isPrompt) {
      close(true, promptVal);
    } else {
      close(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => close(false)}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative z-10 w-full max-w-md bg-neutral-900/95 backdrop-blur border rounded-xl p-5 text-neutral-100 animate-in fade-in zoom-in-95 duration-150 select-none ${variantConfig.glow}`}
      >
        {/* Header with icon & close */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${variantConfig.iconContainer}`}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${variantConfig.tagClass}`}>
                {variantConfig.tag}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-neutral-100 leading-snug">
              {options.title}
            </h3>
          </div>

          <button
            onClick={() => close(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/70 transition-colors cursor-pointer"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        {options.message && (
          <div className="mt-3.5 pl-[54px] text-xs text-neutral-300 leading-relaxed font-sans break-words">
            {options.message}
          </div>
        )}

        {/* Prompt input field if isPrompt */}
        {options.isPrompt && (
          <div className="mt-4 pl-[54px]">
            <input
              ref={promptInputRef}
              type="text"
              value={promptVal}
              onChange={(e) => setPromptVal(e.target.value)}
              placeholder={options.placeholder || 'Escribe aquí...'}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#00ED64] transition-colors"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800/80">
          {!options.isAlert && (
            <button
              type="button"
              onClick={() => close(false)}
              className="px-3.5 py-1.5 text-xs font-mono rounded-lg bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 border border-neutral-700/50 transition-colors cursor-pointer active:scale-95"
            >
              {options.cancelText || 'Cancelar'}
            </button>
          )}

          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirmClick}
            className={`px-4 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer active:scale-95 ${variantConfig.confirmBtn}`}
          >
            {options.confirmText || (options.isAlert ? 'Entendido' : 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
};
