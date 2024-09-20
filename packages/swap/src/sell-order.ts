/* eslint max-classes-per-file: ["error", 2] */
import { Transaction } from '@bitcoin-computer/lib'
import { TxWrapperHelper } from './tx-wrapper.js'
import { Payment, PaymentHelper, PaymentMock } from './payment.js'
import { SaleHelper } from './sale.js'

export class SellOrder extends Contract {
  txHex: string

  constructor(owner: string, txHex?: string) {
    super({ _owners: [owner], txHex })
  }
}

export class SellOrderHelper {
  computer: any
  mod?: string
  saleHelper: SaleHelper
  txWrapperHelper: TxWrapperHelper
  paymentHelper: PaymentHelper

  constructor(
    computer: any,
    saleMod: string,
    txWrapperMod: string,
    paymentMod: string,
    sellMod?: string
  ) {
    this.computer = computer
    this.saleHelper = new SaleHelper(computer, saleMod)
    this.txWrapperHelper = new TxWrapperHelper(computer, txWrapperMod)
    this.paymentHelper = new PaymentHelper(computer, paymentMod)
    this.mod = sellMod
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(`export ${SellOrder}`)
    return this.mod
  }

  async broadcastSellOrder(amount: number, tokenRev: string): Promise<string> {
    const mock = new PaymentMock(amount)
    const { tx: saleTx } = await this.saleHelper.createSaleTx({ _rev: tokenRev }, mock)
    const publicKey = this.computer.getPublicKey()
    const url = this.computer.getUrl()
    const { tx: wrappedTx } = await this.txWrapperHelper.createWrappedTx(publicKey, url, saleTx)
    return this.computer.broadcast(wrappedTx)
  }

  async closeAndSettleSellOrder(price: number, deserialized: Transaction) {
    const payment = await this.computer.new(Payment, [price], this.paymentHelper.mod)
    const scriptPubKey = this.computer.toScriptPubKey()
    const finalTx = SaleHelper.finalizeSaleTx(deserialized, payment, scriptPubKey)
    await this.computer.fund(finalTx)
    await this.computer.sign(finalTx)
    return this.computer.broadcast(finalTx)
  }

  async getSaleTx(sellOrderRev: string) {
    const { txHex: saleTxHex } = (await this.computer.sync(sellOrderRev)) as any
    return Transaction.deserialize(saleTxHex)
  }

  async parseSellOrder(
    sellOrderRev: string
  ): Promise<{ saleTx: any; price: number; open: boolean; token: any }> {
    const saleTx = await this.getSaleTx(sellOrderRev)
    if (!(await this.saleHelper.isSaleTx(saleTx))) return {} as any
    const price = await this.saleHelper.checkSaleTx(saleTx)
    const { env } = await this.computer.decode(saleTx)
    const tokenRev = env.o
    const open = await this.computer.isUnspent(tokenRev)
    const token = await this.computer.sync(tokenRev)
    return { saleTx, price, open, token }
  }
}
