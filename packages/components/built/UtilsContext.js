import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
import { SnackBar } from './SnackBar';
import { Loader } from './Loader';
const utilsContext = createContext(undefined);
export const useUtilsComponents = () => {
    const context = useContext(utilsContext);
    if (!context) {
        throw new Error('useUtilsComponents must be used within a UtilsProvider');
    }
    return context;
};
export const UtilsProvider = ({ children }) => {
    const [snackBar, setSnackBar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const showSnackBar = (message, success) => {
        setSnackBar({ message, success });
    };
    const showLoader = (show) => {
        setIsLoading(show);
    };
    const hideSnackBar = () => {
        setSnackBar(null);
    };
    return (_jsxs(utilsContext.Provider, { value: { showSnackBar, hideSnackBar, showLoader }, children: [children, snackBar && (_jsx(SnackBar, { message: snackBar.message, success: snackBar.success, hideSnackBar: hideSnackBar })), isLoading && _jsx(Loader, {})] }));
};
export const UtilsContext = {
    UtilsProvider,
    useUtilsComponents,
};
