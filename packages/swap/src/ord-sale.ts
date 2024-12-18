/* eslint-disable max-classes-per-file */
import { NFT } from '@bitcoin-computer/TBC721'
import type { Transaction as TransactionType } from '@bitcoin-computer/lib'
import { Transaction } from '@bitcoin-computer/lib'
import { Buffer } from 'buffer'
import { Payment, PaymentMock } from './payment.js'

export class OrdSale extends Contract {
  static exec(b1: Payment, b2: Payment, n: NFT, p: Payment) {
    const [ownerT] = n._owners
    const [ownerP] = p._owners
    n.transfer(ownerP)
    p.transfer(ownerT)
    b1.setAmount(b1._amount + b2._amount)
    return [b1, n, p, b2]
  }
}

export class OrdSaleHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${OrdSale}`)
    return this.mod
  }

  async createSaleTx(b1Mock: PaymentMock, b2Mock: PaymentMock, nft: NFT, paymentMock: PaymentMock) {
    const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction

    return this.computer.encode({
      exp: `OrdSale.exec(b1, b2, nft, payment)`,
      env: { b1: b1Mock._rev, b2: b2Mock._rev, nft: nft._rev, payment: paymentMock._rev },
      mocks: { b1: b1Mock, b2: b2Mock, payment: paymentMock },
      // eslint-disable-next-line no-bitwise
      sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
      inputIndex: 2,
      fund: false,
      mod: this.mod,
    })
  }

  static checkSaleTx() {
    // todo
  }

  static finalizeSaleTx(
    tx: TransactionType,
    b1: Payment,
    b2: Payment,
    payment: Payment,
    scriptPubKey: Buffer,
  ) {
    const [b1TxId, b1Index] = b1._rev.split(':')
    tx.updateInput(0, { txId: b1TxId, index: parseInt(b1Index, 10) })

    const [b2TxId, b2Index] = b2._rev.split(':')
    tx.updateInput(1, { txId: b2TxId, index: parseInt(b2Index, 10) })

    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    tx.updateInput(3, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })

    tx.updateOutput(0, { scriptPubKey })
    tx.updateOutput(1, { scriptPubKey })
    tx.updateOutput(3, { scriptPubKey })

    return tx
  }
}
