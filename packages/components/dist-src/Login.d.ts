/// <reference types="bitcoin-computer__lib" />
import { Computer } from "@bitcoin-computer/lib";
export declare function isLoggedIn(): boolean;
export declare function logout(): void;
export declare function getCoinType(chain: string, network: string): number;
export declare function getBip44Path({ purpose, coinType, account }?: {
    purpose?: number | undefined;
    coinType?: number | undefined;
    account?: number | undefined;
}): string;
export declare function getPath(chain: string, network: string): string;
export declare function getUrl(chain: string, network: string): "" | "https://node.bitcoincomputer.io" | "http://127.0.0.1:1031";
export declare function getComputer(): Computer;
export declare function LoginButton({ mnemonic, chain, network, path, url }: any): import("react/jsx-runtime").JSX.Element;
export declare function LoginForm(): import("react/jsx-runtime").JSX.Element;
export declare function LoginModal(): import("react/jsx-runtime").JSX.Element;
