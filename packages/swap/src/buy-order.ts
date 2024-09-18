/* eslint-disable max-classes-per-file */
import { Transaction } from '@bitcoin-computer/nakamotojs'
import { StaticSwapHelper } from './static-swap.js'
import { OfferHelper } from './offer.js'

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

  async close(token: any, buy: Buy, offerMod: string) {
    const offerHelper = new OfferHelper(this.computer, offerMod)
    const { tx: swapTx } = await this.swapHelper.createSwapTx(token, buy)
    const { tx: offerTx } = await offerHelper.createOfferTx(
      buy._owners[0],
      this.computer.getUrl(),
      swapTx
    )
    return this.computer.broadcast(offerTx)
  }

  async isOpen(buy: Buy): Promise<boolean> {
    const { _id } = await this.computer.sync(buy._rev)
    const [txId, outNum] = _id.split(':')
    const { result } = await this.computer.rpcCall('gettxout', `${txId} ${outNum} true`)
    return !!result
  }

  async settleBuyOrder(swapTx: Transaction): Promise<string> {
    await this.computer.sign(swapTx)
    return this.computer.broadcast(swapTx)
  }
}
