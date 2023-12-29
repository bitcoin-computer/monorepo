/// <reference types="bitcoin-computer__lib" />
import { Dispatch } from "react";
import { Computer } from "@bitcoin-computer/lib";
import type { Chain, Network } from "./types/common";
export declare function isLoggedIn(): boolean;
export declare function logout(): void;
export declare function getCoinType(chain: string, network: string): number;
export declare function getBip44Path({ purpose, coinType, account }?: {
    purpose?: number | undefined;
    coinType?: number | undefined;
    account?: number | undefined;
}): string;
export declare function getPath(chain: string, network: string): string;
export declare function getUrl(chain: Chain, network: Network): string;
export declare function defaultConfiguration(): {
    chain: Chain;
    network: Network;
    url: string;
};
export declare function browserConfiguration(): {
    mnemonic: string | null;
    chain: Chain;
    network: Network;
    path: string | null;
    url: string | null;
};
export declare function getComputer(): Computer;
export declare function MnemonicInput({ mnemonic, setMnemonic }: {
    mnemonic: string;
    setMnemonic: Dispatch<string>;
}): import("react/jsx-runtime").JSX.Element;
export declare function ChainInput({ chain, setChain }: {
    chain: Chain;
    setChain: Dispatch<Chain>;
}): import("react/jsx-runtime").JSX.Element;
export declare function NetworkInput({ network, setNetwork }: {
    network: Network;
    setNetwork: Dispatch<Network>;
}): import("react/jsx-runtime").JSX.Element;
export declare function PathInput({ chain, network, path, setPath }: {
    chain: string;
    network: string;
    path: string;
    setPath: Dispatch<string>;
}): import("react/jsx-runtime").JSX.Element;
export declare function UrlInput({ chain, network, url, setUrl }: {
    chain: Chain;
    network: Network;
    url: string;
    setUrl: Dispatch<string>;
}): import("react/jsx-runtime").JSX.Element;
export declare function LoginButton({ mnemonic, chain, network, path, url }: any): import("react/jsx-runtime").JSX.Element;
export declare function LoginForm(): import("react/jsx-runtime").JSX.Element;
export declare function LoginModal(): import("react/jsx-runtime").JSX.Element;
export declare const Auth: {
    isLoggedIn: typeof isLoggedIn;
    logout: typeof logout;
    getCoinType: typeof getCoinType;
    getBip44Path: typeof getBip44Path;
    getUrl: typeof getUrl;
    defaultConfiguration: typeof defaultConfiguration;
    browserConfiguration: typeof browserConfiguration;
    getComputer: typeof getComputer;
    LoginForm: typeof LoginForm;
    LoginModal: typeof LoginModal;
};
