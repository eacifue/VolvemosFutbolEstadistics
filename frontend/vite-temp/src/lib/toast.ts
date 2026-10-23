import { createContext, useContext } from 'react';

export interface ToastInput { tone?: 'success' | 'error' | 'info'; message: string; detail?: string }
export type ToastFn = (t: ToastInput) => void;

export const ToastContext = createContext<ToastFn>(() => undefined);

export const useToast = (): ToastFn => useContext(ToastContext);
