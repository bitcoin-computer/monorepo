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
  private _chainArg
  private _foreignChain
  private _useForeign
  private _foreignInner
  private _tie
  sync<T extends Class = any>(location: string): Promise<JsonData<T>>
  sync<T extends Class = any>(location: string, chain: Chain): Promise<JsonData<T>>
  private _syncLocation
  decode(txId: string, chain?: Chain): Promise<TransitionJSON>
  load(location: string, chain?: Chain): Promise<Record<string, any>>
  getAncestors(location: string, chain?: Chain): Promise<string[]>
  first(rev: string, chain?: Chain): Promise<string>
  prev(rev: string, chain?: Chain): Promise<string | undefined>
  next(rev: string, chain?: Chain): Promise<string>
  last(rev: string, chain?: Chain): Promise<string>
  txIdToBlockTime(txId: string, chain?: Chain): Promise<bigint>
  txIdToBlockHeight(txId: string, chain?: Chain): Promise<number>
  txIdToBlockHash(txId: string, chain?: Chain): Promise<string>
  getBlockHash(height: number, chain?: Chain): Promise<string>
  getBlockHeight(hash: string, chain?: Chain): Promise<number>
  getRawTransaction(txId: string, chain?: Chain): Promise<string>
  getRawBlock(blockHash: string, chain?: Chain): Promise<string>
  getBlockHeader(blockHash: string, chain?: Chain): Promise<string>
  getTXOs(
    q: InnerTXOQuery & {
      verbosity?: 0
    },
    chain?: Chain,
  ): Promise<string[]>
  getTXOs(
    q: InnerTXOQuery & {
      verbosity: 1
    },
    chain?: Chain,
  ): Promise<TXORecord[]>
  getTXOs(q: InnerTXOQuery, chain?: Chain): Promise<string[] | TXORecord[]>
  getOTXOs(
    q: InnerTXOQuery & {
      verbosity?: 0
    },
    chain?: Chain,
  ): Promise<string[]>
  getOTXOs(
    q: InnerTXOQuery & {
      verbosity: 1
    },
    chain?: Chain,
  ): Promise<TXORecord[]>
  getOTXOs(q: InnerTXOQuery, chain?: Chain): Promise<string[] | TXORecord[]>
}
