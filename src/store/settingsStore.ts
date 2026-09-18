import { create } from 'zustand';

export type AppTheme = 'dark' | 'light';

interface SettingsState {
  theme: AppTheme;
  editorFontSize: number;
  leftPanelWidth: number;
  rightPanelWidth: number;
  rightPanelOpen: boolean;
  isMobileSidebarOpen: boolean;

  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  setEditorFontSize: (size: number) => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setRightPanelOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
}

const THEME_KEY = 'mongolab_theme';
const FONT_SIZE_KEY = 'mongolab_font_size';
const LEFT_PANEL_KEY = 'mongolab_left_panel';
const RIGHT_PANEL_KEY = 'mongolab_right_panel';

function getInitialTheme(): AppTheme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light') {
    document.documentElement.classList.remove('dark');
    return 'light';
  }
  document.documentElement.classList.add('dark');
  return 'dark';
}

function getInitialFontSize(): number {
  const saved = localStorage.getItem(FONT_SIZE_KEY);
  return saved ? Number(saved) : 13;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: getInitialTheme(),
  editorFontSize: getInitialFontSize(),
  leftPanelWidth: Number(localStorage.getItem(LEFT_PANEL_KEY)) || 240,
  rightPanelWidth: Number(localStorage.getItem(RIGHT_PANEL_KEY)) || 320,
  rightPanelOpen: localStorage.getItem('mongolab_right_panel_open') === 'true',
  isMobileSidebarOpen: false,

  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: next };
    });
  },

  setEditorFontSize: (editorFontSize) => {
    localStorage.setItem(FONT_SIZE_KEY, String(editorFontSize));
    set({ editorFontSize });
  },

  setLeftPanelWidth: (leftPanelWidth) => {
    localStorage.setItem(LEFT_PANEL_KEY, String(leftPanelWidth));
    set({ leftPanelWidth });
  },

  setRightPanelWidth: (rightPanelWidth) => {
    localStorage.setItem(RIGHT_PANEL_KEY, String(rightPanelWidth));
    set({ rightPanelWidth });
  },

  setRightPanelOpen: (rightPanelOpen) => {
    localStorage.setItem('mongolab_right_panel_open', String(rightPanelOpen));
    set({ rightPanelOpen });
  },

  setMobileSidebarOpen: (isMobileSidebarOpen) => {
    set({ isMobileSidebarOpen });
  },

  toggleMobileSidebar: () => {
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen }));
  },
}));
