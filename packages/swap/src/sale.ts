import { Contract } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { Payment } from './payment'
import { Transaction } from '@bitcoin-computer/nakamotojs'

export class Sale extends Contract {
  static exec(a: NFT, b: NFT) {
    const [ownerA] = a._owners
    const [ownerB] = b._owners
    a.transfer(ownerB)
    b.transfer(ownerA)
    return [b, a]
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

  createSaleTx(nft: NFT, payment: Payment) {
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

  checkSaleTx() {
    // todo
  }

  finalizeSaleTx(tx: Transaction, payment: Payment, scriptPubKey: Buffer) {
    const [paymentTxId, paymentIndex] = payment._rev.split(':')
    tx.updateInput(1, {
      txId: paymentTxId,
      index: parseInt(paymentIndex, 10),
    })
    tx.updateOutput(1, { scriptPubKey })
    return tx
  }
}
