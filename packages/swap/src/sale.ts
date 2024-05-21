/* eslint-disable max-classes-per-file */
import { NFT } from '@bitcoin-computer/TBC721'
import { Transaction } from '@bitcoin-computer/nakamotojs'
import { Payment, PaymentMock } from './payment.js'

const { Contract } = await import('@bitcoin-computer/lib')

export class Sale extends Contract {
  static exec(n: NFT, p: Payment) {
    const [ownerN] = n._owners
    const [ownerP] = p._owners
    n.transfer(ownerP)
    p.transfer(ownerN)
    return [p, n]
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

  createSaleTx(nft: NFT, payment: PaymentMock) {
    const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction
    return this.computer.encode({
      exp: `Sale.exec(nft, payment)`,
      env: { nft: nft._rev, payment: payment._rev },
      mocks: { payment },
      // eslint-disable-next-line no-bitwise
      sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
      inputIndex: 0,
      fund: false,
      mod: this.mod
    })
  }

  static checkSaleTx() {
    // todo
  }

  static finalizeSaleTx(tx: Transaction, payment: Payment, scriptPubKey: Buffer) {
    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    const index = parseInt(paymentIndex, 10)
    tx.updateInput(1, { txId: paymentTxId, index })
    tx.updateOutput(1, { scriptPubKey })
    return tx
  }
}
