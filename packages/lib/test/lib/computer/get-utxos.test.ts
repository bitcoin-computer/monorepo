import { Computer, Contract } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

const computer1 = new Computer({ chain, network, url })
const computer2 = new Computer({ chain, network, url })

describe('getUtxos', () => {
  before('Fund computer1', async () => {
    await computer1.faucet(1e8)
  })

  it('Should return all UTXOs that do not contain on-chain objects', async () => {
    // computer1 creates two UTXOs for computer2
    const txId1 = await computer1.send(10000n, computer2.getAddress())
    const txId2 = await computer1.send(10000n, computer2.getAddress())

    // Check that computer2 has both UTXOS
    const utxos = await computer2.getUtxos()
    expect(new Set(utxos)).deep.eq(new Set([`${txId1}:0`, `${txId2}:0`]))
  })

  it('Should not return UTXOs that contain on-chain objects', async () => {
    // A smart contract
    class C extends Contract {}

    // Broadcast UTXO containing an on-chain object
    const c = await computer1.new(C, [])

    // Check that the UTXO containing the on-chain object is not
    // returned by getUTXOs
    const utxos = await computer1.getUtxos()
    expect(!utxos.some((item) => item === c._id))
  })
})
