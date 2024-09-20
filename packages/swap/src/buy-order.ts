/* eslint-disable max-classes-per-file */
import { Transaction } from '@bitcoin-computer/nakamotojs'
import { Transaction as BCTransaction } from '@bitcoin-computer/lib'
import { Token } from '@bitcoin-computer/TBC20'
import { StaticSwapHelper } from './static-swap.js'
import { TxWrapper, TxWrapperHelper } from './tx-wrapper.js'

export class BuyOrder extends Contract {
  amount: number
  open: boolean
  _owners: string[]

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
    this.mod = await this.computer.deploy(`export ${BuyOrder}`)
    return this.mod
  }

  async broadcastBuyOrder(price: number, amount: number, tokenRoot: string): Promise<BuyOrder> {
    return this.computer.new(BuyOrder, [price, amount, tokenRoot], this.mod)
  }

  async closeBuyOrder(token: any, buyOrder: BuyOrder, txWrapperMod: string) {
    const txWrapperHelper = new TxWrapperHelper(this.computer, txWrapperMod)
    const { tx: swapTx } = await this.swapHelper.createSwapTx(token, buyOrder)
    const { tx: wrappedTx } = await txWrapperHelper.createWrappedTx(
      buyOrder._owners[0],
      this.computer.getUrl(),
      swapTx
    )
    return this.computer.broadcast(wrappedTx)
  }

  async settleBuyOrder(swapTx: Transaction): Promise<string> {
    await this.computer.sign(swapTx)
    return this.computer.broadcast(swapTx)
  }

  async findMatchingSwapTx(buyOrder: BuyOrder, txWrapperMod: string) {
    // Buyer looks for an acceptable swap for their order in the buy object
    const mod = txWrapperMod
    const publicKey = buyOrder._owners[0]
    const wrappedTxRevs = await this.computer.query({ mod, publicKey })
    const wrappedTxs = (await Promise.all(
      wrappedTxRevs.map((rev) => this.computer.sync(rev))
    )) as TxWrapper[]
    const swapHexes = wrappedTxs.map((s) => s.txHex)
    const swapTxs = swapHexes.map((t) => BCTransaction.deserialize(t))
    const swaps = await Promise.all(swapTxs.map((t) => this.computer.decode(t)))

    const matchingSwapsIndex = await Promise.all(
      swaps.map(async (swap) => {
        const { a: tokenRev, b: buyRev } = swap.env
        // check that swap spends the buy order
        if (buyOrder._rev !== buyRev) return false
        // check that token is unspent
        if (!(await this.computer.isUnspent(tokenRev))) return false
        // check that the token amount is correct
        const token = (await this.computer.sync(tokenRev)) as any
        return buyOrder.amount === token.amount
      })
    )
    const index = matchingSwapsIndex.findIndex((i) => i)
    if (index === -1) return null
    return swapTxs[index]
  }

  async findMatchingToken(buyOrder: BuyOrder, tokenMod: string) {
    const tokenRevs = await this.computer.query({
      mod: tokenMod,
      publicKey: this.computer.getPublicKey()
    })
    const tokens = (await Promise.all(tokenRevs.map((rev) => this.computer.sync(rev)))) as Token[]
    const matches = tokens.filter((token: Token) => token.amount === buyOrder.amount)
    return matches[0] || null
  }

  async isOpen(buyOrder: BuyOrder): Promise<boolean> {
    return this.computer.isUnspent(buyOrder._id)
  }
}
