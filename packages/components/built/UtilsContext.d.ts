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
    /** Preferred API for transient action feedback. */
    toast: ToastApi;
    /**
     * @deprecated Prefer `toast.success` / `toast.error`. Kept for call-site compatibility.
     * Maps `success=true` → success toast, `false` → error toast.
     */
    showSnackBar: (message: string, success: boolean) => void;
    hideSnackBar: () => void;
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
