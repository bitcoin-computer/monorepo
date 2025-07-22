 
import { Buffer } from 'buffer'
import { Transaction } from '@bitcoin-computer/lib'
import type { Transaction as TransactionType } from '@bitcoin-computer/lib'
import { Payment, PaymentMock } from './payment.js'

 
const sighashType = Transaction.SIGHASH_SINGLE | Transaction.SIGHASH_ANYONECANPAY

export class Sale extends Contract {
  static exec(o: any, p: Payment) {
    const [ownerN] = o._owners
    const [ownerP] = p._owners
    o.transfer(ownerP)
    p.transfer(ownerN)
    return [p, o]
  }
}

export class SaleHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Sale}`)
    return this.mod
  }

  createSaleTx(object: any, payment: PaymentMock) {
    return this.computer.encode({
      exp: `Sale.exec(o, p)`,
      env: { o: object._rev, p: payment._rev },
      mocks: { payment },
      sighashType,
      inputIndex: 0,
      fund: false,
      mod: this.mod,
    })
  }

  async isSaleTx(tx: TransactionType): Promise<boolean> {
    try {
      const { exp, mod } = await this.computer.decode(tx)
      return exp === 'Sale.exec(o, p)' && mod === this.mod
    } catch {
      return false
    }
  }

  async checkSaleTx(tx: TransactionType): Promise<bigint> {
    const { exp, env, mod } = await this.computer.decode(tx)
    if (exp !== 'Sale.exec(o, p)') throw new Error('Unexpected expression')
    if (mod !== this.mod) throw new Error('Unexpected module specifier')

    // As this is a mock for checking saleTx, it can be with any public key
    const p = new PaymentMock(tx.outs[0].value)
    env.p = p._rev
    const mocks = { p }
    const fund = false
    const sign = false
    const { effect } = await this.computer.encode({ exp, env, mod, mocks, fund, sign, sighashType })

    if (effect.res === undefined) throw new Error('Unexpected result')
    if (Object.keys(effect.env).toString() !== 'o,p') throw new Error('Unexpected environment')
    return tx.outs[0].value
  }

  static finalizeSaleTx(tx: TransactionType, payment: Payment, scriptPubKey: Buffer) {
    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    const index = parseInt(paymentIndex, 10)
    tx.updateInput(1, { txId: paymentTxId, index })
    tx.updateOutput(1, { scriptPubKey })
    return tx
  }
}
