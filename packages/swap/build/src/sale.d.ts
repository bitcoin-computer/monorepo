/// <reference types="node" />
import { Buffer } from 'buffer';
import { Transaction } from '@bitcoin-computer/lib';
import type { Transaction as TransactionType } from '@bitcoin-computer/lib';
import { Payment, PaymentMock } from './payment.js';
export declare class Sale extends Contract {
    static exec(o: any, p: Payment): any[];
}
export declare class SaleHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSaleTx(object: any, payment: PaymentMock): any;
    isSaleTx(tx: TransactionType): Promise<boolean>;
    checkSaleTx(tx: TransactionType): Promise<number>;
    static finalizeSaleTx(tx: TransactionType, payment: Payment, scriptPubKey: Buffer): Transaction;
}
