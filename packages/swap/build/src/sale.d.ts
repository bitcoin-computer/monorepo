/// <reference types="node" />
import { Contract } from '@bitcoin-computer/lib';
import { NFT } from '@bitcoin-computer/TBC721/src/nft';
import { Transaction } from '@bitcoin-computer/nakamotojs';
import { Payment } from './payment';
export declare class Sale extends Contract {
    static exec(a: NFT, b: NFT): NFT[];
}
export declare class SaleHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSaleTx(nft: NFT, payment: Payment): any;
    static checkSaleTx(): void;
    static finalizeSaleTx(tx: Transaction, payment: Payment, scriptPubKey: Buffer): Transaction;
}
