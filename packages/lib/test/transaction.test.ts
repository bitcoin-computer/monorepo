import { Contract, Computer, Transaction } from '@bitcoin-computer/lib'
import { chain, network, url, expect } from './utils'

describe('Transaction', () => {
  class A extends Contract {
    n: number
    constructor() {
      super({ n: 1 })
    }

    inc() {
      this.n += 1
    }
  }

  let computer: Computer
  let wallet: any
  let restClient: any
  let a: A

  before('Before Transaction test', async () => {
    computer = new Computer({ chain, network, url })
    wallet = computer.db.wallet
    restClient = wallet.restClient

    await computer.faucet(1e8)
    a = await computer.new(A, [])
    await a.inc()
  })

  describe('fromTxId', () => {
    it('Should return a transaction', async () => {
      const txId = a._id.slice(0, 64)
      const tx = await Transaction.fromTxId({ txId, restClient })
      expect(tx instanceof Transaction).eq(true)
    })
  })

  describe('fromHex', () => {
    it('Should return a transaction', async () => {
      const txId = a._id.slice(0, 64)
      const tx = await Transaction.fromTxId({ txId, restClient })
      const hex = tx.toHex()
      const tx2 = Transaction.fromHex(hex)
      expect(tx2 instanceof Transaction).eq(true)
      expect(tx2).deep.eq(tx)
    })
  })

  describe('fromBuffer', () => {
    it('Should return a transaction', async () => {
      const txId = a._id.slice(0, 64)
      const tx = await Transaction.fromTxId({ txId, restClient })
      const hex = tx.toBuffer()
      const tx2 = Transaction.fromBuffer(hex)
      expect(tx2 instanceof Transaction).eq(true)
      expect(tx2).deep.eq(tx)
    })
  })

  describe('inRevs and outRevs', () => {
    it('Should return the revisions spent and created', async () => {
      const txId1 = a._id.slice(0, 64)
      const tx1 = await Transaction.fromTxId({ txId: txId1, restClient })
      expect(tx1.inRevs).deep.eq([])
      expect(tx1.outRevs).deep.eq([a._id])

      const txId2 = a._rev.slice(0, 64)
      const tx2 = await Transaction.fromTxId({ txId: txId2, restClient })
      expect(tx2.inRevs).deep.eq([a._id])
      expect(tx2.outRevs).deep.eq([a._rev])
    })
  })

  describe('onChainMetaData', () => {
    it('Should return the revisions spent and created', async () => {
      const txId1 = a._id.slice(0, 64)
      const tx1 = await Transaction.fromTxId({ txId: txId1, restClient })
      expect(tx1.onChainMetaData).deep.eq({
        exp: `${A} new A()`,
        env: {},
        mod: '',
        v: Computer.getVersion(),
        ioMap: [],
      })

      const txId2 = a._rev.slice(0, 64)
      const tx2 = await Transaction.fromTxId({ txId: txId2, restClient })
      expect(tx2.onChainMetaData).deep.eq({
        exp: `__bc__.inc()`,
        env: { __bc__: 0 },
        mod: '',
        v: Computer.getVersion(),
        ioMap: [0],
      })
    })
  })
})
