/// <reference types="node" />
import { Contract } from '@bitcoin-computer/lib';
import { NFT } from '@bitcoin-computer/TBC721/src/nft';
import { Transaction } from '@bitcoin-computer/nakamotojs';
import { Valuable, ValuableMock } from './valuable';
import { Payment, PaymentMock } from './payment';
export declare class OrdSale extends Contract {
    static exec(b1: Valuable, b2: Valuable, t: NFT, p: NFT): (NFT | Valuable)[];
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
