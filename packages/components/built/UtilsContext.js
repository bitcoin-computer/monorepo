import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState, } from 'react';
import { ToastHost } from './SnackBar';
import { Loader } from './Loader';
import { DEFAULT_TOAST_DURATION, MAX_VISIBLE_TOASTS, } from './toastTypes';
const utilsContext = createContext(undefined);
export const useUtilsComponents = () => {
    const context = useContext(utilsContext);
    if (!context)
        throw new Error('useUtilsComponents must be used within a UtilsProvider');
    return context;
};
let toastSeq = 0;
function nextToastId() {
    toastSeq += 1;
    return `toast-${toastSeq}-${Date.now()}`;
}
export const UtilsProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const pushToast = useCallback((options) => {
        const variant = options.variant ?? 'info';
        const durationMs = options.durationMs !== undefined ? options.durationMs : DEFAULT_TOAST_DURATION[variant];
        const id = options.id ?? nextToastId();
        const item = {
            id,
            message: options.message,
            title: options.title,
            variant,
            durationMs,
            action: options.action,
        };
        setToasts((prev) => {
            const withoutDup = prev.filter((t) => t.id !== id);
            const next = [...withoutDup, item];
            return next.slice(-MAX_VISIBLE_TOASTS);
        });
    }, []);
    const toast = useMemo(() => {
        const api = ((options) => pushToast(options));
        api.success = (message, options) => pushToast({ ...options, message, variant: 'success' });
        api.error = (message, options) => pushToast({ ...options, message, variant: 'error' });
        api.info = (message, options) => pushToast({ ...options, message, variant: 'info' });
        api.warning = (message, options) => pushToast({ ...options, message, variant: 'warning' });
        return api;
    }, [pushToast]);
    const showSnackBar = useCallback((message, success) => {
        pushToast({
            message,
            variant: success ? 'success' : 'error',
        });
    }, [pushToast]);
    const hideSnackBar = useCallback(() => {
        setToasts([]);
    }, []);
    const showLoader = useCallback((show) => {
        setIsLoading(show);
    }, []);
    const value = useMemo(() => ({ toast, showSnackBar, hideSnackBar, showLoader }), [toast, showSnackBar, hideSnackBar, showLoader]);
    return (_jsxs(utilsContext.Provider, { value: value, children: [children, _jsx(ToastHost, { items: toasts, onDismiss: dismissToast }), isLoading && _jsx(Loader, {})] }));
};
export const UtilsContext = {
    UtilsProvider,
    useUtilsComponents,
};
