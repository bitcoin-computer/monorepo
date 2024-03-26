import { Contract } from '@bitcoin-computer/lib';
import { Transaction } from '@bitcoin-computer/nakamotojs';
export declare class Offer extends Contract {
    constructor(owner: string, url: string, json: string);
}
export declare class OfferHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createOfferTx(publicKey: string, url: string, tx: Transaction): Promise<any>;
    decodeOfferTx(offerId: string): Promise<Transaction>;
}
