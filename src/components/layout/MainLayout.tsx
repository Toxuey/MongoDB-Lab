import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { GlobalModal } from '../ui/GlobalModal';
import { useDbStore } from '../../store/dbStore';
import { useHistoryStore } from '../../store/historyStore';

export const MainLayout: React.FC = () => {
  const { initDatabase, isLoading } = useDbStore();
  const { initHistory } = useHistoryStore();

  useEffect(() => {
    initDatabase();
    initHistory();
  }, [initDatabase, initHistory]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-400 font-mono text-xs gap-3 select-none">
        <div className="w-6 h-6 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin" />
        <span>Iniciando MongoDB Lab (IndexedDB)...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      <Header />

      <main className="flex-1 h-[calc(100vh-3rem)] overflow-hidden">
        <Outlet />
      </main>

      <GlobalModal />
    </div>
  );
};
