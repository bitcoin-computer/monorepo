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
  private _useForeign
  private _foreignInner
  private _tie
  sync<T extends Class = any>(location: string): Promise<JsonData<T>>
  sync<T extends Class = any>(location: string, chain: Chain): Promise<JsonData<T>>
  private _syncLocation
  decode(txId: string): Promise<TransitionJSON>
  load(location: string): Promise<Record<string, any>>
  getAncestors(location: string): Promise<string[]>
  first(rev: string): Promise<string>
  prev(rev: string): Promise<string | undefined>
  next(rev: string): Promise<string>
  last(rev: string): Promise<string>
  txIdToBlockTime(txId: string): Promise<bigint>
  txIdToBlockHeight(txId: string): Promise<number>
  txIdToBlockHash(txId: string): Promise<string>
  getBlockHash(height: number): Promise<string>
  getBlockHeight(hash: string): Promise<number>
  getRawTransaction(txId: string): Promise<string>
  getRawBlock(blockHash: string): Promise<string>
  getBlockHeader(blockHash: string): Promise<string>
  getTXOs(
    q: InnerTXOQuery & {
      verbosity?: 0
    },
  ): Promise<string[]>
  getTXOs(
    q: InnerTXOQuery & {
      verbosity: 1
    },
  ): Promise<TXORecord[]>
  getOTXOs(
    q: InnerTXOQuery & {
      verbosity?: 0
    },
  ): Promise<string[]>
  getOTXOs(
    q: InnerTXOQuery & {
      verbosity: 1
    },
  ): Promise<TXORecord[]>
}
