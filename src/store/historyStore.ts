import { create } from 'zustand';
import { CommandHistoryItem } from '../types/mongo';
import { getHistoryItems, saveHistoryItem, deleteHistoryItem, clearAllHistory } from '../lib/storage/idb';

interface HistoryState {
  items: CommandHistoryItem[];
  isLoading: boolean;

  initHistory: () => Promise<void>;
  addHistoryItem: (item: Omit<CommandHistoryItem, 'id' | 'timestamp' | 'isFavorite'>) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  isLoading: false,

  initHistory: async () => {
    try {
      const items = await getHistoryItems();
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      set({ items });
    } catch {
      // IndexedDB fallback
    }
  },

  addHistoryItem: async (itemData) => {
    const newItem: CommandHistoryItem = {
      ...itemData,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      isFavorite: false,
    };

    const updated = [newItem, ...get().items].slice(0, 100);
    set({ items: updated });
    await saveHistoryItem(newItem);
  },

  toggleFavorite: async (id: string) => {
    const items = get().items.map(it => (it.id === id ? { ...it, isFavorite: !it.isFavorite } : it));
    set({ items });
    const target = items.find(it => it.id === id);
    if (target) {
      await saveHistoryItem(target);
    }
  },

  removeItem: async (id: string) => {
    set({ items: get().items.filter(it => it.id !== id) });
    await deleteHistoryItem(id);
  },

  clearHistory: async () => {
    set({ items: [] });
    await clearAllHistory();
  },
}));
