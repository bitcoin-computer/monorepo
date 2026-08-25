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

export function isHex64(id: string): boolean {
  return /^[0-9a-fA-F]{64}$/.test(id.trim())
}

export function isBlockHash(id: string): boolean {
  return isHex64(id)
}

export function isBlockHeight(id: string): boolean {
  return /^\d+$/.test(id.trim())
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
