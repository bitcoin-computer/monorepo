/// <reference types="bitcoin-computer__lib" />
import { Computer } from "@bitcoin-computer/lib";
import type { Chain, Network } from "./common/types";
declare function isLoggedIn(): boolean;
declare function logout(): void;
declare function getCoinType(chain: string, network: string): number;
declare function getBip44Path({ purpose, coinType, account }?: {
    purpose?: number | undefined;
    coinType?: number | undefined;
    account?: number | undefined;
}): string;
declare function getUrl(chain: Chain, network: Network): string;
declare function defaultConfiguration(): {
    chain: Chain;
    network: Network;
    url: string;
};
declare function browserConfiguration(): {
    mnemonic: string | null;
    chain: Chain;
    network: Network;
    path: string | null;
    url: string | null;
};
declare function getComputer(): Computer;
declare function LoginForm(): import("react/jsx-runtime").JSX.Element;
declare function LoginModal(): import("react/jsx-runtime").JSX.Element;
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
export {};
