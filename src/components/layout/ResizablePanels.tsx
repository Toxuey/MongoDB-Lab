import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

interface ResizablePanelsProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({ left, center, right }) => {
  const {
    leftPanelWidth,
    setLeftPanelWidth,
    rightPanelWidth,
    setRightPanelWidth,
    rightPanelOpen,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useSettingsStore();

  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDownLeft = () => setIsDraggingLeft(true);
  const handleMouseDownRight = () => setIsDraggingRight(true);

  const handleMouseUp = useCallback(() => {
    setIsDraggingLeft(false);
    setIsDraggingRight(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isDraggingLeft) {
        const newWidth = Math.max(200, Math.min(420, e.clientX - rect.left));
        setLeftPanelWidth(newWidth);
      }

      if (isDraggingRight && rightPanelOpen) {
        const newWidth = Math.max(240, Math.min(500, rect.right - e.clientX));
        setRightPanelWidth(newWidth);
      }
    },
    [isDraggingLeft, isDraggingRight, rightPanelOpen, setLeftPanelWidth, setRightPanelWidth]
  );

  useEffect(() => {
    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex w-full h-[calc(100vh-3rem)] overflow-hidden bg-neutral-950 relative ${
        isDraggingLeft || isDraggingRight ? 'cursor-col-resize select-none' : ''
      }`}
    >
      {/* Mobile Drawer Backdrop & Panel */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-[280px] max-w-[85vw] h-full bg-neutral-950 border-r border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {left}
          </div>
        </div>
      )}

      {/* Desktop Left Panel: Explorer */}
      <div
        style={{ width: `${leftPanelWidth}px` }}
        className="hidden md:flex h-full shrink-0 border-r border-neutral-800 flex-col overflow-hidden bg-neutral-950"
      >
        {left}
      </div>

      {/* Drag handle Left (desktop only) */}
      <div
        onMouseDown={handleMouseDownLeft}
        className="hidden md:block w-1 hover:w-1.5 h-full cursor-col-resize bg-transparent hover:bg-[#00ED64]/60 transition-colors z-10 shrink-0"
      />

      {/* Center Panel: Main workspace */}
      <div className="flex-1 h-full flex flex-col overflow-hidden bg-neutral-900/40 min-w-0 w-full">
        {center}
      </div>

      {/* Right Panel: Context Help */}
      {rightPanelOpen && (
        <>
          <div
            onMouseDown={handleMouseDownRight}
            className="hidden md:block w-1 hover:w-1.5 h-full cursor-col-resize bg-transparent hover:bg-[#00ED64]/60 transition-colors z-10 shrink-0"
          />
          <div
            style={{ width: `${rightPanelWidth}px` }}
            className="h-full shrink-0 border-l border-neutral-800 flex flex-col overflow-hidden bg-neutral-950"
          >
            {right}
          </div>
        </>
      )}
    </div>
  );
};
