import React, { ReactNode } from 'react';
import { ToastOptions } from './toastTypes';
export type { ToastOptions, ToastVariant, ToastItem } from './toastTypes';
export interface ToastApi {
    (options: ToastOptions): void;
    success: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void;
    error: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void;
    info: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void;
    warning: (message: string, options?: Omit<ToastOptions, 'message' | 'variant'>) => void;
}
interface UtilsContextProps {
    /** Transient action feedback (success / error / info / warning). */
    toast: ToastApi;
    showLoader: (show: boolean) => void;
}
export declare const useUtilsComponents: () => UtilsContextProps;
interface UtilsProviderProps {
    children: ReactNode;
}
export declare const UtilsProvider: React.FC<UtilsProviderProps>;
export declare const UtilsContext: {
    UtilsProvider: React.FC<UtilsProviderProps>;
    useUtilsComponents: () => UtilsContextProps;
};
