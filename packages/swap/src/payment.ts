import { Mock } from '@bitcoin-computer/lib'
import { mockRev, mockPublicKey } from './utils/index.js'

export class Payment extends Contract {
  constructor(_satoshis: bigint) {
    super({ _satoshis })
  }

  transfer(to: string) {
    this.setOwners([to])
  }
}

export class PaymentMock extends Mock {
  constructor(_satoshis: bigint) {
    super({
      _id: mockRev(),
      _rev: mockRev(),
      _root: mockRev(),
      _owners: [mockPublicKey],
      _satoshis,
    })
  }

  transfer(to: string) {
    this.setOwners([to])
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
    const rev = await this.computer.latest(`${paymentTxId}:0`)
    const syncedPayment: Payment = await this.computer.sync(rev)
    return syncedPayment
  }
}

export class Withdraw extends Contract {
  static exec(payments: Payment[]) {
    payments.forEach((payment) => payment.setSatoshis(0n))
  }
}
