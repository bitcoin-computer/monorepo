import React, { ReactNode } from "react";
interface BalanceContextProps {
    setBalance: (amount: number) => void;
    balance: number;
}
interface BalanceProviderProps {
    children: ReactNode;
}
export declare const BalanceProvider: React.FC<BalanceProviderProps>;
export declare const useBalance: () => BalanceContextProps;
export declare const BalanceContext: {
    BalanceProvider: React.FC<BalanceProviderProps>;
    useBalance: () => BalanceContextProps;
};
export {};
