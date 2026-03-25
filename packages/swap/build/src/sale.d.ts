import { Buffer } from 'buffer';
import type { Transaction as TransactionType } from '@bitcoin-computer/lib';
import { Payment, PaymentMock } from './payment.js';
import type { Contract } from '@bitcoin-computer/lib/contract-env';
declare const Contract: Contract;
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
    checkSaleTx(tx: TransactionType): Promise<bigint>;
    static finalizeSaleTx(tx: TransactionType, payment: {
        _rev: string;
    }, scriptPubKey: Buffer): TransactionType;
}
export {};
