import {
  Chain,
  BtcNetwork,
  Mode,
  TransitionJSON,
  TXORecord,
  PublicKeyString,
  Class,
  JsonData,
  RemoteChainConfig,
} from './types.js'
export type InnerTXOQuery = {
  verbosity?: 0 | 1
  limit?: number
  offset?: number
  order?: 'ASC' | 'DESC'
  orderBy?: 'rev'
  publicKey?: PublicKeyString
  exp?: string
  rev?: string
  address?: string
  satoshis?: bigint
  asm?: string
  mod?: string
  isObject?: boolean
  previous?: string
  lteBlockHeight?: number
  gteBlockHeight?: number
  blockHeight?: number
  blockHash?: string
  blockIndex?: number
}
export declare const INNER_TXO_QUERY_KEYS: (keyof InnerTXOQuery)[]
export type ChainRead = {
  chain?: Chain
}
export type InnerComputerOptions = {
  chain: Chain
  network: BtcNetwork
  url: string
  mode?: Mode
  remoteChains?: Partial<Record<Chain, RemoteChainConfig>>
  onCallError?: (err: unknown) => void
}
export declare let lastInnerComputerOpts: InnerComputerOptions | undefined
export declare class InnerComputer {
  private readonly c
  private readonly onCallError?
  private readonly foreignInners
  constructor(opts: InnerComputerOptions)
  private _chainRead
  private _foreignChain
  private _useForeign
  private _foreignInner
  private _tie
  private _replaySuccessor
  sync<T extends Class = any>(location: string): Promise<JsonData<T>>
  sync<T extends Class = any>(location: string, options: ChainRead): Promise<JsonData<T>>
  private _rejectEncryptedEnvelope
  private _syncLocation
  decode(txId: string): Promise<TransitionJSON>
  decode(txId: string, options: ChainRead): Promise<TransitionJSON>
  load(location: string): Promise<Record<string, any>>
  load(location: string, options: ChainRead): Promise<Record<string, any>>
  getAncestors(location: string): Promise<string[]>
  getAncestors(location: string, options: ChainRead): Promise<string[]>
  first(rev: string): Promise<string>
  first(rev: string, options: ChainRead): Promise<string>
  prev(rev: string): Promise<string | undefined>
  prev(rev: string, options: ChainRead): Promise<string | undefined>
  next(rev: string): Promise<string>
  next(rev: string, options: ChainRead): Promise<string>
  last(rev: string): Promise<string>
  last(rev: string, options: ChainRead): Promise<string>
  txIdToBlockTime(txId: string): Promise<bigint>
  txIdToBlockTime(txId: string, options: ChainRead): Promise<bigint>
  txIdToBlockHeight(txId: string): Promise<number>
  txIdToBlockHeight(txId: string, options: ChainRead): Promise<number>
  txIdToBlockHash(txId: string): Promise<string>
  txIdToBlockHash(txId: string, options: ChainRead): Promise<string>
  getBlockHash(height: number): Promise<string>
  getBlockHash(height: number, options: ChainRead): Promise<string>
  getBlockHeight(hash: string): Promise<number>
  getBlockHeight(hash: string, options: ChainRead): Promise<number>
  getRawTransaction(txId: string): Promise<string>
  getRawTransaction(txId: string, options: ChainRead): Promise<string>
  getRawBlock(blockHash: string): Promise<string>
  getRawBlock(blockHash: string, options: ChainRead): Promise<string>
  getBlockHeader(blockHash: string): Promise<string>
  getBlockHeader(blockHash: string, options: ChainRead): Promise<string>
  getTXOs(
    q: InnerTXOQuery & {
      verbosity?: 0
    },
  ): Promise<string[]>
  getTXOs(
    q: InnerTXOQuery & {
      verbosity?: 0
    },
    options: ChainRead,
  ): Promise<string[]>
  getTXOs(
    q: InnerTXOQuery & {
      verbosity: 1
    },
  ): Promise<TXORecord[]>
  getTXOs(
    q: InnerTXOQuery & {
      verbosity: 1
    },
    options: ChainRead,
  ): Promise<TXORecord[]>
  getTXOs(q: InnerTXOQuery): Promise<string[] | TXORecord[]>
  getTXOs(q: InnerTXOQuery, options: ChainRead): Promise<string[] | TXORecord[]>
  getOTXOs(
    q: InnerTXOQuery & {
      verbosity?: 0
    },
  ): Promise<string[]>
  getOTXOs(
    q: InnerTXOQuery & {
      verbosity?: 0
    },
    options: ChainRead,
  ): Promise<string[]>
  getOTXOs(
    q: InnerTXOQuery & {
      verbosity: 1
    },
  ): Promise<TXORecord[]>
  getOTXOs(
    q: InnerTXOQuery & {
      verbosity: 1
    },
    options: ChainRead,
  ): Promise<TXORecord[]>
  getOTXOs(q: InnerTXOQuery): Promise<string[] | TXORecord[]>
  getOTXOs(q: InnerTXOQuery, options: ChainRead): Promise<string[] | TXORecord[]>
}
