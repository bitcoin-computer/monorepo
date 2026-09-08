/** Lib error when the current wallet is not in `_readers`. */
export declare const DECRYPTION_FAILURE = "Decryption failure";
export type TransitionKind = 'public' | 'encrypted' | 'module' | 'none';
/** How to present a failed `computer.decode` on a transaction page. */
export type DecodeFailureKind = 'encrypted' | 'module' | 'none' | 'error';
export declare function errorMessage(err: unknown): string;
export declare function isDecryptionFailure(err: unknown): boolean;
export declare function isModuleDeployDecodeError(err: unknown): boolean;
/**
 * Classify Bitcoin Computer on-chain metadata without decrypting.
 *
 * - `{ exp, env, v, ioMap }` → public transition
 * - `{ __cypher, __secrets, ioMap }` → encrypted transition
 * - `{ ept }` → multisig module deploy
 * - empty / missing → not a BC payload (plain payment, taproot module, etc.)
 */
export declare function classifyTransitionMeta(meta: unknown): TransitionKind;
export declare function readOnChainMeta(tx: {
    onChainMetaData?: unknown;
} | null | undefined): unknown;
/**
 * Prefer protocol metadata; fall back to the decode error.
 * Taproot module deploys have empty `onChainMetaData` but a specific decode error.
 */
export declare function classifyDecodeFailure(meta: unknown, err: unknown): DecodeFailureKind;
