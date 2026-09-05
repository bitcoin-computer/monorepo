export type BtcNetworkName = 'mainnet' | 'testnet' | 'regtest';
export type ModuleStorageType = 'taproot' | 'multisig';
export type AddressType = 'p2pkh' | 'p2wpkh' | 'p2tr';
export interface Bip32 {
    public: number;
    private: number;
}
export interface NetworkParams {
    messagePrefix: string;
    bech32?: string;
    bip32: Bip32;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
}
export interface ChainDefaults {
    satPerByte: number;
    dustRelayTxFee: number;
    moduleStorageType: ModuleStorageType;
    minNonDust?: number;
    preferredAddressType?: AddressType;
}
export interface ChainFeatures {
    segwit?: boolean;
    taproot?: boolean;
    mweb?: boolean;
}
/** Return true if `hex` should be passed to `Transaction.fromHex`. */
export type ShouldParseTx = (hex: string) => boolean;
/**
 * Return true if a parsed tx should be inserted into the index.
 * `height` is omitted on the mempool / ZMQ path; skip-by-txid-only is unsafe
 * for BIP30-style duplicates (it would drop the first occurrence).
 */
export type ShouldIndexTx = (ctx: {
    txId: string;
    height?: number;
}) => boolean;
export interface ParsingPolicy {
    shouldParse?: ShouldParseTx;
    shouldIndex?: ShouldIndexTx;
}
export interface ParsingPolicyBound {
    shouldParse: ShouldParseTx;
    shouldIndex: ShouldIndexTx;
}
export interface NetworkConfig extends NetworkParams {
    coinType: number;
    defaults?: Partial<ChainDefaults>;
    features?: ChainFeatures;
    parsing?: ParsingPolicy;
}
export interface ChainConfig {
    chain: string;
    defaults: ChainDefaults;
    features?: ChainFeatures;
    networks: {
        mainnet: NetworkConfig;
        testnet: NetworkConfig;
        regtest: NetworkConfig;
    };
}
export interface ResolvedFeatures {
    segwit: boolean;
    taproot: boolean;
    mweb: boolean;
}
export interface ResolvedNetworkConfig extends NetworkParams {
    chain: string;
    network: BtcNetworkName;
    coinType: number;
    defaults: ChainDefaults;
    features: ResolvedFeatures;
    parsing?: ParsingPolicy;
}
export interface RegisterChainOptions {
    builtin?: boolean;
}
/**
 * Register a chain. Config data is cloned and frozen. `parsing.shouldParse`
 * / `shouldIndex` are trusted TypeScript functions (never JSON / eval).
 * Built-ins cannot be overridden.
 */
export declare function registerChain(config: ChainConfig, options?: RegisterChainOptions): void;
export declare function getChainConfig(chain: string): ChainConfig;
export declare function listSupportedChains(): string[];
export declare function isBuiltinChain(chain: string): boolean;
export declare function getNetworkConfig(chain: string, network: string): ResolvedNetworkConfig;
