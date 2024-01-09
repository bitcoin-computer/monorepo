import React, { ReactNode } from "react";
interface UtilsContextProps {
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
export {};
