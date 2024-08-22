/* eslint-disable max-classes-per-file */
import { Transaction } from '@bitcoin-computer/lib'
import { SwapHelper } from './swap'

const { Contract } = await import('@bitcoin-computer/lib')

export class Buy extends Contract {
  constructor(price: number, amount: number, tokenRoot: string) {
    super({ _amount: price, amount, tokenRoot })
  }

  transfer(to) {
    this._owners = [to]
  }
}

export class BuyHelper {
  computer: any
  swapHelper: SwapHelper
  mod?: string
  buyOrder: Transaction

  constructor(computer: any, swapMod: string, buyMod?: string) {
    this.computer = computer
    this.swapHelper = new SwapHelper(computer, swapMod)
    this.mod = buyMod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Buy}`)
    return this.mod
  }

  async broadcastBuyOrder(price: number, amount: number, tokenRoot: string) {
    return this.computer.new(Buy, [price, amount, tokenRoot], this.mod)
  }

  async acceptBuyOrder(token: any, buyOrder: Buy): Promise<{ tx: Transaction }> {
    return this.swapHelper.createSwapTx(token, buyOrder)
  }

  async settleBuyOrder(swapTx: Transaction) {
    await this.computer.sign(swapTx)
    return this.computer.broadcast(swapTx)
  }
}
