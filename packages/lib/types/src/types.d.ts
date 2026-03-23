import type { Mock } from './mock.js';
import type { Transaction } from './transaction.js';
import type { Update } from './update.js';
export declare const BC_BRAND: unique symbol;
export declare const PROXY_TAG: unique symbol;
export type BC_BRAND = typeof BC_BRAND;
export type PROXY_TAG = typeof PROXY_TAG;
type KnownContractSymbols = typeof BC_BRAND | typeof PROXY_TAG;
declare const brand: unique symbol;
type Branded<T, Brand extends string> = T & {
    readonly [brand]: Brand;
};
export type TxId = Branded<string, 'TxId'>;
export type Id = Branded<`${TxId}:${number}`, 'Id'>;
export type Rev = Branded<`${TxId}:${number}`, 'Rev'>;
export type Root = Branded<`${TxId}:${number}`, 'Root'>;
export type Exp = Branded<string, 'Exp'>;
export type Mod = Branded<`${TxId}:${number}`, 'Mod'>;
export type PublicKeyHex = Branded<`0${2 | 3}${string}`, 'PublicKeyHex'>;
export type Address = Branded<string, 'Address'>;
export type Url = Branded<string, 'Url'>;
export type LocationId = Rev | TxId;
export type ExpString = string;
export type ModString = string;
export type RevString = string;
export type TxIdString = string;
export type IdString = string;
export type RootString = string;
export type PublicKeyString = string;
export type AddressString = string;
export type UrlString = string;
export type ChainString = string;
export type NetworkString = string;
export declare const asRoot: (s: string) => Root;
export declare const asId: (s: string) => Id;
export declare const asExp: (s: string) => Exp;
export declare const asMod: (s: string) => Mod;
export declare const asRev: (s: string) => Rev;
export declare const asTxId: (s: string) => TxId;
export declare const asPublicKeyHex: (s: string) => PublicKeyHex;
export declare const asAddress: (s: string) => Address;
export declare const asUrl: (s: string) => Url;
export declare abstract class Contract {
    readonly [BC_BRAND]: true;
    readonly _id: string;
    readonly _rev: string;
    readonly _root: string;
    _satoshis: bigint;
    _owners: string | readonly string[];
    _readers?: readonly string[];
    _url?: string;
    constructor(..._args: any[]);
}
type Compute<T> = T extends (...args: any[]) => any ? T : {
    [K in keyof T]: T[K];
} & object;
export type Class = abstract new (...args: any[]) => any;
export type IsContractClass<T> = T extends abstract new (...args: any[]) => Contract ? true : false;
export type ExtractClass<T> = T extends Class ? T : never;
export type Exact<T> = T & Record<Exclude<keyof any, keyof T | KnownContractSymbols>, never>;
export type DeepExact<T> = T extends Contract ? T : T extends (...args: any[]) => any ? T : T extends readonly any[] ? {
    [K in keyof T]: DeepExact<T[K]>;
} & readonly any[] & Record<string, never> : T extends any[] ? {
    [K in keyof T]: DeepExact<T[K]>;
} & any[] & Record<string, never> : T extends object ? Exact<{
    [K in keyof T]: DeepExact<T[K]>;
}> : T;
export type Lifted<T, Root extends Class = Class> = IsContractClass<T> extends true ? T extends InstanceType<infer C extends Class> ? SmartContract<C> : SmartContract<Root> : T extends Promise<infer U> ? Promise<Lifted<U, Root>> : T extends Contract | {
    readonly [BC_BRAND]: true;
} ? SmartContract<Root> : T extends (this: any, ...args: infer P extends readonly any[]) => infer R ? LiftedThisMethod<P, R, Root> : T extends (...args: infer P extends readonly any[]) => infer R ? LiftedFunction<P, R, Root> : T extends any[] ? {
    [K in keyof T]: Lifted<T[K], Root>;
} & any[] : T extends readonly any[] ? {
    [K in keyof T]: Lifted<T[K], Root>;
} & readonly any[] : T extends object ? DeepExact<T> : LiftedPrimitive<T>;
export type LiftedPrimitive<T> = T;
export type LiftedParameters<P extends readonly any[], Root extends Class = Class> = {
    [K in keyof P]: Lifted<P[K], Root>;
};
export type LiftedReturn<R, Root extends Class = Class> = R extends Promise<infer U> ? Promise<Lifted<U, Root>> : Promise<Lifted<R, Root>>;
export type LiftedThisMethod<Args extends readonly any[], Ret, Root extends Class> = (this: SmartContract<Root>, ...args: LiftedParameters<Args, Root>) => LiftedReturn<Ret, Root>;
export type LiftedFunction<Args extends readonly any[], Ret, Root extends Class = Class> = (...args: LiftedParameters<Args, Root>) => LiftedReturn<Ret, Root>;
export type LiftedStatics<T extends Class> = {
    [K in keyof T as K extends 'prototype' | 'length' | 'name' | 'caller' | 'arguments' | 'apply' | 'call' | 'bind' | 'constructor' ? never : K]: Lifted<T[K], T>;
};
export type LiftedInstanceProperties<T extends Class> = Readonly<{
    [K in keyof InstanceType<T>]: Lifted<InstanceType<T>[K], T>;
}>;
export type SmartContract<T extends Class = Class> = Compute<Exact<LiftedInstanceProperties<T> & Contract>> & {
    readonly constructor: LiftedContract<T>;
};
export type LiftedConstructorParams<T extends Class> = LiftedParameters<ConstructorParameters<T>, T>;
export type LiftedContract<T extends Class = Class> = Compute<SmartContract<T> & LiftedStatics<T>> & (new (...args: LiftedConstructorParams<T>) => SmartContract<T>) & (new (...args: any[]) => SmartContract<T>);
export declare function lifted<C extends Class>(target: C): LiftedContract<C>;
export declare function lifted<C extends Class>(target: SmartContract<C>): LiftedContract<C>;
export declare function precise<T extends Class>(value: SmartContract<any>): asserts value is SmartContract<T>;
export type SmartValue = JsonPrimitive | readonly SmartValue[] | SmartContract;
export type Env<T = SmartContract> = Record<string, T | null>;
export type EvaluatedEffect = {
    res: SmartValue;
    env: Env<SmartContract>;
};
export type EffectJSON = {
    res: SmartValue;
    env: Env<Rev>;
};
export type RawSmartContract<T extends Class = Class> = Omit<SmartContract<T>, '_id' | '_rev' | '_root'> & {
    _id: Id;
    _rev: Rev;
    _root: Root;
    readonly [brand]: true;
};
export type OwnerData = {
    _satoshis: bigint;
    _owners: PublicKeyHex | readonly PublicKeyHex[];
    _readers?: readonly PublicKeyHex[];
    _url?: Url;
};
export interface ContractMetaData {
    readonly _id: IdString;
    readonly _rev: RevString;
    readonly _root: RootString;
    _satoshis: bigint;
    _owners: PublicKeyHex | readonly PublicKeyHex[];
    _readers?: readonly PublicKeyHex[];
    _url?: UrlString;
}
export type OnChainMetadata = JsonObject & Partial<OwnerData & {
    ioMap: number[];
}>;
export type OwnerOutputData = OnChainMetadata & {
    outScriptBuf?: Buffer;
};
export type Query = {
    mod?: ModString;
    publicKey?: PublicKeyString;
    limit?: number;
    offset?: number;
    order?: 'ASC' | 'DESC';
};
export type FundOptions = {
    fund?: boolean;
    include?: RevString[];
    exclude?: RevString[];
};
export type SigOptions = {
    sign?: boolean;
    inputIndex?: number;
    sighashType?: number;
    inputScript?: Buffer;
};
export type MockOptions = {
    mocks?: {
        [s: string]: Mock;
    };
};
export type ModuleOptions = {
    commitAmount?: number;
    commitFee?: number;
    revealAmount?: number;
    revealFee?: number;
    include?: Rev[];
    exclude?: Rev[];
};
export type ComputeOptions = VerifyOptions & FundOptions & AncestorOptions & SigOptions & MockOptions;
export type VerifyOptions = {
    txUpdate?: Update;
    txFromChain?: Transaction;
};
export type Ancestors = Map<string, string>;
export type AncestorOptions = {
    ancestors?: Ancestors;
};
export interface ModuleSource {
    source: string;
}
export type JsonPrimitive = null | undefined | boolean | number | string | bigint | symbol | Buffer;
export type Json = JsonPrimitive | JsonArray | JsonObject;
export interface JsonObject {
    [key: string]: Json;
}
export type JsonArray = readonly Json[];
export type SmartJson = JsonPrimitive | SmartContract | SmartJsonArray;
export type SmartJsonArray = readonly SmartJson[];
export type InformationValue = string | number | boolean | bigint | null | InformationValue[];
export declare const isJsonUndefined: (a: unknown) => a is undefined;
export declare const isJsonNull: (a: unknown) => a is null;
export declare const isJsonBoolean: (a: unknown) => a is boolean;
export declare const isJsonNumber: (a: unknown) => a is number;
export declare const isJsonString: (a: unknown) => a is string;
export declare const isJsonSymbol: (a: unknown) => a is symbol;
export declare const isJsonBigInt: (a: unknown) => a is bigint;
export declare const isJsonPrimitive: (a: unknown) => a is JsonPrimitive;
export declare const isJArray: (a: unknown) => a is JsonArray;
export declare const isJObject: (a: unknown) => a is JsonObject;
export declare const isSmartObject: (v: unknown) => v is SmartContract;
export declare const isPublicKeyHex: (s: unknown) => s is PublicKeyHex;
export declare function isStored(obj: Json): obj is Stored;
export declare function isEncrypted(obj: Json): obj is Encrypted;
export declare const isRevObject: (obj: Json) => obj is {
    _rev: string;
};
export declare function isTxId(value: string): value is TxId;
export declare function isRev(s: string): s is Rev;
export type Chain = 'LTC' | 'BTC' | 'PEPE' | 'DOGE';
export type BtcNetwork = 'testnet' | 'mainnet' | 'regtest';
export type Fee = Partial<{
    fee: number;
}>;
export type AddressType = 'p2pkh' | 'p2wpkh' | 'p2tr';
export type ModuleStorageType = 'multisig' | 'taproot';
export type Mode = 'prod' | 'dev' | 'debug';
export type ComputerOptions = Partial<{
    chain: ChainString;
    mnemonic: string;
    network: NetworkString;
    passphrase: string;
    path: string;
    url: string;
    satPerByte: number;
    addressType: AddressString;
    moduleStorageType: ModuleStorageType;
    checkFee: boolean;
    mode: Mode;
}>;
export interface ApiBalance {
    confirmed: string;
    unconfirmed: string;
    balance: string;
}
export type DefaultValues = {
    satPerByte: number;
    dustRelayTxFee: number;
    moduleStorageType: ModuleStorageType;
};
export type Stored = {
    _url: string;
};
export type Encrypted = {
    __cypher: string;
    __secrets: string[];
    ioMap?: number[];
};
export type TransitionJSON = {
    exp: ExpString;
    env: Record<string, RevString>;
    mod?: ModString;
};
export interface SecretOutput {
    data: string;
}
export interface Outpoint {
    txId: TxId;
    outputIndex: number;
}
export type Location = {
    _id: IdString;
    _rev: RevString;
    _root: RootString;
    _satoshis: bigint;
    _owners: PublicKeyString | readonly PublicKeyString[];
    _readers?: readonly PublicKeyString[];
    _url?: UrlString;
};
export type Utxo = {
    hash: any;
    index: any;
    nonWitnessUtxo: Buffer;
};
export interface Tapleaf {
    output: Buffer;
    version?: number;
}
export type Taptree = [Taptree | Tapleaf, Taptree | Tapleaf] | Tapleaf;
export interface Balance {
    confirmed: bigint;
    unconfirmed: bigint;
    balance: bigint;
}
export interface Unspent {
    txId: string;
    vout: number;
    satoshis: bigint;
    rev?: string;
    scriptPubKey?: string;
    address?: string;
    height?: number;
}
export interface RpcInput {
    txId: string;
    vout: number;
    script: string;
    sequence: string;
    witness: string[];
}
export interface RpcOutput {
    value: string;
    script: string;
    address?: string;
}
export interface RpcTransaction {
    txId: string;
    txHex: string;
    vsize: number;
    version: number;
    locktime: number;
    ins: RpcInput[];
    outs: RpcOutput[];
}
export type TxSatoshisInfo = {
    txId: string;
    inputsSatoshis: bigint;
    outputsSatoshis: bigint;
    satoshis: bigint;
};
export type Stream = {
    satoshis?: bigint;
    asm?: string;
    exp?: string;
    mod?: string;
};
export type TXORecord = {
    rev: string;
    address: string;
    satoshis: bigint;
    asm: string;
    expHash?: string;
    mod?: string;
    isObject?: boolean;
    previous?: string;
    blockHash?: string;
    blockHeight?: number;
    blockIndex?: number;
};
export type TXOQuery = {
    verbosity?: number;
    limit?: number;
    order?: 'ASC' | 'DESC';
    offset?: number;
    isSpent?: boolean;
    isConfirmed?: boolean;
    publicKey?: PublicKeyString;
    exp?: string;
} & Partial<Omit<TXORecord, 'expHash'>>;
export type EvalResult = {
    effect: EvaluatedEffect;
    tx: Transaction;
    update: Update;
};
export {};
