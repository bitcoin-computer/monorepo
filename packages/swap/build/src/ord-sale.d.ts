/// <reference types="node" />
import { NFT } from '@bitcoin-computer/TBC721';
import { Transaction } from '@bitcoin-computer/nakamotojs';
import { Valuable, ValuableMock } from './valuable.js';
import { Payment, PaymentMock } from './payment.js';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class OrdSale extends Contract {
    static exec(b1: Valuable, b2: Valuable, t: NFT, p: NFT): (Valuable | NFT)[];
}
export declare class OrdSaleHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSaleTx(b1Mock: ValuableMock, b2Mock: ValuableMock, nft: NFT, paymentMock: PaymentMock): Promise<any>;
    static checkSaleTx(): void;
    static finalizeSaleTx(tx: Transaction, b1: Valuable, b2: Valuable, payment: Payment, scriptPubKey: Buffer): Transaction;
}
export {};
