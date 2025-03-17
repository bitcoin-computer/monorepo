import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const conf = {
  chain: process.env?.BCN_CHAIN,
  network: process.env?.BCN_NETWORK,
  url: process.env?.BCN_URL,
}

describe('Should work with chai', () => {
  it('Should be able to import the client side library', () => {
    const computer = new Computer(conf)
    expect(computer).an('object')
  })

  it('Should fund the client side library', async function () {
    this.retries(3)
    const computer = new Computer(conf)
    await computer.faucet(1e7)
    expect((await computer.getBalance()).balance).eq(10000000n)
  })

  it('Should send a transaction', async function () {
    this.retries(3)
    const computer = new Computer(conf)
    await computer.faucet(1e7)
    expect(typeof (await computer.send(1000000n, new Computer(conf).getAddress()))).eq('string')
  })

  it('Should return the balance of an address', async function () {
    this.retries(3)
    const computer = new Computer(conf)
    await computer.faucet(1e7)
    const balance = await new Computer(conf).getBalance(computer.getAddress())
    expect(balance.balance).eq(10000000n)
  })

  it('Should return the utxos of an address', async () => {
    const computer = new Computer(conf)
    const { txId, vout } = await computer.faucet(1e7)
    expect(await computer.getUtxos()).deep.eq([`${txId}:${vout}`])
  })

  it('Should list the txs of a given address', async () => {
    const computer = new Computer(conf)
    const { txId, vout } = await computer.faucet(1e7)
    expect(await new Computer(conf).listTxs(computer.getAddress())).deep.eq({
      sentTxs: [],
      receivedTxs: [
        {
          txId,
          inputsSatoshis: 0,
          outputsSatoshis: 10000000n,
          satoshis: 10000000n,
        },
      ],
    })
  })

  it('Should create a smart object', async () => {
    class Counter extends Contract {
      constructor() {
        super({ count: 0 })
      }
      inc() {
        this.count += 1
      }
    }

    const computer = new Computer(conf)
    await computer.faucet(1e8)
    const counter = await computer.new(Counter, [])
    expect(counter).to.be.an('object')
    expect(counter.count).eq(0)
  })

  it('Should work for the example from the readme file', async () => {
    // Create instance of client side library
    const computer = new Computer(conf)
    const address = computer.getAddress()

    // Fund client side library
    const { txId, vout } = await computer.faucet(1e7)

    // Return the utxos
    expect(await new Computer(conf).getUtxos(address)).deep.eq([`${txId}:${vout}`])

    // Return the balance
    const balance = await new Computer(conf).getBalance(address)
    expect(balance.balance).eq(10000000n)

    // Return the transactions
    expect(await new Computer(conf).listTxs(address)).deep.eq({
      sentTxs: [],
      receivedTxs: [
        {
          txId,
          inputsSatoshis: 0n,
          outputsSatoshis: 10000000n,
          satoshis: 10000000n,
        },
      ],
    })
  })
})
