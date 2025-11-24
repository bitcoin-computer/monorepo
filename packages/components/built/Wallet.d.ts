import { Computer } from '@bitcoin-computer/lib';
export declare function Wallet({ modSpecs }: {
    modSpecs?: string[];
}): import("react/jsx-runtime").JSX.Element;
export declare const WalletComponents: {
    Deposit: ({ computer }: {
        computer: Computer;
    }) => import("react/jsx-runtime").JSX.Element;
    PublicKey: ({ computer }: {
        computer: Computer;
    }) => import("react/jsx-runtime").JSX.Element;
    Mnemonic: ({ computer }: {
        computer: Computer;
    }) => import("react/jsx-runtime").JSX.Element;
    Chain: ({ computer }: {
        computer: Computer;
    }) => import("react/jsx-runtime").JSX.Element;
    Network: ({ computer }: {
        computer: Computer;
    }) => import("react/jsx-runtime").JSX.Element;
    Url: ({ computer }: {
        computer: Computer;
    }) => import("react/jsx-runtime").JSX.Element;
    LogOut: () => import("react/jsx-runtime").JSX.Element;
};
