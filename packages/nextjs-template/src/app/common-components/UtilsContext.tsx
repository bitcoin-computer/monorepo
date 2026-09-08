import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { SnackBar } from "./SnackBar";
import { Loader } from "./Loader";

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

interface UtilsContextProps {
  toast: ToastApi;
  showLoader: (show: boolean) => void;
}

const utilsContext = createContext<UtilsContextProps | undefined>(undefined);

export const useUtilsComponents = (): UtilsContextProps => {
  const context = useContext(utilsContext);
  if (!context) {
    throw new Error("useUtilsComponents must be used within a UtilsProvider");
  }
  return context;
};

interface UtilsProviderProps {
  children: ReactNode;
}

export const UtilsProvider: React.FC<UtilsProviderProps> = ({ children }) => {
  const [snackBar, setSnackBar] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toast = useMemo<ToastApi>(
    () => ({
      success: (message) => setSnackBar({ message, success: true }),
      error: (message) => setSnackBar({ message, success: false }),
      info: (message) => setSnackBar({ message, success: true }),
      warning: (message) => setSnackBar({ message, success: false }),
    }),
    []
  );

  const showLoader = (show: boolean) => {
    setIsLoading(show);
  };

  const hideSnackBar = () => {
    setSnackBar(null);
  };

  return (
    <utilsContext.Provider value={{ toast, showLoader }}>
      {children}
      {snackBar && (
        <SnackBar
          message={snackBar.message}
          success={snackBar.success}
          hideSnackBar={hideSnackBar}
        />
      )}
      {isLoading && <Loader />}
    </utilsContext.Provider>
  );
};
