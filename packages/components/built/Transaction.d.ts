export declare const outputsComponent: ({ rpcTxnData, txn, }: {
    rpcTxnData: any;
    txn: string | undefined;
}) => import("react/jsx-runtime").JSX.Element;
export declare const inputsComponent: ({ rpcTxnData, checkForSpentInput, }: {
    rpcTxnData: any;
    checkForSpentInput: boolean;
}) => import("react/jsx-runtime").JSX.Element;
export declare const transitionComponent: ({ transition }: {
    transition: any;
}) => import("react/jsx-runtime").JSX.Element;
export declare function TransactionComponent(): import("react/jsx-runtime").JSX.Element;
export declare const Transaction: {
    Component: typeof TransactionComponent;
};
