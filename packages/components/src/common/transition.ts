/** Lib error when the current wallet is not in `_readers`. */
export const DECRYPTION_FAILURE = 'Decryption failure'

export type TransitionKind = 'public' | 'encrypted' | 'module' | 'none'

/** How to present a failed `computer.decode` on a transaction page. */
export type DecodeFailureKind = 'encrypted' | 'module' | 'none' | 'error'

export function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string' && err) return err
  return ''
}

export function isDecryptionFailure(err: unknown): boolean {
  return errorMessage(err) === DECRYPTION_FAILURE
}

export function isModuleDeployDecodeError(err: unknown): boolean {
  return /deploys a module/i.test(errorMessage(err))
}

/**
 * Classify Bitcoin Computer on-chain metadata without decrypting.
 *
 * - `{ exp, env, v, ioMap }` → public transition
 * - `{ __cypher, __secrets, ioMap }` → encrypted transition
 * - `{ ept }` → multisig module deploy
 * - empty / missing → not a BC payload (plain payment, taproot module, etc.)
 */
export function classifyTransitionMeta(meta: unknown): TransitionKind {
  if (meta == null || typeof meta !== 'object' || Array.isArray(meta)) return 'none'
  const rec = meta as Record<string, unknown>
  if (rec.__cypher != null || rec.__secrets != null) return 'encrypted'
  if (typeof rec.ept === 'string') return 'module'
  if (typeof rec.exp === 'string') return 'public'
  return 'none'
}

export function readOnChainMeta(tx: { onChainMetaData?: unknown } | null | undefined): unknown {
  if (!tx) return undefined
  try {
    return tx.onChainMetaData
  } catch {
    return undefined
  }
}

/**
 * Prefer protocol metadata; fall back to the decode error.
 * Taproot module deploys have empty `onChainMetaData` but a specific decode error.
 */
export function classifyDecodeFailure(meta: unknown, err: unknown): DecodeFailureKind {
  const kind = classifyTransitionMeta(meta)
  if (kind === 'encrypted' || isDecryptionFailure(err)) return 'encrypted'
  if (kind === 'module' || isModuleDeployDecodeError(err)) return 'module'
  if (kind === 'none') return 'none'
  return 'error'
}
