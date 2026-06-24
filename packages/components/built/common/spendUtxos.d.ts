import { Computer } from '@bitcoin-computer/lib';
/** Sum of satoshis in wallet address UTXOs plus mod UTXOs (same set used by {@link signAndBroadcastSpendUtxos}). */
export declare function getSpendableUtxosTotalSatoshis(computer: Computer, modSpecs: string[]): Promise<bigint>;
export type SignAndBroadcastSpendUtxosOptions = {
    computer: Computer;
    modSpecs: string[];
    /** When set (non-empty after trim), sends this many satoshis to this address and change to self. */
    toAddress?: string;
    /** Required when `toAddress` is set. Ignored when consolidating to self. */
    amountSatoshis?: bigint;
};
/**
 * Builds a transaction from wallet + mod UTXOs, signs, and broadcasts.
 * If `toAddress` is empty/omitted, consolidates everything into one output to this wallet (minus fee and minDust).
 */
export declare function signAndBroadcastSpendUtxos(options: SignAndBroadcastSpendUtxosOptions): Promise<void>;
