import { Computer } from '@bitcoin-computer/lib';
import type { Chain, Network, ModuleStorageType } from './common/types';
export type TBCChain = 'LTC' | 'BTC' | 'PEPE' | 'DOGE';
export type TBCNetwork = 'testnet' | 'mainnet' | 'regtest';
export type AddressType = 'p2pkh' | 'p2wpkh' | 'p2tr';
export type ComputerOptions = Partial<{
    chain: TBCChain;
    mnemonic: string;
    network: TBCNetwork;
    passphrase: string;
    path: string;
    seed: string;
    url: string;
    satPerByte: number;
    dustRelayFee: number;
    addressType: AddressType;
    moduleStorageType: ModuleStorageType;
    thresholdBytes: number;
    cache: boolean;
}>;
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
    url: any;
};
declare function loggedInConfiguration(): {
    mnemonic: string | null;
    chain: Chain;
    network: Network;
    url: any;
};
declare function getComputer(options?: ComputerOptions): Computer;
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
