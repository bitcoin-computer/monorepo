/* eslint max-classes-per-file: ["error", 2] */

import type { Transaction as TransactionType } from '@bitcoin-computer/lib'

const { Contract, Transaction } = await import('@bitcoin-computer/lib')

export class Offer extends Contract {
  txHex: string
  constructor(owner: string, url: string, txHex?: string) {
    super({ _owners: [owner], _url: url, txHex })
  }

  addSaleTx(txHex: string) {
    this.txHex = txHex
  }
}

export class OfferHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Offer}`)
    return this.mod
  }

  async createOfferTx(publicKey: string, url: string, tx?: TransactionType) {
    const exp = tx
      ? `new Offer("${publicKey}", "${url}", "${tx.serialize()}")`
      : `new Offer("${publicKey}", "${url}")`
    const exclude = tx ? tx.getInRevs() : []
    return this.computer.encode({
      exp,
      exclude,
      mod: this.mod
    })
  }

  async addSaleTx(offerTxId: string, tx: TransactionType) {
    const { res: syncedOffer } = (await this.computer.sync(offerTxId)) as { res: Offer }
    return this.computer.encode({
      exp: `offer.addSaleTx("${tx.serialize()}")`,
      exclude: tx.getInRevs(),
      env: { offer: syncedOffer._rev }
    })
  }

  async decodeOfferTx(offerTxId: string) {
    const [rev] = await this.computer.query({ ids: [`${offerTxId}:0`] })
    const syncedOffer: Offer = await this.computer.sync(rev)
    const { txHex } = syncedOffer
    return Transaction.deserialize(txHex)
  }
}
