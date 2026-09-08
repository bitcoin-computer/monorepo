import { isHex64 } from './utils/rpc'

export function tryGet<T>(fn: () => T, fallback: T): T {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const getValueForType = (type: string, stringValue: string) => {
  switch (type) {
    case 'number':
      return Number(stringValue)
    case 'string':
      return stringValue
    case 'boolean':
      return stringValue === 'true' || stringValue === '1'
    case 'bigint': {
      const cleaned = stringValue.trim().replace(/n$/i, '')
      return BigInt(cleaned || '0')
    }
    case 'undefined':
      return undefined
    case 'null':
      return null
    case 'object':
      try {
        return JSON.parse(stringValue)
      } catch {
        return stringValue
      }
    default:
      return stringValue
  }
}

export const isPossibleCryptoAddress = (address: string): boolean => {
  const p2pkhRegex = /^[1mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  const p2shRegex = /^[23][a-km-zA-HJ-NP-Z1-9]{25,34}$/
  const bech32Regex = /^(bc1|ltc1|doge1|dc1|t[a-z]{2})[a-z0-9]{6,80}$/
  return p2pkhRegex.test(address) || p2shRegex.test(address) || bech32Regex.test(address)
}

/** Bitcoin transaction id: 32-byte hex (64 chars). */
export const isTxId = isHex64

/**
 * True for unambiguous public keys only.
 *
 * - Compressed: 33 bytes (66 hex), prefix 02/03
 * - Uncompressed: 65 bytes (130 hex), prefix 04
 *
 * Note: 32-byte (64 hex) x-only keys collide with txids. Explorers must prefer
 * txid for bare 64-hex input; use an explicit `publicKey` query for x-only keys.
 */
export const isValidHexadecimalPublicKey = (publicKey: string): boolean => {
  if (!publicKey) return false
  const trimmed = publicKey.trim()
  if (trimmed.length === 66 && /^(02|03)[0-9a-fA-F]{64}$/.test(trimmed)) return true
  if (trimmed.length === 130 && /^04[0-9a-fA-F]{128}$/.test(trimmed)) return true
  return false
}
