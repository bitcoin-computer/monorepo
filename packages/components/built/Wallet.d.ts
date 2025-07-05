import { Computer } from '@bitcoin-computer/lib';
export declare function Wallet({ modSpecs }: {
    modSpecs?: string[];
}): import("react/jsx-runtime").JSX.Element;
export declare const WalletComponents: {
    Balance: ({ computer, modSpecs, isOpen, }: {
        computer: Computer;
        modSpecs: string[];
        isOpen: boolean;
    }) => import("react/jsx-runtime").JSX.Element;
    Address: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    PublicKey: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Mnemonic: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Chain: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Network: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    Url: ({ computer }: any) => import("react/jsx-runtime").JSX.Element;
    LogOut: () => import("react/jsx-runtime").JSX.Element;
};
