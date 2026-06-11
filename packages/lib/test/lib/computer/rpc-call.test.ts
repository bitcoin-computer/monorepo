import { Computer, Contract } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

describe('rpc', () => {
  // A smart contract
  class C extends Contract {}

  let computer: Computer

  before('Create and fund wallet', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)
  })

  // Query for information about the status of the blockchain
  it('Should call getBlockchainInfo', async () => {
    const { result } = await computer.rpc('getBlockchainInfo', '')
    expect(result.blocks).a('number')
    expect(result.bestblockhash).a('string')
  })

  // Query for information about the transaction
  it('Should call getRawTransaction', async () => {
    const c = await computer.new(C, [])
    const txId = c._id.slice(0, 64)
    const { result } = await computer.rpc('getRawTransaction', `${txId} 1`)
    expect(result.txid).eq(txId)
    expect(result.hex).a('string')
  })

  // Query for information about an output
  it('Should call getTxOut', async () => {
    const c = await computer.new(C, [])
    const [txId, outNum] = c._id.split(':')
    const { result } = await computer.rpc('getTxOut', `${txId} ${outNum} true`)
    expect(result.scriptPubKey.asm).eq(`1 ${computer.getPublicKey()} 1 OP_CHECKMULTISIG`)
  })

  // Mine a block to a specific address (only available on regtest)
  it('Should call generateToAddress', async () => {
    const { balance: balanceBefore } = await computer.getBalance()
    await computer.rpc('generateToAddress', `1 ${computer.getAddress()}`)
    const randomAddress = new Computer({ chain, network, url }).getAddress()
    await computer.rpc('generatetoaddress', `99 ${randomAddress}`)

    const { balance: balanceAfter } = await computer.getBalance()
    expect(balanceAfter - balanceBefore - BigInt(50e8) < BigInt(1e5)).to.be.true
  })
})
