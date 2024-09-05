/* eslint-disable max-classes-per-file */
/// <reference types="node" />
import { Buffer } from 'buffer';
import type { Transaction as TransactionType } from '@bitcoin-computer/lib';
import { Payment, PaymentMock } from './payment.js';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Sale extends Contract {
    static exec(o: any, p: Payment): any[];
}

export declare class SaleHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSaleTx(object: any, payment: PaymentMock): any;
    checkSaleTx(tx: TransactionType): Promise<number>;
    static finalizeSaleTx(tx: TransactionType, payment: Payment, scriptPubKey: Buffer): TransactionType;
}
