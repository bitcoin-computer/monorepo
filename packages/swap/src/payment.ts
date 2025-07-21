 
import { getMockedRev } from './utils/index.js'

const randomPublicKey = '023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c'

export class Payment extends Contract {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]

  constructor(_satoshis: bigint) {
    super({ _satoshis })
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setSatoshis(a: bigint) {
    this._satoshis = a
  }
}

export class PaymentMock {
  _id: string
  _rev: string
  _root: string
  _satoshis: bigint
  _owners: string[]

  constructor(satoshis: bigint) {
    this._id = getMockedRev()
    this._rev = getMockedRev()
    this._root = getMockedRev()
    this._satoshis = satoshis
    this._owners = [randomPublicKey]
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setSatoshis(a: bigint) {
    this._satoshis = a
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

  async createPaymentTx(satoshis: bigint) {
    const exp = `new Payment(${satoshis}n)`
    return this.computer.encode({
      exp,
      mod: this.mod,
    })
  }

  async getPayment(paymentTxId: string): Promise<Payment> {
    const [rev] = await this.computer.query({ ids: [`${paymentTxId}:0`] })
    const syncedPayment: Payment = await this.computer.sync(rev)
    return syncedPayment
  }
}

export class Withdraw extends Contract {
  static exec(payments: Payment[]) {
    payments.forEach((payment) => payment.setSatoshis(0n))
  }
}
