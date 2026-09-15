import { Computer, Transaction } from '@bitcoin-computer/lib'
import { address as bAddress, networks } from '@bitcoin-computer/nakamotojs'

async function listSpendableUtxos(computer: Computer, modSpecs: string[]) {
  const utxos = await computer.getUTXOs({
    address: computer.getAddress(),
    verbosity: 1,
    isObject: false,
  })

  const modUtxosArrays = await Promise.all(
    modSpecs.map((mod) =>
      computer.getUTXOs({
        publicKey: computer.getPublicKey(),
        mod,
        verbosity: 1,
      }),
    ),
  )
  const allModUtxos = modUtxosArrays.flat()

  const totalSatoshis =
    utxos.reduce((acc, u) => acc + u.satoshis, 0n) +
    allModUtxos.reduce((acc, u) => acc + u.satoshis, 0n)

  return { utxos, allModUtxos, totalSatoshis }
}

/** Sum of satoshis in wallet address UTXOs plus mod UTXOs (same set used by {@link signAndBroadcastSpendUtxos}). */
export async function getSpendableUtxosTotalSatoshis(
  computer: Computer,
  modSpecs: string[],
): Promise<bigint> {
  const { totalSatoshis } = await listSpendableUtxos(computer, modSpecs)
  return totalSatoshis
}

export type SignAndBroadcastSpendUtxosOptions = {
  computer: Computer
  modSpecs: string[]
  /** When set (non-empty after trim), sends to this address (with change to self, unless `sendMax`). */
  toAddress?: string
  /** Required when `toAddress` is set and `sendMax` is not true. Ignored when consolidating or sendMax. */
  amountSatoshis?: bigint
  /** Send entire balance minus fees/dust to `toAddress` (single output, no change). */
  sendMax?: boolean
}

/**
 * Builds a transaction from wallet + mod UTXOs, signs, and broadcasts.
 * If `toAddress` is empty/omitted, consolidates everything into one output to this wallet (minus fee and minDust).
 * @returns Broadcast transaction id when available.
 */
export async function signAndBroadcastSpendUtxos(
  options: SignAndBroadcastSpendUtxosOptions,
): Promise<string | undefined> {
  const { computer, modSpecs } = options
  const trimmedTo = options.toAddress?.trim() ?? ''
  const hasRecipient = trimmedTo.length > 0
  const sendMax = Boolean(options.sendMax)

  if (hasRecipient && !sendMax) {
    if (options.amountSatoshis === undefined || options.amountSatoshis <= 0n) {
      throw new Error('amountSatoshis is required and must be positive when sending to an address')
    }
  }
  if (sendMax && !hasRecipient) {
    throw new Error('toAddress is required when sendMax is true')
  }

  const {
    utxos,
    allModUtxos,
    totalSatoshis: totalInput,
  } = await listSpendableUtxos(computer, modSpecs)

  const tx = new Transaction()

  utxos.forEach((utxo) => {
    const prevHash = Buffer.from(utxo.rev.split(':')[0], 'hex').reverse()
    tx.addInput(prevHash, Number(utxo.rev.split(':')[1]))
  })

  allModUtxos.forEach((utxo) => {
    const prevHash = Buffer.from(utxo.rev.split(':')[0], 'hex').reverse()
    tx.addInput(prevHash, Number(utxo.rev.split(':')[1]))
  })

  if (totalInput <= 0n) {
    throw new Error('No spendable UTXOs to include in the transaction.')
  }

  const networkObj = networks.getNetwork(computer.getChain(), computer.getNetwork())
  const changeScript = bAddress.toOutputScript(computer.getAddress().toString(), networkObj)
  const minDust = BigInt(computer.db.wallet.getDustThreshold(false, Buffer.from('')))

  if (!hasRecipient) {
    tx.addOutput(changeScript, totalInput)
    const estimatedFees = BigInt(await computer.db.wallet.estimateFee(tx))
    const outValue = totalInput - estimatedFees - minDust
    if (outValue < minDust) {
      throw new Error(
        'Balance is too low to cover network fees and the minimum output size after consolidation.',
      )
    }
    tx.updateOutput(0, { value: outValue })
  } else {
    let recipientScript: Buffer
    try {
      recipientScript = bAddress.toOutputScript(trimmedTo, networkObj)
    } catch {
      throw new Error('Invalid recipient address for this network.')
    }

    if (sendMax) {
      tx.addOutput(recipientScript, totalInput)
      const estimatedFees = BigInt(await computer.db.wallet.estimateFee(tx))
      const outValue = totalInput - estimatedFees - minDust
      if (outValue < minDust) {
        throw new Error(
          `Balance is too low to cover network fees when sending max (${computer.getChain()}).`,
        )
      }
      tx.updateOutput(0, { value: outValue })
    } else {
      const amountSatoshis = options.amountSatoshis!
      tx.addOutput(recipientScript, amountSatoshis)
      tx.addOutput(changeScript, totalInput)
      const estimatedFees = BigInt(await computer.db.wallet.estimateFee(tx))
      const changeAmount = totalInput - estimatedFees - minDust - amountSatoshis
      if (changeAmount <= 0n) {
        throw new Error(
          changeAmount < 0n
            ? `Insufficient balance after fees to send this amount (${computer.getChain()}).`
            : `After fees there is nothing left for change; try a slightly smaller amount or Send max (${computer.getChain()}).`,
        )
      }
      tx.updateOutput(1, { value: changeAmount })
    }
  }

  await computer.sign(tx)
  const txId = await computer.broadcast(tx)
  return typeof txId === 'string' ? txId : undefined
}

/** Validate that `address` is a valid output script for the computer's chain/network. */
export function isValidAddressForComputer(computer: Computer, address: string): boolean {
  const trimmed = address.trim()
  if (!trimmed) return false
  try {
    const networkObj = networks.getNetwork(computer.getChain(), computer.getNetwork())
    bAddress.toOutputScript(trimmed, networkObj)
    return true
  } catch {
    return false
  }
}
