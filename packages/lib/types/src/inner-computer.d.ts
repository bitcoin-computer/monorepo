import {
  Chain,
  BtcNetwork,
  TransitionJSON,
  TXORecord,
  PublicKeyString,
  Class,
  JsonData,
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
export declare class InnerComputer {
  private readonly c
  constructor({ chain, network, url }: { chain: Chain; network: BtcNetwork; url: string })
  private _invalidate
  private _safeCall
  private _ensureConfirmedTx
  private _ensureConfirmedLocation
  private _getIndexedTip
  private _assertNonNegativeInt
  sync<T extends Class = any>(location: string): Promise<JsonData<T>>
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
  private _stabilizerFingerprint
  private _readTXOs
}
