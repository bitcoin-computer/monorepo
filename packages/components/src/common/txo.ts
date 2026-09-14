/** Minimal client for looking up an indexed output without evaluating it. */
export type TxoLookupClient = {
  getTXOs(q: { rev: string; verbosity: 1 }): Promise<Array<{ isObject?: boolean }>>
}

/**
 * Index lookup for whether `rev` holds a smart object.
 * Returns `true` / `false` from the node, or `undefined` when the output is
 * not indexed yet or the request fails. Does not call `sync`.
 */
export async function lookupIsObject(
  computer: TxoLookupClient,
  rev: string,
): Promise<boolean | undefined> {
  if (!rev) return undefined
  try {
    const rows = await computer.getTXOs({ rev, verbosity: 1 as const })
    const flag = rows[0]?.isObject
    return typeof flag === 'boolean' ? flag : undefined
  } catch {
    return undefined
  }
}
