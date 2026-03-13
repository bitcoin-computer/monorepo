/* eslint max-classes-per-file: ["error", 2] */

import { Transaction, Contract } from '@bitcoin-computer/lib'

export class TxWrapper extends Contract {
  txHex: string

  constructor(owner: string, url: string, txHex?: string) {
    super({ _owners: [owner], txHex })
  }

  addSaleTx(txHex: string) {
    this.txHex = txHex
  }

  cancelSaleTx() {
    this.txHex = ''
  }
}

export class TxWrapperHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${TxWrapper}`)
    return this.mod
  }

  async createWrappedTx(publicKey: string, url: string, tx?: Transaction, excludedRevs?: string[]) {
    const exp = tx
      ? `new TxWrapper("${publicKey}", "${url}", "${tx.serialize()}")`
      : `new TxWrapper("${publicKey}", "${url}")`
    const exclude = tx ? tx.getInRevs() : []
    const revsToExclude = excludedRevs ? [...new Set([...exclude, ...excludedRevs])] : exclude
    const { tx: wrappedTx } = await this.computer.encode({
      fund: false,
      exp,
      exclude: revsToExclude,
      mod: this.mod,
    })

    const fee = await this.computer.db.wallet.estimateFee(wrappedTx)
    const txId = await this.computer.send(BigInt(fee * 10), this.computer.getAddress())

    return this.computer.encode({
      exp,
      exclude: revsToExclude,
      mod: this.mod,
      include: [`${txId}:0`],
    })
  }

  async cancelSaleTx(txWrapperTxId: string) {
    const { res: txWrapper } = (await this.computer.sync(txWrapperTxId)) as { res: TxWrapper }
    return this.computer.encode({
      exp: `txWrapper.cancelSaleTx()`,
      env: { txWrapper: txWrapper._rev },
    })
  }

  async addSaleTx(txWrapperTxId: string, tx: Transaction) {
    const { res: txWrapper } = await this.computer.sync(txWrapperTxId)
    return this.computer.encode({
      exp: `txWrapper.addSaleTx("${tx.serialize()}")`,
      exclude: tx.getInRevs(),
      env: { txWrapper: txWrapper._rev },
    })
  }

  async decodeTx(txWrapperTxId: string) {
    const rev = await this.computer.latest(`${txWrapperTxId}:0`)
    const { txHex } = await this.computer.sync(rev)
    return Transaction.deserialize(txHex)
  }
}
