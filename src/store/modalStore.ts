import { create } from 'zustand';

export type ModalVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ModalOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ModalVariant;
  isAlert?: boolean;
  isPrompt?: boolean;
  defaultValue?: string;
  placeholder?: string;
}

interface ModalState {
  isOpen: boolean;
  options: ModalOptions;
  resolveBool: ((value: boolean) => void) | null;
  resolvePrompt: ((value: string | null) => void) | null;
  showConfirm: (options: Omit<ModalOptions, 'isAlert' | 'isPrompt'>) => Promise<boolean>;
  showAlert: (options: Omit<ModalOptions, 'isAlert' | 'isPrompt' | 'cancelText'>) => Promise<void>;
  showPrompt: (options: Omit<ModalOptions, 'isAlert' | 'isPrompt'>) => Promise<string | null>;
  close: (result: boolean, promptValue?: string) => void;
}

const defaultOptions: ModalOptions = {
  title: 'Confirmación',
  message: '',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  variant: 'info',
  isAlert: false,
  isPrompt: false,
  defaultValue: '',
  placeholder: '',
};

export const useModalStore = create<ModalState>((set, get) => ({
  isOpen: false,
  options: defaultOptions,
  resolveBool: null,
  resolvePrompt: null,

  showConfirm: (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options: {
          ...defaultOptions,
          ...options,
          isAlert: false,
          isPrompt: false,
        },
        resolveBool: resolve,
        resolvePrompt: null,
      });
    });
  },

  showAlert: (options) => {
    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        options: {
          ...defaultOptions,
          confirmText: 'Entendido',
          ...options,
          isAlert: true,
          isPrompt: false,
        },
        resolveBool: () => resolve(),
        resolvePrompt: null,
      });
    });
  },

  showPrompt: (options) => {
    return new Promise<string | null>((resolve) => {
      set({
        isOpen: true,
        options: {
          ...defaultOptions,
          ...options,
          isAlert: false,
          isPrompt: true,
        },
        resolveBool: null,
        resolvePrompt: resolve,
      });
    });
  },

  close: (result: boolean, promptValue?: string) => {
    const { resolveBool, resolvePrompt, options } = get();
    if (options.isPrompt) {
      if (resolvePrompt) {
        resolvePrompt(result ? (promptValue ?? options.defaultValue ?? '') : null);
      }
    } else if (resolveBool) {
      resolveBool(result);
    }
    set({
      isOpen: false,
      resolveBool: null,
      resolvePrompt: null,
      options: defaultOptions,
    });
  },
}));

/**
 * Muestra un modal de confirmación con diseño estilizado y retorna una promesa booleana.
 */
export const confirmModal = (options: Omit<ModalOptions, 'isAlert' | 'isPrompt'>): Promise<boolean> => {
  return useModalStore.getState().showConfirm(options);
};

/**
 * Muestra un modal informativo o de alerta con diseño estilizado y retorna una promesa que se resuelve al cerrarlo.
 */
export const alertModal = (options: Omit<ModalOptions, 'isAlert' | 'isPrompt' | 'cancelText'>): Promise<void> => {
  return useModalStore.getState().showAlert(options);
};

/**
 * Muestra un modal de entrada de texto estilizado (reemplazo de prompt()) y retorna el texto o null si se cancela.
 */
export const promptModal = (options: Omit<ModalOptions, 'isAlert' | 'isPrompt'>): Promise<string | null> => {
  return useModalStore.getState().showPrompt(options);
};
