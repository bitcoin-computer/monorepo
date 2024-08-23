import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'

const conf = {
  chain: 'LTC',
  network: 'regtest',
  url: 'http://localhost:1031',
}

describe('Should work with chai', () => {
  it('Should be able to import the client side library', () => {
    const computer = new Computer(conf)
    expect(computer).an('object')
  })

  it('Should fund the client side library', async () => {
    const computer = new Computer(conf)
    await computer.faucet(1e7)
    expect((await computer.getBalance()).balance).eq(1e7)
  })

  it('Should send a transaction', async () => {
    const computer = new Computer(conf)
    await computer.faucet(1e7)
    expect(typeof await computer.send(1e6, new Computer(conf).getAddress())).eq('string')
  })

  it('Should return the balance of an address', async () => {
    const computer = new Computer(conf)
    await computer.faucet(1e7)
    const balance = await new Computer(conf).getBalance(computer.getAddress())
    expect(balance.balance).eq(1e7)
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
          outputsSatoshis: 1e7,
          satoshis: 1e7
        }
      ]
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
    await computer.faucet(1e7)
    const counter = await computer.new(Counter, [])
    expect(counter).to.be.an('object')
    expect(counter.count).eq(0)
  })

  it('Should work for the example from the readme file', async () => {
    // Create instance of client side library
    const computer = new Computer(conf)
    const address = computer.getAddress()

    // Fund client side library
    const { txId, vout } = await computer.faucet(1e4)

    // Return the utxos
    expect(await new Computer(conf).getUtxos(address)).deep.eq([`${txId}:${vout}`])

    // Return the balance
    const balance = await new Computer(conf).getBalance(address)
    expect(balance.balance).eq(1e4)

    // Return the transactions
    expect(await new Computer(conf).listTxs(address)).deep.eq({
      sentTxs: [],
      receivedTxs: [
        {
          txId,
          inputsSatoshis: 0,
          outputsSatoshis: 1e4,
          satoshis: 1e4
        }
      ]
    })
  })
})
