import { ChainConfig } from './registry.js';
export declare const BUILTIN_CHAINS: readonly ["LTC", "BTC", "DOGE", "PEPE", "WOJAK"];
export type BuiltinChain = (typeof BUILTIN_CHAINS)[number];
export declare const BTC: ChainConfig;
export declare const LTC: ChainConfig;
export declare const DOGE: ChainConfig;
export declare const PEPE: ChainConfig;
export declare const WOJAK: ChainConfig;
export declare const BUILTIN_CONFIGS: ChainConfig[];
