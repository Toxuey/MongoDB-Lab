import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] flex flex-col bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl p-4 sm:p-6 text-neutral-200 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-neutral-100">{title}</h3>
            {description && (
              <p className="text-xs text-neutral-400 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto min-h-0 flex-1 pr-1">{children}</div>
      </div>
    </div>
  );
};
