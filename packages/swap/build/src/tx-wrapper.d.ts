import { Transaction } from '@bitcoin-computer/lib';
import type { Contract } from '@bitcoin-computer/lib/contract-env';
declare const Contract: Contract;
export declare class TxWrapper extends Contract {
    txHex: string;
    constructor(owner: string, url: string, txHex?: string);
    addSaleTx(txHex: string): void;
}
export declare class TxWrapperHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createWrappedTx(publicKey: string, url: string, tx?: Transaction): Promise<any>;
    addSaleTx(txWrapperTxId: string, tx: Transaction): Promise<any>;
    decodeTx(txWrapperTxId: string): Promise<any>;
}
export {};
