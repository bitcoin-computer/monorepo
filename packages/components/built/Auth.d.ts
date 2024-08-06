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
declare function loggedOutConfiguration(): {
    chain: Chain;
    network: Network;
    url: string | undefined;
};
declare function loggedInConfiguration(): {
    mnemonic: string | null;
    chain: Chain;
    network: Network;
    url: string | undefined;
};
declare function getComputer(): Computer;
declare function LoginForm(): import("react/jsx-runtime").JSX.Element;
declare function LoginModal(): import("react/jsx-runtime").JSX.Element;
export declare const Auth: {
    isLoggedIn: typeof isLoggedIn;
    logout: typeof logout;
    getCoinType: typeof getCoinType;
    getBip44Path: typeof getBip44Path;
    defaultConfiguration: typeof loggedOutConfiguration;
    browserConfiguration: typeof loggedInConfiguration;
    getComputer: typeof getComputer;
    LoginForm: typeof LoginForm;
    LoginModal: typeof LoginModal;
};
export {};
