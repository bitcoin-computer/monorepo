/// <reference types="node" />
import {
  Psbt,
  Transaction,
  TxInput,
  TxOutput,
} from "@bitcoin-computer/nakamotojs";

type Json = JBasic | JObject | JArray;
type JBasic = undefined | null | boolean | number | string | symbol | bigint;
type JArray = Json[];
interface JObject {
  [x: string]: Json;
}
type SJson = JBasic | SJObject | SJArray;
type SJArray = SJson[];
interface SJObject {
  [x: string]: SJson;
  _id: string;
  _rev: string;
  _root: string;
  _owners: string[];
  _amount: number;
  _readers?: string[];
  _url?: string;
}

declare class Mock {
  _id: string;
  _rev: string;
  _root: string;
  _amount: number;
  _owners: string[];
  constructor({
    _id,
    _rev,
    _root,
  }?: {
    _id?: string | undefined;
    _rev?: string | undefined;
    _root?: string | undefined;
  });
}

declare class Wallet {
  readonly restClient: RestClient;
  constructor(params?: ComputerOptions);
  derive(subpath?: string): Wallet;
  getBalance(address?: string): Promise<number>;
  getUtxos(address?: string): Promise<_Unspent[]>;
  getDustThreshold(isWitnessProgram: boolean, script?: Buffer): number;
  getAmountThreshold(isWitnessProgram: boolean, script: Buffer): number;
  getUtxosWithOpts({ include, exclude }?: FundOptions): Promise<_Unspent[]>;
  fetchUtxo: ({ txId, vout }: _Unspent) => Promise<Utxo>;
  checkFee(fee: number, size: number): void;
  getSigOpCount(script: Buffer): number;
  getLegacySigOpCount(tx: Transaction): Promise<number>;
  getTransactionSigOpCost(tx: Transaction): Promise<number>;
  getTxSize(txSize: number, nSigOpCost: number, bytesPerSigOp: number): number;
  estimatePsbtSize(tx: Psbt): number;
  fundPsbt(tx: Psbt, opts?: FundOptions): Promise<void>;
  getOutputSpent: (input: TxInput) => Promise<TxOutput>;
  getInputAmount: (tx: Transaction) => Promise<number>;
  getOutputAmount: (tx: Transaction) => number;
  estimateSize(tx: any): Promise<number>;
  estimateFee(tx: any): Promise<number>;
  fund(tx: Transaction, opts?: FundOptions): Promise<void>;
  sign(transaction: Transaction, { inputIndex, sighashType, inputScript }?: SigOptions): Promise<void>;
  broadcast(tx: Transaction): Promise<string>;
  send(satoshis: number, address: string): Promise<string>;
  get hdPrivateKey(): BIP32Interface;
  get privateKey(): Buffer;
  get publicKey(): Buffer;
  get passphrase(): string;
  get path(): string;
  get chain(): TBCChain;
  get network(): TBCNetwork;
  get url(): string;
  get mnemonic(): string;
  get address(): string;
}

declare class UrlFetch {
  baseUrl: string;
  privateKey?: Buffer;
  keyPair: any;
  constructor(baseUrl?: string, keyPair?: any);
  _get<T>(route: string): Promise<T>;
  _post<T1, T2>(route: string, data: T1): Promise<T2>;
  _delete<T>(route: string): Promise<T>;
  retry: (error: any) => boolean;
  get<T>(route: string): Promise<T>;
  post<T1, T2>(route: string, datum: T1): Promise<T2>;
  delete<T>(route: string): Promise<T>;
}

declare class RestClient {
  readonly chain: TBCChain;
  readonly network: TBCNetwork;
  readonly networkObj: any;
  readonly mnemonic: string;
  readonly path: string;
  readonly passphrase: string;
  readonly addressType: AddressType;
  readonly keyPair: BIP32Interface;
  readonly bcn: UrlFetch;
  readonly dustRelayTxFee: number;
  satPerByte: number;
  constructor({ chain, network, mnemonic, path, passphrase, addressType, url, satPerByte, dustRelayFee }?: ComputerOptions);
  rpc(method: string, params: string): Promise<any>;
  broadcast(txHex: string): Promise<string>;
  getBalance(address: string): Promise<number>;
  listTxs(address: string): Promise<_Transaction>;
  getUtxos(address: string): Promise<_Unspent[]>;
  getFormattedUtxos(address: string): Promise<_Unspent[]>;
  getRawTxs(txIds: string[]): Promise<string[]>;
  getTx(txId: string): Promise<_Transaction>;
  query({ publicKey, hash, limit, offset, order, ids, mod }: Partial<Query>): Promise<string[]>;
  idsToRevs(outIds: string[]): Promise<string[]>;
  revToId(rev: string): Promise<string>;
  static getSecretOutput({ _url, keyPair }: {
      _url: string;
      keyPair: BIP32Interface;
  }): Promise<{
      host: string;
      data: string;
  }>;
  static setSecretOutput({ secretOutput, host, keyPair }: {
      secretOutput: SecretOutput;
      host: string;
      keyPair: BIP32Interface;
  }): Promise<Data & (Encrypted | Stored)>;
  static deleteSecretOutput({ _url, keyPair }: {
      _url: string;
      keyPair: BIP32Interface;
  }): Promise<void>;
  faucet(address: string, value: number): Promise<_Unspent>;
  faucetScript(output: Buffer, value: number): Promise<_Unspent>;
  mine(count: number): Promise<void>;
  verify(txo: _Unspent): Promise<void>;
  height(): Promise<number>;
}

type TBCChain = "LTC" | "BTC";
type TBCNetwork = "testnet" | "mainnet" | "regtest";
type Fee = Partial<{
  fee: number;
}>;
type AddressType = 'p2pkh' | 'p2wpkh' | 'p2tr'

type ProgramMetaData = JObject &
  Partial<{
    _amount: number;
    _owners: string[];
    _readers?: string[];
    _url?: string;
  }>;

interface FundOptions {
  fund?: boolean;
  include?: string[];
  exclude?: string[];
}
interface SigOptions {
  sign?: boolean;
  inputIndex?: number;
  sighashType?: number;
  inputScript?: Buffer;
}
interface MockOptions {
  mocks?: {
    [s: string]: Mock;
  };
}
type InscriptionOptions = Partial<{
  commitAmount: number;
  commitFee: number;
  revealAmount: number;
  revealFee: number;
  include: string[];
  exclude: string[];
}>;
type ComputerOptions = Partial<{
  chain: Chain;
  mnemonic: string;
  network: Network;
  passphrase: string;
  path: string;
  seed: string;
  url: string;
  satPerByte: number;
  dustRelayFee: number;
  addressType: AddressType;
}>;

interface SecretOutput {
  data: string;
}
interface TransitionJSON {
  exp: string;
  env: {
    [s: string]: string;
  };
  mod: string;
}
interface Stored {
  _url: string;
}
interface Location {
  _rev: string;
  _root: string;
  _id: string;
  _owners: string[];
  _amount: number;
  _readers?: string[];
  _url?: string;
}
interface Encrypted {
  __cypher: string;
  __secrets: string[];
}

type Data = ProgramMetaData;
type Class = new (...args: any) => any;
type Query = Partial<{
  mod: string;
  publicKey: string;
  limit: number;
  offset: number;
  order: "ASC" | "DESC";
  ids: string[];
  hash: string;
}>;
type UserQuery<T extends Class> = {
  ids: string[];
} | (Partial<{
  mod: string;
  publicKey: string;
  limit: number;
  offset: number;
  order: 'ASC' | 'DESC';
  contract: {
      class: T;
      args?: ConstructorParameters<T>;
  };
}> & {
  ids?: never;
});

interface _Unspent {
  txId: string;
  vout: number;
  satoshis: number;
  rev?: string;
  scriptPubKey?: string;
  amount?: number;
  address?: string;
  height?: number;
}

interface _Input {
  txId: string;
  vout: number;
  script: string;
  sequence: string;
  witness: string[];
}
interface _Output {
  value: number;
  script: string;
  address?: string;
}

interface _Transaction {
  txId: string;
  txHex: string;
  vsize: number;
  version: number;
  locktime: number;
  ins: _Input[];
  outs: _Output[];
}
interface Utxo {
  hash: any;
  index: any;
  nonWitnessUtxo: Buffer;
}
interface Effect {
  res: Json;
  env: JObject;
}

declare class Contract {
  _id: string;
  _rev: string;
  _root: string;
  _amount: number;
  _owners: string[];
  constructor(opts?: {});
}

declare class Computer {
  wallet: Wallet;
  constructor(params?: ComputerOptions);
  new<T extends Class>(constructor: T, args?: ConstructorParameters<T>, mod?: string): Promise<InstanceType<T> & Location>;
  query<T extends Class>(q: UserQuery<T>): Promise<string[]>;
  sync(rev: string): Promise<unknown>;
  encode(json: Partial<TransitionJSON & FundOptions & SigOptions & MockOptions>): Promise<{
      tx: Transaction;
      effect: Effect;
  }>;
  encodeNew<T extends Class>({ constructor, args, mod }: {
      constructor: T;
      args: ConstructorParameters<T>;
      mod?: string;
      root?: string;
  }): Promise<{
      tx: Transaction;
      effect: Effect;
  }>;
  encodeCall<T extends Class, K extends keyof InstanceType<T>>({ target, property, args, mod }: {
      target: InstanceType<T> & Location;
      property: string;
      args: Parameters<InstanceType<T>[K]>;
      mod?: string;
  }): Promise<{
      tx: Transaction;
      effect: Effect;
  }>;
  decode(transaction: Transaction): Promise<TransitionJSON>;
  deploy(module: string, opts?: Partial<InscriptionOptions>): Promise<string>;
  load(rev: string): Promise<ModuleExportsNamespace>;
  listTxs(address?: string): Promise<import("./types")._Transaction>;
  getUtxos(address?: string): Promise<string[]>;
  getBalance(address?: string): Promise<number>;
  sign(transaction: Transaction, opts?: SigOptions): Promise<void>;
  fund(tx: Transaction, opts?: Fee & FundOptions): Promise<void>;
  send(satoshis: number, address: string): Promise<string>;
  broadcast(tx: Transaction): Promise<string>;
  rpcCall(method: string, params: string): Promise<any>;
  txFromHex({ hex }: {
      hex: string;
  }): Promise<TBCTransaction>;
  getChain(): TBCChain;
  getNetwork(): TBCNetwork;
  getMnemonic(): string;
  getPrivateKey(): string;
  getPassphrase(): string;
  getPath(): string;
  getUrl(): string;
  getPublicKey(): string;
  getAddress(): string;
  getAddressType(): string;
  getFee(): number;
  setFee(fee: number): void;
  faucet(amount: number, address?: string): Promise<_Unspent>;
  static getInscription(rawTx: string, index: number): {
      contentType: string;
      body: string;
  };
  toScriptPubKey(publicKeys?: string[]): Buffer | undefined;
  static lockdown(opts?: any): void;
  delete(inRevs: string[]): Promise<string>;
  export(module: string, opts?: Partial<InscriptionOptions>): Promise<string>;
  import(rev: string): Promise<ModuleExportsNamespace>;
  queryRevs(q: Query): Promise<string[]>;
  getOwnedRevs(publicKey?: Buffer): Promise<string[]>;
  getRevs(publicKey?: Buffer): Promise<string[]>;
  getLatestRevs(ids: string[]): Promise<string[]>;
  getLatestRev(id: string): Promise<string>;
  idsToRevs(ids: string[]): Promise<string[]>;
  getMinimumFees(): number;
}

export { Computer, Contract, Mock };
