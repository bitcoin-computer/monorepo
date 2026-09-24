import { Computer } from '@bitcoin-computer/lib';
/** Sum of satoshis in wallet address UTXOs plus mod UTXOs (same set used by {@link signAndBroadcastSpendUtxos}). */
export declare function getSpendableUtxosTotalSatoshis(computer: Computer, modSpecs: string[]): Promise<bigint>;
export type SignAndBroadcastSpendUtxosOptions = {
    computer: Computer;
    modSpecs: string[];
    /** When set (non-empty after trim), sends to this address (with change to self, unless `sendMax`). */
    toAddress?: string;
    /** Required when `toAddress` is set and `sendMax` is not true. Ignored when consolidating or sendMax. */
    amountSatoshis?: bigint;
    /** Send entire balance minus fees/dust to `toAddress` (single output, no change). */
    sendMax?: boolean;
};
/**
 * Builds a transaction from wallet + mod UTXOs, signs, and broadcasts.
 * If `toAddress` is empty/omitted, consolidates everything into one output to this wallet (minus fee and minDust).
 * @returns Broadcast transaction id when available.
 */
export declare function signAndBroadcastSpendUtxos(options: SignAndBroadcastSpendUtxosOptions): Promise<string | undefined>;
/** Validate that `address` is a valid output script for the computer's chain/network. */
export declare function isValidAddressForComputer(computer: Computer, address: string): boolean;
