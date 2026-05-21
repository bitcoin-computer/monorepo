import { Transaction as nTransaction } from '@bitcoin-computer/nakamotojs';
import { ModuleExportsNamespace } from 'ses';
import { Buffer } from 'buffer';
import { Transaction } from './transaction.js';
import { SmartContract, EvaluatedEffect, TransitionJSON, Address, RevString, TxIdString, ModString, AddressString, PublicKeyString, UrlString } from './types.js';
import { Db } from './db.js';
import { Class, ComputerOptions, Query, FundOptions, Unspent, Fee, Chain, BtcNetwork, SigOptions, ModuleOptions, MockOptions, Balance, TXOQuery, TXORecord, Stream } from './types.js';
import { Subscription } from './subscription.js';
declare class Computer {
    db: Db;
    subscription: Subscription;
    constructor(params?: ComputerOptions);
    private isMetadataKey;
    private containsMetadata;
    brandMetadata<T>(value: T, seen?: WeakMap<object, any>): T;
    new<T extends Class>(constructor: T, args?: ConstructorParameters<T>, mod?: string): Promise<SmartContract<T>>;
    private _getTXOsFamily;
    getTXOs(q: TXOQuery & {
        verbosity?: 0;
    }): Promise<string[]>;
    getTXOs(q: TXOQuery & {
        verbosity: 1;
    }): Promise<TXORecord[]>;
    getUTXOs(q: TXOQuery & {
        verbosity?: 0;
    }): Promise<string[]>;
    getUTXOs(q: TXOQuery & {
        verbosity: 1;
    }): Promise<TXORecord[]>;
    getOTXOs(q: TXOQuery & {
        verbosity?: 0;
    }): Promise<string[]>;
    getOTXOs(q: TXOQuery & {
        verbosity: 1;
    }): Promise<TXORecord[]>;
    getOUTXOs(q: TXOQuery & {
        verbosity?: 0;
    }): Promise<string[]>;
    getOUTXOs(q: TXOQuery & {
        verbosity: 1;
    }): Promise<TXORecord[]>;
    sync(location: TxIdString): Promise<EvaluatedEffect>;
    sync<T extends Class = any>(location: RevString): Promise<SmartContract<T>>;
    sync(location: string): Promise<SmartContract<any> | EvaluatedEffect>;
    getAncestors(location: string, verbosity: 1): Promise<Map<string, string>>;
    getAncestors(location: string, verbosity?: number): Promise<string[]>;
    private wrappedEncode;
    encode(json: Partial<TransitionJSON & FundOptions & SigOptions & MockOptions>): Promise<{
        tx: Transaction | null;
        effect: EvaluatedEffect;
    }>;
    encodeNew<T extends Class>({ constructor, args, mod, }: {
        constructor: T;
        args: ConstructorParameters<T>;
        mod?: ModString;
    }): Promise<{
        tx: Transaction | null;
        effect: EvaluatedEffect;
        db: Db;
    }>;
    encodeCall<T extends Class, K extends keyof InstanceType<T>>({ target, property, args, mod, }: {
        target: SmartContract<T>;
        property: K;
        args: Parameters<InstanceType<T>[K]>;
        mod?: ModString;
    }): Promise<{
        tx: Transaction | null;
        effect: EvaluatedEffect;
    }>;
    decode(tx: Transaction | TxIdString): Promise<TransitionJSON>;
    deploy(module: string, opts?: Partial<ModuleOptions>): Promise<string>;
    load(rev: ModString): Promise<ModuleExportsNamespace>;
    listTxs(address?: AddressString): Promise<{
        sentTxs: import("./types.js").TxSatoshisInfo[];
        receivedTxs: import("./types.js").TxSatoshisInfo[];
    }>;
    getBalance(address?: Address | AddressString): Promise<Balance>;
    sign(transaction: nTransaction, opts?: SigOptions): Promise<void>;
    fund(tx: nTransaction, opts?: Fee & FundOptions): Promise<void>;
    send(satoshis: bigint, address: string | Address): Promise<string>;
    broadcast(tx: nTransaction): Promise<string>;
    rpc(method: string, params: string): Promise<any>;
    txIdToBlockTime(hash: string): Promise<bigint>;
    getChain(): Chain;
    getNetwork(): BtcNetwork;
    getMnemonic(): string;
    getPrivateKey(): string;
    getPassphrase(): string;
    getPath(): string;
    getUrl(): UrlString;
    getPublicKey(): PublicKeyString;
    getAddress(): AddressString;
    getFee(): number;
    setFee(fee: number): void;
    faucet(amount: number, address?: string): Promise<Unspent>;
    static getVersion(): string;
    delete(inRevs: string[]): Promise<string>;
    first(rev: string): Promise<string>;
    prev(rev: string): Promise<string | undefined>;
    next(rev: string): Promise<string | undefined>;
    spendingInput(rev: string): Promise<string | undefined>;
    latest(rev: string): Promise<string>;
    last(rev: string): Promise<string | undefined>;
    subscribe(id: string, onMessage: ({ rev, hex }: {
        rev: RevString;
        hex: string;
    }) => void, onError?: (error: Event) => void): Promise<() => void>;
    streamTXOs(filter: Partial<Stream>, onMessage: ({ rev, hex }: {
        rev: RevString;
        hex: string;
    }) => void, onError?: (error: Event) => void): Promise<() => void>;
    streamMempoolCleanup(onMessage: (event: {
        revs: string[];
    }) => void, onError?: (error: Event) => void): Promise<() => void>;
    query(q: Query): Promise<string[]>;
    static txFromHex({ hex }: {
        hex: string;
    }): Transaction;
    getAddressType(): string;
    static lockdown(_opts?: any): void;
    export(module: string, opts?: Partial<ModuleOptions>): Promise<string>;
    import(rev: string): Promise<ModuleExportsNamespace>;
    queryRevs(q: Query): Promise<string[]>;
    getOwnedRevs(publicKey?: Buffer): Promise<string[]>;
    getRevs(publicKey?: Buffer): Promise<string[]>;
    getLatestRevs(ids: string[]): Promise<string[]>;
    getLatestRev(id: string): Promise<string>;
    idsToRevs(ids: string[]): Promise<string[]>;
    getMinimumFees(): number;
    static getInscription(rawTx: string, index: number): {
        contentType: string;
        body: string;
    };
    toScriptPubKey(publicKeys?: string[]): Buffer | undefined;
    isUnspent(rev: RevString): Promise<boolean>;
}
export { Computer };
