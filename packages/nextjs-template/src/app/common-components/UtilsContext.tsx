import React, { createContext, ReactNode, useContext, useState } from "react";
import { SnackBar } from "./SnackBar";
import { Loader } from "./Loader";

interface UtilsContextProps {
  showSnackBar: (message: string, success: boolean) => void;
  hideSnackBar: () => void;
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
  children: ReactNode; // Explicitly type children as ReactNode
}

export const UtilsProvider: React.FC<UtilsProviderProps> = ({ children }) => {
  const [snackBar, setSnackBar] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showSnackBar = (message: string, success: boolean) => {
    setSnackBar({ message, success });
  };

  const showLoader = (show: boolean) => {
    setIsLoading(show);
  };

  const hideSnackBar = () => {
    setSnackBar(null);
  };

  return (
    <utilsContext.Provider value={{ showSnackBar, hideSnackBar, showLoader }}>
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
