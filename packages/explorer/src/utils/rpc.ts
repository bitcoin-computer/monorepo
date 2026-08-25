/**
 * Bitcoind / BCN RPC responses sometimes nest as `{ result }` or `{ result: { result } }`.
 */
export function unwrapRpcResult<T = unknown>(res: unknown): T {
  if (res == null) return res as T
  if (typeof res === 'object' && res !== null && 'result' in res) {
    const inner = (res as { result: unknown }).result
    if (
      inner != null &&
      typeof inner === 'object' &&
      'result' in (inner as object) &&
      !('hash' in (inner as object)) &&
      !('blocks' in (inner as object)) &&
      !('txid' in (inner as object))
    ) {
      return unwrapRpcResult(inner)
    }
    return inner as T
  }
  return res as T
}

export type RpcClient = { rpc: (method: string, params: string) => Promise<unknown> }

export type RpcBlock = {
  hash: string
  height?: number
  time?: number | string
  size?: number | string
  weight?: number | string
  previousblockhash?: string
  nextblockhash?: string
  tx?: Array<string | { txid: string }>
}

export function isHex64(id: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(id.trim())
}

export function isBlockHeight(id: string): boolean {
  return /^\d+$/.test(id.trim())
}

export function txIdOf(txn: string | { txid: string }): string {
  return typeof txn === 'string' ? txn : txn.txid
}

export async function getTipHeight(computer: RpcClient): Promise<number> {
  const res = await computer.rpc('getblockchaininfo', '')
  const info = unwrapRpcResult<{ blocks: number }>(res)
  return Number(info?.blocks) || 0
}

export async function getBlockHashAtHeight(computer: RpcClient, height: number | string): Promise<string> {
  const res = await computer.rpc('getblockhash', `${height}`)
  return String(unwrapRpcResult(res) ?? '')
}

/** verbosity 1: txids only — enough for count, size, time, and neighbor hashes. */
export async function getBlock(computer: RpcClient, hash: string, verbosity = 1): Promise<RpcBlock> {
  const res = await computer.rpc('getblock', `${hash} ${verbosity}`)
  return unwrapRpcResult<RpcBlock>(res)
}

export async function fetchBlockByHeight(
  computer: RpcClient,
  height: number,
): Promise<RpcBlock | null> {
  const hash = await getBlockHashAtHeight(computer, height)
  if (!isHex64(hash)) return null
  const block = await getBlock(computer, hash)
  return {
    ...(block ?? ({} as RpcBlock)),
    hash: block?.hash || hash,
    height: block?.height ?? height,
  }
}

export async function resolveBlockHash(computer: RpcClient, id: string): Promise<string> {
  const trimmed = id.trim()
  if (isHex64(trimmed)) return trimmed.toLowerCase()
  if (isBlockHeight(trimmed)) {
    const hash = await getBlockHashAtHeight(computer, trimmed)
    if (!isHex64(hash)) throw new Error(`No block at height ${trimmed}`)
    return hash.toLowerCase()
  }
  throw new Error('Invalid block id (use 64-char hash or height)')
}

/**
 * Prefer previousblockhash / nextblockhash on the block object.
 * Fall back to getblockhash(height ± 1) when a field is missing (common at the tip).
 */
export async function resolveNeighbors(
  computer: RpcClient,
  block: RpcBlock,
): Promise<{ prevHash?: string; nextHash?: string }> {
  let prevHash =
    typeof block.previousblockhash === 'string' && isHex64(block.previousblockhash)
      ? block.previousblockhash
      : undefined
  let nextHash =
    typeof block.nextblockhash === 'string' && isHex64(block.nextblockhash)
      ? block.nextblockhash
      : undefined

  const height = block.height
  if (height == null || !Number.isFinite(Number(height))) {
    return { prevHash, nextHash }
  }

  const h = Number(height)

  if (!prevHash && h > 0) {
    try {
      const hash = await getBlockHashAtHeight(computer, h - 1)
      if (isHex64(hash)) prevHash = hash
    } catch {
      // leave undefined
    }
  }

  if (!nextHash) {
    try {
      const hash = await getBlockHashAtHeight(computer, h + 1)
      if (isHex64(hash)) nextHash = hash
    } catch {
      // tip block — no next
    }
  }

  return { prevHash, nextHash }
}

export function truncateHex(hex: string, head = 10, tail = 8): string {
  if (!hex || hex.length <= head + tail + 1) return hex
  return `${hex.slice(0, head)}…${hex.slice(-tail)}`
}

/** Truncate a `txid:vout` (or bare hex) for table display. */
export function truncateRev(rev: string, head = 8, tail = 8): string {
  const colon = rev.indexOf(':')
  if (colon === -1) return truncateHex(rev, head, tail)
  return `${truncateHex(rev.slice(0, colon), head, tail)}${rev.slice(colon)}`
}

/**
 * Format bitcoind unix-seconds, millisecond timestamps, or ISO/date strings.
 */
export function formatTime(time: number | string | undefined | null): string {
  if (time === undefined || time === null || time === '') return '—'

  if (typeof time === 'number' || (typeof time === 'string' && /^-?\d+(\.\d+)?$/.test(time.trim()))) {
    const n = typeof time === 'string' ? Number(time) : time
    if (!Number.isFinite(n)) return String(time)
    const ms = Math.abs(n) >= 1e12 ? n : n * 1000
    const d = new Date(ms)
    if (Number.isNaN(d.getTime())) return String(time)
    return d.toLocaleString()
  }

  const d = new Date(time)
  if (Number.isNaN(d.getTime())) return String(time)
  return d.toLocaleString()
}
