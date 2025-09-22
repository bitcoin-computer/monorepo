import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils'

describe('getTXOs', () => {
  let computer: Computer

  class C extends Contract {
    x: number
    constructor() {
      super({ x: 0 })
    }
    inc() {
      this.x += 1
    }
  }

  before('Fund computer', async () => {
    computer = new Computer({ chain, network, url })
    await computer.faucet(1e8)
    const c = await computer.new(C, [])
    await c.inc()
  })

  it('Should throw for an empty query string', async () => {
    let error
    try {
      await computer.getTXOs({})
    } catch (e: any) {
      error = e
    }
    expect(error).to.be.instanceOf(Error)
    expect(error.message).to.eq('At least one query parameter must be provided')
  })

  it('Should get TXOs by address and return an array of strings with the default verbosity', async () => {
    const txos = await computer.getTXOs({ address: computer.getAddress() })
    expect(txos.length).to.be.greaterThan(0)
    txos.forEach((txo) => {
      if (typeof txo !== 'string') throw new Error('Txo is not a string')
      expect(txo.split(':').length).to.eq(2)
      expect(txo.split(':')[0].length).to.eq(64)
    })
  })

  it('Should  get TXOs by address and return all attributes with verbosity 1', async () => {
    const txos = await computer.getTXOs({ verbosity: 1, address: computer.getAddress() })
    expect(txos.length).to.be.greaterThan(0)
    txos.forEach((txo) => {
      if (typeof txo === 'object' && txo !== null) {
        expect(txo.address).to.eq(computer.getAddress())
        expect(txo.satoshis).to.be.a('bigint')
        expect(txo.rev).to.be.a('string')
        expect(txo.asm).to.be.a('string')
        expect(txo.isObject).to.be.a('boolean')
      } else {
        throw new Error('Txo is not an object')
      }
    })
  })

  it('Should get TXOs by address and return unpent txos only with spent=false', async () => {
    const allTxos = await computer.getTXOs({ address: computer.getAddress() })
    const unspentTxos = await computer.getTXOs({
      address: computer.getAddress(),
      spent: false,
    })
    unspentTxos.forEach((txo) => {
      expect(allTxos).to.include(txo)
    })
  })

  it('Should get TXOs by address and compute the balance for the computer address', async () => {
    const txos = await computer.getTXOs({
      address: computer.getAddress(),
      spent: false,
      verbosity: 1,
    })
    const balance: bigint = txos.reduce((acc: bigint, txo) => {
      if (typeof txo === 'object' && txo !== null) {
        return acc + txo.satoshis
      } else {
        throw new Error('Txo is not an object')
      }
    }, 0n)

    const computerBalance = await computer.getBalance()
    expect(balance).to.be.a('bigint')
    expect(balance).to.be.greaterThan(0)
    expect(balance).to.eq(computerBalance.balance)
  })

  it('Should get TXOs by address and omit on chain objects', async () => {
    const c2 = await computer.new(C, [])
    const txos = await computer.getTXOs({
      address: computer.getAddress(),
    })
    expect(txos.length).to.be.greaterThan(0)
    // On chain objects do not belong to the address query
    expect(txos).to.not.include(c2._rev)
  })

  it('Should get TXOs by public key and include on chain objects', async () => {
    const c2 = await computer.new(C, [])
    const txos = await computer.getTXOs({ publicKey: computer.getPublicKey() })
    expect(txos.length).to.be.greaterThan(0)
    // On chain objects belong to the computer's public key
    expect(txos).includes(c2._rev)
  })

  it('Should get TXOs by isObject key', async () => {
    const computer2 = new Computer({ chain, network, url })
    await computer2.faucet(1e8)
    const c2 = await computer2.new(C, [])
    const objectTxos = await computer2.getTXOs({ isObject: true })
    expect(objectTxos.length).to.be.greaterThan(0)
    expect(objectTxos).to.include(c2._rev)

    const nonObjectTxos = await computer2.getTXOs({ isObject: false })
    expect(nonObjectTxos.length).to.be.greaterThan(0)
    expect(nonObjectTxos).to.not.include(c2._rev)

    // It is a good practice to combine isObject with publicKey to narrow down the search
    const objectTxosByPubKey = await computer2.getTXOs({
      isObject: true,
      publicKey: computer2.getPublicKey(),
    })
    expect(objectTxosByPubKey.length).to.be.greaterThan(0)
    expect(objectTxosByPubKey).to.include(c2._rev)

    // Lets spend the on chain object to test isObject filter
    await c2.inc()

    const objectTxosAfterSpend = await computer2.getTXOs({
      isObject: true,
      publicKey: computer2.getPublicKey(),
    })

    expect(objectTxosAfterSpend.length).to.greaterThan(0)
    const spent = objectTxosAfterSpend.filter((txo) => txo === c2._id)
    expect(spent.length).to.eq(1)
    const unspent = objectTxosAfterSpend.filter((txo) => txo === c2._rev)
    expect(unspent.length).to.eq(1)
  })

  it('Should get TXOs by rev', async () => {
    const c3 = await computer.new(C, [])
    const txos = await computer.getTXOs({ rev: c3._rev })
    expect(txos.length).to.eq(1)
    expect(txos[0]).to.eq(c3._rev)

    const txosJson = await computer.getTXOs({ rev: c3._rev, verbosity: 1 })
    expect(txosJson.length).to.eq(1)
    if (typeof txosJson[0] === 'object' && txosJson[0] !== null) {
      expect(txosJson[0].rev).to.eq(c3._rev)
    } else {
      throw new Error('Txo is not an object')
    }
  })
})
