import {
  getNetworkConfig,
  ParsingPolicyBound,
  ShouldIndexTx,
  ShouldParseTx,
} from './registry.js';

const policyCache = new Map<string, ParsingPolicyBound>();

const alwaysParse: ShouldParseTx = () => true;
const alwaysIndex: ShouldIndexTx = () => true;

// Extended serialization: version(4B) | marker(1B, must be 0x00) | flag(1B) | ...
// Offsets are hex character indices (2 chars per byte).
export const ADVANCED_TX_FLAG_OFFSET = 10;
export const ADVANCED_TX_MARKER_OFFSET = ADVANCED_TX_FLAG_OFFSET - 2;
export const ADVANCED_TX_MARKER = '00';
export const MWEB_ADVANCED_TX_FLAG = '08';
export const MWEB_WITNESS_PROGRAM_FLAG = '09';

/**
 * Detects Litecoin MWEB extended-serialization txs (peg-in / hogex) by
 * marker+flag, not flag alone. A legacy tx has no marker/flag; the flag-byte
 * position is the first input's prevout txid and can collide with
 * `MWEB_ADVANCED_TX_FLAG` / `MWEB_WITNESS_PROGRAM_FLAG`.
 */
export function isMwebTxHex(hex: string): boolean {
  if (
    hex.slice(ADVANCED_TX_MARKER_OFFSET, ADVANCED_TX_FLAG_OFFSET) !==
    ADVANCED_TX_MARKER
  ) {
    return false;
  }
  const flag = hex.slice(
    ADVANCED_TX_FLAG_OFFSET,
    ADVANCED_TX_FLAG_OFFSET + 2,
  );
  return (
    flag === MWEB_ADVANCED_TX_FLAG || flag === MWEB_WITNESS_PROGRAM_FLAG
  );
}

/**
 * Pre-parse filter: skip only when BOTH the advanced-tx marker and a skip
 * flag match. A legacy prevout whose first serialized byte happens to be
 * `08`/`09` must still be parsed.
 */
export function skipAdvancedTx(
  marker: string,
  skipFlags: string[],
): ShouldParseTx {
  const expectedMarker = marker.toLowerCase();
  const flags = new Set(skipFlags.map(f => f.toLowerCase()));
  return (hex: string): boolean => {
    if (hex.length < ADVANCED_TX_FLAG_OFFSET + 2) return true;
    if (
      hex
        .slice(ADVANCED_TX_MARKER_OFFSET, ADVANCED_TX_FLAG_OFFSET)
        .toLowerCase() !== expectedMarker
    ) {
      return true;
    }
    return !flags.has(
      hex
        .slice(ADVANCED_TX_FLAG_OFFSET, ADVANCED_TX_FLAG_OFFSET + 2)
        .toLowerCase(),
    );
  };
}

/**
 * Post-parse filter: skip listed (txId, height) pairs. Without `height`
 * (mempool / ZMQ) always returns true — skip-by-txid-only would drop the
 * first occurrence of a BIP30 duplicate.
 */
export function skipTxsAtHeight(
  skips: { txId: string; height: number }[],
): ShouldIndexTx {
  const byHeight = new Map<number, Set<string>>();
  for (const skip of skips) {
    const id = skip.txId.toLowerCase();
    let set = byHeight.get(skip.height);
    if (!set) {
      set = new Set();
      byHeight.set(skip.height, set);
    }
    set.add(id);
  }
  return ({ txId, height }): boolean => {
    if (height === undefined) return true;
    const set = byHeight.get(height);
    if (!set) return true;
    return !set.has(txId.toLowerCase());
  };
}

/** Bind parse/index hooks once per chain+network (cached). */
export function getParsingPolicy(
  chain: string,
  network: string,
): ParsingPolicyBound {
  const key = `${chain}:${network}`;
  const cached = policyCache.get(key);
  if (cached) return cached;
  const parsing = getNetworkConfig(chain, network).parsing;
  const bound: ParsingPolicyBound = Object.freeze({
    shouldParse: parsing?.shouldParse ?? alwaysParse,
    shouldIndex: parsing?.shouldIndex ?? alwaysIndex,
  });
  policyCache.set(key, bound);
  return bound;
}

/** Test helper: resolves policy then calls `shouldParse`. */
export function shouldParseTransaction(
  hex: string,
  chain: string,
  network: string,
): boolean {
  return getParsingPolicy(chain, network).shouldParse(hex);
}

/** Test helper: resolves policy then calls `shouldIndex`. */
export function shouldIndexTransaction({
  txId,
  chain,
  network,
  height,
}: {
  txId: string;
  chain: string;
  network: string;
  height?: number;
}): boolean {
  return getParsingPolicy(chain, network).shouldIndex({ txId, height });
}
