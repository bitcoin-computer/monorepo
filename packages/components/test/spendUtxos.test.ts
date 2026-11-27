import { describe, it, expect } from 'vitest'
import { address as bAddress, networks, payments } from '@bitcoin-computer/nakamotojs'
import { signAndBroadcastSpendUtxos } from '../src/common/spendUtxos'

const network = networks.getNetwork('LTC', 'regtest')
const walletAddress = payments.p2pkh({ hash: Buffer.alloc(20, 1), network }).address!
const recipient = payments.p2pkh({ hash: Buffer.alloc(20, 2), network }).address!

// Mirrors the lib on LTC regtest. Non-witness dust is (script length + 157) * 30
// (5460 for P2PKH; the node rejects 5459 as dust). Witness dust follows the lib,
// which is a little above the node. estimateFee appends one wallet output, then
// charges 1000 for the first output and 34 more for each extra output.
const P2PKH_DUST = 5_460n
const dustLimit = (script: Buffer) => (script.length + 157) * 30
const witnessDust = (script: Buffer) => Math.ceil(30 * (script.length + 9 + 37 + 107 / 4 + 4))
const fee = (outputs: number) => 1_000n + 34n * BigInt(outputs - 1)
const walletScript = bAddress.toOutputScript(walletAddress, network)

function fakeComputer(utxoSatoshis: bigint[]) {
  const broadcasts: any[] = []
  const computer = {
    getAddress: () => walletAddress,
    getPublicKey: () => '02' + '00'.repeat(32),
    getChain: () => 'LTC',
    getNetwork: () => 'regtest',
    getFee: () => 2,
    getUTXOs: async (q: { address?: string }) =>
      q.address
        ? utxoSatoshis.map((satoshis, i) => ({ rev: `${'ab'.repeat(32)}:${i}`, satoshis }))
        : [],
    db: {
      wallet: {
        estimateFee: async (tx: any) => {
          const sized = tx.clone()
          sized.addOutput(walletScript, P2PKH_DUST)
          return Number(fee(sized.outs.length))
        },
        getDustThreshold: (segwit: boolean, script: Buffer) =>
          segwit ? witnessDust(script) : dustLimit(script),
      },
    },
    sign: async () => {},
    broadcast: async (tx: any) => {
      broadcasts.push(tx)
      return 'txid'
    },
  }
  return { computer: computer as any, broadcasts }
}

const outputsOf = (tx: any) =>
  tx.outs.map((o: any) => ({
    to: bAddress.fromOutputScript(o.script, network),
    value: o.value as bigint,
  }))
const feeOf = (tx: any, total: bigint) =>
  total - tx.outs.reduce((sum: bigint, o: any) => sum + (o.value as bigint), 0n)
const send = (computer: any, amountSatoshis: bigint) =>
  signAndBroadcastSpendUtxos({ computer, modSpecs: [], toAddress: recipient, amountSatoshis })

describe('signAndBroadcastSpendUtxos', () => {
  it('pays only the estimated fee when sending with change', async () => {
    const { computer, broadcasts } = fakeComputer([60_000n, 40_000n])
    await send(computer, 30_000n)
    expect(outputsOf(broadcasts[0])).toEqual([
      { to: recipient, value: 30_000n },
      { to: walletAddress, value: 100_000n - 30_000n - fee(2) },
    ])
    expect(feeOf(broadcasts[0], 100_000n)).toBe(fee(2))
  })

  it('pays only the estimated fee when sending max', async () => {
    const { computer, broadcasts } = fakeComputer([100_000n])
    await signAndBroadcastSpendUtxos({
      computer,
      modSpecs: [],
      toAddress: recipient,
      sendMax: true,
    })
    expect(outputsOf(broadcasts[0])).toEqual([{ to: recipient, value: 100_000n - fee(1) }])
  })

  it('pays only the estimated fee when consolidating', async () => {
    const { computer, broadcasts } = fakeComputer([70_000n, 30_000n])
    await signAndBroadcastSpendUtxos({ computer, modSpecs: [] })
    expect(outputsOf(broadcasts[0])).toEqual([{ to: walletAddress, value: 100_000n - fee(1) }])
  })

  it('leaves change below the dust limit to the fee instead of adding an output', async () => {
    // 5000 would be left for change: above the empty-script 4710, below the P2PKH limit.
    const { computer, broadcasts } = fakeComputer([100_000n])
    await send(computer, 100_000n - fee(2) - 5_000n)
    expect(outputsOf(broadcasts[0])).toEqual([{ to: recipient, value: 100_000n - fee(2) - 5_000n }])
    expect(feeOf(broadcasts[0], 100_000n)).toBe(fee(2) + 5_000n)
  })

  it('never creates an output below the dust limit', async () => {
    for (const change of [
      1n,
      300n,
      4_710n,
      P2PKH_DUST - 1n,
      P2PKH_DUST,
      P2PKH_DUST + 1n,
      20_000n,
    ]) {
      const { computer, broadcasts } = fakeComputer([100_000n])
      await send(computer, 100_000n - fee(2) - change)
      for (const o of broadcasts[0].outs)
        expect(o.value as bigint).toBeGreaterThanOrEqual(P2PKH_DUST)
    }
  })

  it('sends without change when only a single-output fee is affordable', async () => {
    // Enough for the one-output fee, not for the two-output fee.
    const { computer, broadcasts } = fakeComputer([100_000n])
    await send(computer, 100_000n - fee(1) - 10n)
    expect(outputsOf(broadcasts[0])).toEqual([{ to: recipient, value: 100_000n - fee(1) - 10n }])
    expect(feeOf(broadcasts[0], 100_000n)).toBe(fee(1) + 10n)
  })

  it('takes a too-small fee out of change after the transaction is signed', async () => {
    const { computer, broadcasts } = fakeComputer([100_000n])
    computer.sign = async (tx: any) => {
      tx.ins[0].script = Buffer.alloc(500)
    }
    await send(computer, 30_000n)
    const tx = broadcasts[0]
    const paid = feeOf(tx, 100_000n)
    expect(paid).toBeGreaterThan(fee(2))
    expect(paid).toBeGreaterThanOrEqual(BigInt(tx.virtualSize()) * 2n)
    expect(outputsOf(tx)[0]).toEqual({ to: recipient, value: 30_000n })
  })

  it('keeps change that sits between the real fee and a fee that includes an extra output', async () => {
    // Pricing the change from a three-output fee would put it one sat under dust.
    const change = P2PKH_DUST + (fee(3) - fee(2)) - 1n
    const { computer, broadcasts } = fakeComputer([100_000n])
    await send(computer, 100_000n - fee(2) - change)
    expect(outputsOf(broadcasts[0])).toEqual([
      { to: recipient, value: 100_000n - fee(2) - change },
      { to: walletAddress, value: change },
    ])
  })

  it('accepts a witness amount between the witness and legacy dust limits', async () => {
    const witness = payments.p2wpkh({ hash: Buffer.alloc(20, 3), network }).address!
    const amount = BigInt(witnessDust(bAddress.toOutputScript(witness, network)))
    const { computer, broadcasts } = fakeComputer([100_000n])
    await signAndBroadcastSpendUtxos({
      computer,
      modSpecs: [],
      toAddress: witness,
      amountSatoshis: amount,
    })
    expect(outputsOf(broadcasts[0])).toEqual([
      { to: witness, value: amount },
      { to: walletAddress, value: 100_000n - amount - fee(2) },
    ])
  })

  it('adjusts send-max when the recipient script is a different length', async () => {
    const witness = payments.p2wpkh({ hash: Buffer.alloc(20, 3), network }).address!
    const script = bAddress.toOutputScript(witness, network)
    const adjust = BigInt(script.length - walletScript.length) * 2n
    const { computer, broadcasts } = fakeComputer([100_000n])
    await signAndBroadcastSpendUtxos({
      computer,
      modSpecs: [],
      toAddress: witness,
      sendMax: true,
    })
    expect(outputsOf(broadcasts[0])).toEqual([{ to: witness, value: 100_000n - fee(1) - adjust }])
  })

  it('rejects an amount below the dust limit', async () => {
    const { computer, broadcasts } = fakeComputer([100_000n])
    await expect(send(computer, P2PKH_DUST - 1n)).rejects.toThrow('below the minimum output size')
    expect(broadcasts).toHaveLength(0)
  })

  it('rejects a send the balance cannot cover', async () => {
    const { computer, broadcasts } = fakeComputer([100_000n])
    await expect(send(computer, 100_000n - fee(1) + 1n)).rejects.toThrow(
      'Insufficient balance after fees',
    )
    expect(broadcasts).toHaveLength(0)
  })
})
