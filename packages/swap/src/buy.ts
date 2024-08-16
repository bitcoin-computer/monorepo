import { Transaction } from '@bitcoin-computer/lib'
import { SwapHelper } from './swap'

const { Contract } = await import('@bitcoin-computer/lib')

export class Buy extends Contract {
  constructor(price: number, amount: number, tokenRoot: string) {
    super({ _amount: price, amount, tokenRoot})
  }
}

export class BuyHelper {
  computer: any
  swapHelper: SwapHelper
  mod?: string
  buyOrder: Transaction

  constructor(computer: any, buyMod: string, saleMod: string) {
    this.computer = computer
    this.swapHelper = new SwapHelper(computer, saleMod)
    this.mod = buyMod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Buy}`)
    return this.mod
  }

  async broadcastBuyOrder(price: number, amount: number, tokenRoot: string) {
    this.buyOrder = this.computer.new(Buy, [price, amount, tokenRoot])
  }

  async acceptBuyOrder(token: any): Promise<Transaction> {
    return this.swapHelper.createSwapTx(this.buyOrder, token)
  }

  async settleBuyOrder(swapTx: Transaction) {
    this.computer.sign(swapTx)
    this.computer.broadcast(swapTx)
  }
}
