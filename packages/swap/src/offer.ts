/* eslint max-classes-per-file: ["error", 2] */

import { Contract } from '@bitcoin-computer/lib'
import { Transaction } from '@bitcoin-computer/nakamotojs'

export class Offer extends Contract {
  constructor(owner: string, url: string, json: string) {
    super({ _owners: [owner], _url: url, json })
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

  async createOfferTx(publicKey: string, url: string, tx: Transaction) {
    return this.computer.encode({
      exp: `new Offer("${publicKey}", "${url}", "${tx.serialize()}")`,
      exclude: tx.getInRevs(),
      mod: this.mod,
    })
  }

  async decodeOfferTx(offerId: string) {
    const { res: syncedOffer } = (await this.computer.sync(offerId)) as { res: { json: string } }
    const { json } = syncedOffer
    return Transaction.deserialize(json)
  }
}
