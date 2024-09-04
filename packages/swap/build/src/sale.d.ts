/* eslint-disable max-classes-per-file */
/// <reference types="node" />
import { NFT } from '@bitcoin-computer/TBC721'
import { Buffer } from 'buffer'
import type { Transaction as TransactionType } from '@bitcoin-computer/lib'
import { Payment, PaymentMock } from './payment.js'

export declare class Sale extends Contract {
  static exec(n: NFT, p: Payment): (Payment | NFT)[]
}

export declare class SaleHelper {
  computer: any
  mod?: string
  constructor(computer: any, mod?: string)
  deploy(): Promise<string>
  createSaleTx(object: any, payment: PaymentMock): any
  isSaleTx(tx: TransactionType): Promise<boolean>
  checkSaleTx(tx: TransactionType): Promise<number>
  static finalizeSaleTx(
    tx: TransactionType,
    payment: Payment,
    scriptPubKey: Buffer
  ): TransactionType
}
