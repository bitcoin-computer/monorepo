/* eslint max-classes-per-file: ["error", 2] */
import { Transaction } from '@bitcoin-computer/nakamotojs'

const { Contract } = await import('@bitcoin-computer/lib')

export class OfferN extends Contract {
  json: string
  constructor(owner: string, url: string) {
    super({ _owners: [owner], _url: url })
  }

  addSaleTx(tx: string) {
    this.json = tx
  }
}

export class OfferNHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${OfferN}`)
    return this.mod
  }

  async createOfferTx(publicKey: string, url: string) {
    return this.computer.encode({
      exp: `new Offer("${publicKey}", "${url}")`,
      mod: this.mod,
    })
  }

  // async addSaleTx(tx: Transaction) {
  //   return this.computer.encode({
  //     exp: `offer.addSaleTx("${tx.serialize()}")`,
  //     exclude: tx.getInRevs(),
  //     env: {offer: ""},
  //   })
  // }

  async decodeOfferTx(offerId: string) {
    const { res: syncedOffer } = (await this.computer.sync(offerId)) as { res: { json: string } }
    const { json } = syncedOffer
    return Transaction.deserialize(json)
  }
}
