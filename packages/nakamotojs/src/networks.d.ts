export interface Network {
    messagePrefix: string;
    bech32: string;
    bip32: Bip32;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
}
interface Bip32 {
    public: number;
    private: number;
}
export declare const bitcoin: Network;
export declare const regtest: Network;
export declare const testnet: Network;
export declare const litecoin: Network;
export declare const litecoinregtest: Network;
export declare const litecointestnet: Network;
export declare const pepecoin: Network;
export declare const pepecoinregtest: Network;
export declare const pepecointestnet: Network;
export declare const dogecoin: Network;
export declare const dogecoinregtest: Network;
export declare const dogecointestnet: Network;
export declare const NETWORKS: Record<string, any>;
export {};
