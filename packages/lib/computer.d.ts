/// <reference types="node" />
import { Psbt, TxInput, TxOutput, Transaction as nTransaction } from '@bitcoin-computer/nakamotojs'
import { BIP32Interface } from 'bip32'

type TxType = {
  ins?: TxInput[]
  outs?: TxOutput[]
  version?: number
  locktime?: number
}

type Json = JBasic | JObject | JArray
type JBasic = undefined | null | boolean | number | string | symbol | bigint
type JArray = Json[]
type JObject = {
  [x: string]: Json
}
type SJson = JBasic | SJObject | SJArray
type SJArray = SJson[]
type SJObject = {
  [x: string]: SJson
  _id: string
  _rev: string
  _root: string
  _owners: string | string[]
  _satoshis: bigint
  _readers?: string[]
  _url?: string
}

declare class Mock {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]
  constructor({
    _id,
    _rev,
    _root,
  }?: {
    _id?: string | undefined
    _rev?: string | undefined
    _root?: string | undefined
  })
}

declare class Update {
  inRevs: string[]
  ownerData: UpdateMetaData[]
  metaData: TransitionJSON
  txId?: string
  constructor({
    inRevs,
    ownerData,
    metaData,
    txId,
  }?: {
    inRevs?: string[]
    ownerData?: UpdateMetaData[]
    metaData?: TransitionJSON
    txId?: string
  })
  get preOutRevs(): Json[]
  get postOutRevs(): string[]
  get ioMap(): number[]
  zip(): [string, string][]
  static fromTxId(txId: string, wallet: Wallet): Promise<Update>
  static fromTx(tx: Transaction, { keyPair }: RestClient): Promise<Update>
  toTx(wallet: Wallet): Promise<Transaction>
  broadcast(wallet: Wallet): Promise<string[]>
  isValid(fromTx: Update): boolean
}

type TBCChain = 'LTC' | 'BTC' | 'PEPE' | string
type TBCNetwork = 'testnet' | 'mainnet' | 'regtest' | string
type Fee = Partial<{
  fee: number
}>
type AddressType = 'p2pkh' | 'p2wpkh' | 'p2tr'
type OwnerData = {
  _satoshis: bigint
  _owners: string | string[]
  _readers?: string[]
  _url?: string
}
type ProgramMetaData = JObject &
  Partial<
    OwnerData & {
      ioMap: number[]
    }
  >
type UpdateMetaData = ProgramMetaData & {
  outScriptBuf?: Buffer
}
type VerifyOptions = {
  txUpdate?: Update
}
type FundOptions = {
  fund?: boolean
  include?: string[]
  exclude?: string[]
}
type SigOptions = {
  sign?: boolean
  inputIndex?: number
  sighashType?: number
  inputScript?: Buffer
}
type MockOptions = {
  mocks?: {
    [s: string]: Mock
  }
}
type ModuleStorageType = 'multisig' | 'taproot'
type ModuleOptions = Partial<{
  commitAmount: number
  commitFee: number
  revealAmount: number
  revealFee: number
  include: string[]
  exclude: string[]
}>
type ComputerOptions = Partial<{
  chain: TBCChain
  mnemonic: string
  network: TBCNetwork
  passphrase: string
  path: string
  seed: string
  url: string
  satPerByte: number
  dustRelayFee: number
  addressType: AddressType
  moduleStorageType: ModuleStorageType
  thresholdBytes: number
  cache: boolean
}>
type Rev = {
  _rev: string
}
interface ParsedRev {
  txId: string
  outputIndex: number
}
interface ParsedMockedRev {
  txId: string
  outputIndex: number | string
  isMockedRev: boolean
}
interface SecretOutput {
  data: string
}
type TransitionJSON = {
  exp: string
  env: {
    [s: string]: string
  }
  mod: string
}
type Stored = {
  _url: string
}
type Location = {
  _rev: string
  _root: string
  _id: string
  _owners: string[] | string
  _satoshis: bigint
  _readers?: string[]
  _url?: string
}
type Encrypted = {
  __cypher: string
  __secrets: string[]
  ioMap?: number[]
}
type Transition = {
  exp: string
  env: {
    [s: string]: string
  }
  mod: string
}
type Data = ProgramMetaData
type SmartObj = Location & Data
type Class = new (...args: any) => any
type Query = Partial<{
  mod: string
  publicKey: string
  limit: number
  offset: number
  order: 'ASC' | 'DESC'
  ids: string[]
}>
type UserQuery = Partial<{
  mod: string
  publicKey: string
  limit: number
  offset: number
  order: 'ASC' | 'DESC'
  ids: string[]
}>
interface Tapleaf {
  output: Buffer
  version?: number
}
type Taptree = [Taptree | Tapleaf, Taptree | Tapleaf] | Tapleaf
interface _Bip32 {
  public: number
  private: number
}
interface _Network {
  messagePrefix: string
  bech32: string
  bip32: _Bip32
  pubKeyHash: number
  scriptHash: number
  wif: number
}
interface _Balance {
  confirmed: bigint
  unconfirmed: bigint
  balance: bigint
}
interface _Unspent {
  txId: string
  vout: number
  satoshis: bigint
  amount?: bigint
  rev?: string
  scriptPubKey?: string
  address?: string
  height?: number
}
interface _Input {
  txId: string
  vout: number
  script: string
  sequence: string
  witness: string[]
}
interface _Output {
  value: number
  script: string
  address?: string
}
interface _Request {
  method?: string
  url?: string
  body?: string
}
interface _Transaction {
  txId: string
  txHex: string
  vsize: number
  version: number
  locktime: number
  ins: _Input[]
  outs: _Output[]
}
type StringOrArray<T> = string | Array<StringOrArray<T>>
type Utxo = {
  hash: any
  index: any
  nonWitnessUtxo: Buffer
}
type Effect = {
  res: Json
  env: JObject
}

type TxIdAmountType = {
  txId: string
  inputsSatoshis: bigint
  outputsSatoshis: bigint
  satoshis: bigint
}

declare class RestClient {
  readonly chain: TBCChain
  readonly network: TBCNetwork
  readonly networkObj: Network
  readonly mnemonic: string
  readonly path: string
  readonly passphrase: string
  readonly addressType: AddressType
  readonly keyPair: BIP32Interface
  readonly bcn: UrlFetch
  readonly dustRelayTxFee: number
  readonly moduleStorageType: ModuleStorageType
  readonly rpcClient: any
  satPerByte: number
  constructor(params?: ComputerOptions)
  rpc(method: string, params: string): Promise<any>
  broadcast(txHex: string): Promise<string>
  getBalance(address: string): Promise<_Balance>
  listTxs(address: string): Promise<{
    sentTxs: TxIdAmountType[]
    receivedTxs: TxIdAmountType[]
  }>
  getUtxos(address?: string): Promise<_Unspent[]>
  getFormattedUtxos(address: string): Promise<_Unspent[]>
  getRawTxs(txIds: string[]): Promise<string[]>
  getTx(txId: string): Promise<_Transaction>
  getAncestors(txId: string): Promise<string[]>
  query({ publicKey, limit, offset, order, ids, mod }: Partial<Query>): Promise<string[]>
  idsToRevs(outIds: string[]): Promise<string[]>
  revToId(rev: string): Promise<string>
  static getSecretOutput({ _url, keyPair }: { _url: string; keyPair: BIP32Interface }): Promise<{
    host: string
    data: string
  }>
  static setSecretOutput({
    secretOutput,
    host,
    keyPair,
  }: {
    secretOutput: SecretOutput
    host: string
    keyPair: BIP32Interface
  }): Promise<Data & (Encrypted | Stored)>
  static deleteSecretOutput({
    _url,
    keyPair,
  }: {
    _url: string
    keyPair: BIP32Interface
  }): Promise<void>
  faucet(address: string, value: number): Promise<_Unspent>
  faucetScript(script: Buffer, value: number): Promise<_Unspent>
  mine(count: number): Promise<void>
  verify(txo: _Unspent): Promise<void>
  height(): Promise<number>
  next(rev: string): Promise<string | undefined>
  prev(rev: string): Promise<string | undefined>
}

declare class Wallet {
  readonly restClient: RestClient
  constructor(params?: ComputerOptions)
  derive(subpath?: string): Wallet
  getBalance(address?: string): Promise<_Balance>
  getUtxos(address?: string): Promise<_Unspent[]>
  getDustThreshold(isWitnessProgram: boolean, script?: Buffer): number
  getAmountThreshold(script: Buffer, isWitnessProgram?: boolean): number
  getUtxosWithOpts({ include, exclude }?: FundOptions): Promise<_Unspent[]>
  fetchUtxo: ({ txId, vout }: _Unspent) => Promise<Utxo>
  checkFee(fee: number, size: number): void
  getSigOpCount(script: Buffer): number
  getLegacySigOpCount(tx: Transaction): Promise<number>
  getTransactionSigOpCost(tx: Transaction): Promise<number>
  getTxSize(txSize: number, nSigOpCost: number, bytesPerSigOp: number): number
  estimatePsbtSize(tx: Psbt): number
  fundPsbt(tx: Psbt, opts?: FundOptions): Promise<void>
  getOutputSpent: (input: TxInput) => Promise<TxOutput>
  getInputAmount: (tx: nTransaction) => Promise<bigint>
  getOutputAmount: (tx: nTransaction) => bigint
  estimateSize(tx: any): Promise<number>
  estimateFee(tx: any): Promise<number>
  fund(tx: nTransaction, opts?: FundOptions): Promise<void>
  sign(transaction: nTransaction, sigOptions?: SigOptions): Promise<void>
  broadcast(tx: nTransaction): Promise<string>
  send(satoshis: bigint, address: string): Promise<string>
  get hdPrivateKey(): BIP32Interface
  get privateKey(): Buffer
  get publicKey(): Buffer
  get passphrase(): string
  get path(): string
  get chain(): TBCChain
  get network(): TBCNetwork
  get url(): string
  get mnemonic(): string
  get address(): string
}

declare class Transaction extends nTransaction {
  constructor({ ins, outs, version, locktime }?: TxType)
  get txId(): string
  get inputs(): string[]
  get ioDescriptor(): number[]
  get ownerInputsLength(): number
  get ownerOutputsLength(): number
  get maxDataIndex(): number
  get dataOutputs(): TxOutput[]
  get ownerInputs(): TxInput[]
  get ownerOutputs(): TxOutput[]
  get inRevs(): string[]
  get outRevs(): string[]
  get onChainMetaData(): ProgramMetaData
  get ownerData(): {
    outScriptBuf: Buffer
    _owners: string | string[]
    _satoshis: bigint
  }[]
  get ioMap(): number[]
  get zip(): string[][]
  spendFromData(inputRevs: string[]): void
  createDataOuts(ownerData: ProgramMetaData[], metaData: any, wallet: Wallet): void
  static fromBuffer(buffer: Buffer): Transaction
  static fromHex(hex: string): Transaction
  static fromTransaction(tx: nTransaction): Transaction
  static fromTxId({
    txId,
    restClient,
  }: {
    txId: string
    restClient: RestClient
  }): Promise<Transaction>
  clone(): Transaction
  static deserialize(s: string): Transaction
}

declare class Contract {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]
  constructor(opts?: {})
}

declare class Computer {
  wallet: Wallet
  memory?: Memory
  constructor(params?: ComputerOptions)
  new<T extends Class>(
    constructor: T,
    args: ConstructorParameters<T>,
    mod?: string,
  ): Promise<InstanceType<T> & Location>
  query(q: UserQuery): Promise<string[]>
  sync(rev: string): Promise<unknown>
  wrappedEncode(
    transition: Transition,
    opts?: VerifyOptions & FundOptions & SigOptions & MockOptions,
  ): Promise<{
    effect: Effect
    tx: Transaction
    update: Update
    memory: Memory
  }>
  encode(json: Partial<TransitionJSON & FundOptions & SigOptions & MockOptions>): Promise<{
    tx: Transaction
    effect: Effect
  }>
  encodeNew<T extends Class>({
    constructor,
    args,
    mod,
  }: {
    constructor: T
    args: ConstructorParameters<T>
    mod?: string
  }): Promise<{
    tx: Transaction
    effect: Effect
    update: Update
    memory: Memory
  }>
  encodeCall<T extends Class, K extends keyof InstanceType<T>>({
    target,
    property,
    args,
    mod,
  }: {
    target: InstanceType<T> & Location
    property: string
    args: Parameters<InstanceType<T>[K]>
    mod?: string
  }): Promise<{
    tx: Transaction
    effect: Effect
  }>
  decode(tx: Transaction): Promise<TransitionJSON>
  deploy(module: string, opts?: Partial<ModuleOptions>): Promise<string>
  load(rev: string): Promise<ModuleExportsNamespace>
  listTxs(address?: string): Promise<{ sentTxs: TxIdAmountType[]; receivedTxs: TxIdAmountType[] }>
  getUtxos(address?: string): Promise<string[]>
  getBalance(address?: string): Promise<_Balance>
  sign(transaction: nTransaction, opts?: SigOptions): Promise<void>
  fund(tx: nTransaction, opts?: Fee & FundOptions): Promise<void>
  send(satoshis: bigint, address: string): Promise<string>
  broadcast(tx: nTransaction): Promise<string>
  rpcCall(method: string, params: string): Promise<any>
  static txFromHex({ hex }: { hex: string }): Transaction
  getChain(): TBCChain
  getNetwork(): TBCNetwork
  getMnemonic(): string
  getPrivateKey(): string
  getPassphrase(): string
  getPath(): string
  getUrl(): string
  getPublicKey(): string
  getAddress(): string
  getAddressType(): string
  getFee(): number
  setFee(fee: number): void
  faucet(amount: number, address?: string): Promise<_Unspent>
  static getVersion(): string
  static getInscription(
    rawTx: string,
    index: number,
  ): {
    contentType: string
    body: string
  }
  toScriptPubKey(publicKeys?: string[]): Buffer | undefined
  static lockdown(opts?: any): void
  delete(inRevs: string[]): Promise<string>
  isUnspent(rev: string): Promise<boolean>
  next(rev: string): Promise<string | undefined>
  prev(rev: string): Promise<string | undefined>
  subscribe(
    id: string,
    onMessage: ({ rev, hex }: { rev: string; hex: string }) => void,
    onError?: (error: Event) => void,
  ): Promise<() => void>
  export(module: string, opts?: Partial<ModuleOptions>): Promise<string>
  import(rev: string): Promise<ModuleExportsNamespace>
  queryRevs(q: Query): Promise<string[]>
  getOwnedRevs(publicKey?: Buffer): Promise<string[]>
  getRevs(publicKey?: Buffer): Promise<string[]>
  getLatestRevs(ids: string[]): Promise<string[]>
  getLatestRev(id: string): Promise<string>
  idsToRevs(ids: string[]): Promise<string[]>
  getMinimumFees(): number
}

export { Computer, Contract, Mock, Transaction }
