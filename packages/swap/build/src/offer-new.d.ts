import { Transaction } from '@bitcoin-computer/nakamotojs';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class OfferN extends Contract {
    json: string;
    constructor(owner: string, url: string);
    addSaleTx(tx: string): void;
}
export declare class OfferNHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createOfferTx(publicKey: string, url: string): Promise<any>;
    decodeOfferTx(offerId: string): Promise<Transaction>;
}
export {};
