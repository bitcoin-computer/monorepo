/// <reference types="node" />
/// <reference types="node" />
import { NFT } from '@bitcoin-computer/TBC721';
import type { Transaction as TransactionType } from '@bitcoin-computer/lib';
import { Buffer } from 'buffer';
import { Payment, PaymentMock } from './payment.js';
export declare class OrdSale extends Contract {
    static exec(b1: Payment, b2: Payment, n: NFT, p: Payment): (Payment | NFT)[];
}
export declare class OrdSaleHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSaleTx(b1Mock: PaymentMock, b2Mock: PaymentMock, nft: NFT, paymentMock: PaymentMock): Promise<any>;
    static checkSaleTx(): void;
    static finalizeSaleTx(tx: TransactionType, b1: Payment, b2: Payment, payment: Payment, scriptPubKey: Buffer): TransactionType;
}
