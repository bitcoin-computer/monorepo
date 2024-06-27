import { Computer } from "@bitcoin-computer/lib";
declare function SendMoneyForm({ computer, paymentModSpec }: {
    computer: any;
    paymentModSpec: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
export declare function Wallet({ paymentModSpec }: {
    paymentModSpec?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare const WalletComponents: {
    Balance: ({ computer, paymentModSpec }: {
        computer: Computer;
        paymentModSpec: string | undefined;
    }) => import("react/jsx-runtime").JSX.Element;
    Address: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    PublicKey: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Path: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Mnemonic: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Chain: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Network: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Url: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    SendMoneyForm: typeof SendMoneyForm;
    LogOut: () => import("react/jsx-runtime").JSX.Element;
};
export {};
