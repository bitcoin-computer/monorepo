import { Computer, Contract } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

// Create wallet
const computer = new Computer({ chain, network, url })

// A smart contract
class C extends Contract {}

describe('rpcCall', () => {
  before('Fund wallet', async () => {
    await computer.faucet(1e8)
  })

  // Query for information about the status of the blockchain
  it('Should call getBlockchainInfo', async () => {
    const { result } = await computer.rpcCall('getBlockchainInfo', '')
    expect(result.blocks).a('number')
    expect(result.bestblockhash).a('string')
  })

  // Query for information about the transaction
  it('Should call getRawTransaction', async () => {
    const c = await computer.new(C, [])
    const txId = c._id.slice(0, 64)
    const { result } = await computer.rpcCall('getRawTransaction', `${txId} 1`)
    expect(result.txid).eq(txId)
    expect(result.hex).a('string')
  })

  // Query for information about an output
  it('Should call getTxOut', async () => {
    const c = await computer.new(C, [])
    const [txId, outNum] = c._id.split(':')
    const { result } = await computer.rpcCall('getTxOut', `${txId} ${outNum} true`)
    expect(result.scriptPubKey.asm).eq(`1 ${computer.getPublicKey()} 1 OP_CHECKMULTISIG`)
  })

  // Mine a block to a specific address (only available on regtest)
  it('Should call generateToAddress', async () => {
    const { balance: balanceBefore } = await computer.getBalance()
    await computer.rpcCall('generateToAddress', `1 ${computer.getAddress()}`)
    const randomAddress = new Computer({ chain, network, url }).getAddress()
    await computer.rpcCall('generatetoaddress', `99 ${randomAddress}`)

    const { balance: balanceAfter } = await computer.getBalance()
    expect(balanceAfter - balanceBefore - BigInt(50e8) < BigInt(1e5)).to.be.true
  })
})
