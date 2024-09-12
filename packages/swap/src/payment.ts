/* eslint-disable max-classes-per-file */
import { getMockedRev } from './utils/index.js'

const randomPublicKey = '023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c'

export class Payment extends Contract {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor(_amount: number) {
    super({ _amount })
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setAmount(a: number) {
    this._amount = a
  }
}

export class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string[]

  constructor(amount: number) {
    this._id = getMockedRev()
    this._rev = getMockedRev()
    this._root = getMockedRev()
    this._amount = amount
    this._owners = [randomPublicKey]
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setAmount(a: number) {
    this._amount = a
  }
}

export class PaymentHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Payment}`)
    return this.mod
  }

  async createPaymentTx(amount: number) {
    const exp = `new Payment(${amount})`
    return this.computer.encode({
      exp,
      mod: this.mod
    })
  }

  async getPayment(paymentTxId: string): Promise<Payment> {
    const [rev] = await this.computer.query({ ids: [`${paymentTxId}:0`] })
    const syncedPayment: Payment = await this.computer.sync(rev)
    return syncedPayment
  }
}
