import { Transaction } from '@bitcoin-computer/nakamotojs';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Offer extends Contract {
    txHex: string;
    constructor(owner: string, url: string, txHex?: string);
    addSaleTx(txHex: string): void;
}
export declare class OfferHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createOfferTx(publicKey: string, url: string, tx?: Transaction): Promise<any>;
    addSaleTx(offerTxId: string, tx: Transaction): Promise<any>;
    decodeOfferTx(offerTxId: string): Promise<Transaction>;
}
export {};
