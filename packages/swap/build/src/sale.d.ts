/// <reference types="node" />
import { NFT } from '@bitcoin-computer/TBC721';
import { Transaction } from '@bitcoin-computer/nakamotojs';
import { Buffer } from 'buffer';
import { Payment } from './payment.js';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Sale extends Contract {
    static exec(a: NFT, b: NFT): NFT[];
}
export declare class SaleHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSaleTx(nft: NFT, payment: Payment): any;
    checkSaleTx(tx: Transaction): Promise<number>;
    static finalizeSaleTx(tx: Transaction, payment: Payment, scriptPubKey: Buffer): Transaction;
}
export {};
