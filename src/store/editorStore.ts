import { create } from 'zustand';
import { QueryResult, MongoDocument } from '../types/mongo';

export type PlaygroundTab = 'table' | 'editor' | 'examples' | 'builder' | 'inspector' | 'doc-editor';
export type ResultViewMode = 'table' | 'json';

interface EditorState {
  code: string;
  activeTab: PlaygroundTab;
  resultViewMode: ResultViewMode;
  lastResult: QueryResult | null;
  isRunning: boolean;
  selectedDocForEdit: { collection: string; doc: MongoDocument } | null;
  isExamplesOpen: boolean;

  setCode: (code: string) => void;
  setActiveTab: (tab: PlaygroundTab) => void;
  setResultViewMode: (mode: ResultViewMode) => void;
  setLastResult: (result: QueryResult | null) => void;
  setIsRunning: (running: boolean) => void;
  setSelectedDocForEdit: (data: { collection: string; doc: MongoDocument } | null) => void;
  setIsExamplesOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  code: '',
  activeTab: 'table',
  resultViewMode: 'json',
  lastResult: null,
  isRunning: false,
  selectedDocForEdit: null,
  isExamplesOpen: false,

  setCode: (code) => set({ code }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setResultViewMode: (resultViewMode) => set({ resultViewMode }),
  setLastResult: (lastResult) => set({ lastResult }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setSelectedDocForEdit: (selectedDocForEdit) => set({ selectedDocForEdit }),
  setIsExamplesOpen: (isExamplesOpen) => set({ isExamplesOpen }),
}));
