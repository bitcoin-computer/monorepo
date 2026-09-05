import { ParsingPolicyBound, ShouldIndexTx, ShouldParseTx } from './registry.js';
export declare const ADVANCED_TX_FLAG_OFFSET = 10;
export declare const ADVANCED_TX_MARKER_OFFSET: number;
export declare const ADVANCED_TX_MARKER = "00";
export declare const MWEB_ADVANCED_TX_FLAG = "08";
export declare const MWEB_WITNESS_PROGRAM_FLAG = "09";
/**
 * Detects Litecoin MWEB extended-serialization txs (peg-in / hogex) by
 * marker+flag, not flag alone. A legacy tx has no marker/flag; the flag-byte
 * position is the first input's prevout txid and can collide with
 * `MWEB_ADVANCED_TX_FLAG` / `MWEB_WITNESS_PROGRAM_FLAG`.
 */
export declare function isMwebTxHex(hex: string): boolean;
/**
 * Pre-parse filter: skip only when BOTH the advanced-tx marker and a skip
 * flag match. A legacy prevout whose first serialized byte happens to be
 * `08`/`09` must still be parsed.
 */
export declare function skipAdvancedTx(marker: string, skipFlags: string[]): ShouldParseTx;
/**
 * Post-parse filter: skip listed (txId, height) pairs. Without `height`
 * (mempool / ZMQ) always returns true — skip-by-txid-only would drop the
 * first occurrence of a BIP30 duplicate.
 */
export declare function skipTxsAtHeight(skips: {
    txId: string;
    height: number;
}[]): ShouldIndexTx;
/** Bind parse/index hooks once per chain+network (cached). */
export declare function getParsingPolicy(chain: string, network: string): ParsingPolicyBound;
/** Test helper: resolves policy then calls `shouldParse`. */
export declare function shouldParseTransaction(hex: string, chain: string, network: string): boolean;
/** Test helper: resolves policy then calls `shouldIndex`. */
export declare function shouldIndexTransaction({ txId, chain, network, height, }: {
    txId: string;
    chain: string;
    network: string;
    height?: number;
}): boolean;
