/* eslint-disable max-classes-per-file */
import { Transaction } from '@bitcoin-computer/nakamotojs'
import { Transaction as BCTransaction } from '@bitcoin-computer/lib'
import { Token } from '@bitcoin-computer/TBC20'
import { StaticSwapHelper } from './static-swap.js'
import { Offer, OfferHelper } from './offer.js'

export class Buy extends Contract {
  amount: number
  open: boolean

  constructor(price: number, amount: number, tokenRoot: string) {
    super({ _amount: price, amount, tokenRoot, open: true })
  }

  transfer(to) {
    this.open = false
    this._owners = [to]
  }
}

export class BuyHelper {
  computer: any
  swapHelper: StaticSwapHelper
  mod?: string
  buyOrder: Transaction

  constructor(computer: any, swapMod: string, buyMod?: string) {
    this.computer = computer
    this.swapHelper = new StaticSwapHelper(computer, swapMod)
    this.mod = buyMod
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(`export ${Buy}`)
    return this.mod
  }

  async broadcastBuyOrder(price: number, amount: number, tokenRoot: string): Promise<Buy> {
    return this.computer.new(Buy, [price, amount, tokenRoot], this.mod)
  }

  async closeBuyOrder(token: any, buy: Buy, offerMod: string) {
    const offerHelper = new OfferHelper(this.computer, offerMod)
    const { tx: swapTx } = await this.swapHelper.createSwapTx(token, buy)
    const { tx: offerTx } = await offerHelper.createOfferTx(
      buy._owners[0],
      this.computer.getUrl(),
      swapTx
    )
    return this.computer.broadcast(offerTx)
  }

  async findMatchingSwapTx(buy: Buy, offerModSpec: string) {
    // Buyer looks for an acceptable swap for their offer in the buy object
    const offerRevs = await this.computer.query({ mod: offerModSpec, publicKey: buy._owners[0] })
    const offers = (await Promise.all(offerRevs.map((rev) => this.computer.sync(rev)))) as Offer[]
    const swapHexes = offers.map((s) => s.txHex)
    const swapTxs = swapHexes.map((t) => BCTransaction.deserialize(t))
    const swaps = await Promise.all(swapTxs.map((t) => this.computer.decode(t)))

    const matchingSwapsIndex = await Promise.all(
      swaps.map(async (swap) => {
        const { a: tokenRev, b: buyRev } = swap.env
        // check that swap spends the buy order
        if (buy._rev !== buyRev) return false
        // check that token is unspent
        if (!(await this.computer.isUnspent(tokenRev))) return false
        // check that the token amount is correct
        const token = (await this.computer.sync(tokenRev)) as any
        return buy.amount === token.amount
      })
    )
    const index = matchingSwapsIndex.findIndex((i) => i)
    if (index === -1) return null
    return swapTxs[index]
  }

  async findMatchingToken(buy: Buy, tokenMod: string) {
    const tokenRevs = await this.computer.query({
      mod: tokenMod,
      publicKey: this.computer.getPublicKey()
    })
    const tokens = (await Promise.all(tokenRevs.map((rev) => this.computer.sync(rev)))) as Token[]
    const matches = tokens.filter((token: Token) => token.amount === buy.amount)
    return matches[0] || null
  }

  async isOpen(buy: Buy): Promise<boolean> {
    return this.computer.isUnspent(buy._id)
  }

  async settleBuyOrder(swapTx: Transaction): Promise<string> {
    await this.computer.sign(swapTx)
    return this.computer.broadcast(swapTx)
  }
}
