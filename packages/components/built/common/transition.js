/** Lib error when the current wallet is not in `_readers`. */
export const DECRYPTION_FAILURE = 'Decryption failure';
export function errorMessage(err) {
    if (err instanceof Error && err.message)
        return err.message;
    if (typeof err === 'string' && err)
        return err;
    return '';
}
export function isDecryptionFailure(err) {
    return errorMessage(err) === DECRYPTION_FAILURE;
}
export function isModuleDeployDecodeError(err) {
    return /deploys a module/i.test(errorMessage(err));
}
/**
 * Classify Bitcoin Computer on-chain metadata without decrypting.
 *
 * - `{ exp, env, v, ioMap }` → public transition
 * - `{ __cypher, __secrets, ioMap }` → encrypted transition
 * - `{ ept }` → multisig module deploy
 * - empty / missing → not a BC payload (plain payment, taproot module, etc.)
 */
export function classifyTransitionMeta(meta) {
    if (meta == null || typeof meta !== 'object' || Array.isArray(meta))
        return 'none';
    const rec = meta;
    if (rec.__cypher != null || rec.__secrets != null)
        return 'encrypted';
    if (typeof rec.ept === 'string')
        return 'module';
    if (typeof rec.exp === 'string')
        return 'public';
    return 'none';
}
export function readOnChainMeta(tx) {
    if (!tx)
        return undefined;
    try {
        return tx.onChainMetaData;
    }
    catch {
        return undefined;
    }
}
/**
 * Prefer protocol metadata; fall back to the decode error.
 * Taproot module deploys have empty `onChainMetaData` but a specific decode error.
 */
export function classifyDecodeFailure(meta, err) {
    const kind = classifyTransitionMeta(meta);
    if (kind === 'encrypted' || isDecryptionFailure(err))
        return 'encrypted';
    if (kind === 'module' || isModuleDeployDecodeError(err))
        return 'module';
    if (kind === 'none')
        return 'none';
    return 'error';
}
