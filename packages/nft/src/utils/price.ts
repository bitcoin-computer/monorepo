import { strToBigInt } from '@bitcoin-computer/components'

// The largest value a transaction output can hold.
const MAX_OUTPUT_SATOSHIS = 2n ** 63n - 1n

// Converts a price in whole coins to satoshis without floating point. Rejects
// amounts that are not positive, have more than 8 decimals, or don't fit in a
// transaction output, instead of rounding or failing later.
export function parseListPrice(amount: string): bigint {
  const value = amount.trim()
  if (/[eE]/.test(value)) throw new Error('Enter the price as a plain decimal, e.g. 0.29')
  if ((value.split('.')[1] ?? '').length > 8) throw new Error('Use at most 8 decimal places')

  let satoshis: bigint
  try {
    satoshis = strToBigInt(value)
  } catch {
    throw new Error('Provide a valid amount')
  }
  if (satoshis <= 0n) throw new Error('Provide an amount greater than zero')
  if (satoshis > MAX_OUTPUT_SATOSHIS) throw new Error('Amount is too large')
  return satoshis
}
