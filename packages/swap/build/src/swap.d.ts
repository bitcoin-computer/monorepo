import type { Transaction as TransactionType } from '@bitcoin-computer/lib';
import { NFT } from '@bitcoin-computer/TBC721';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Swap extends Contract {
    constructor(a: NFT, b: NFT);
}
export declare class SwapHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSwapTx(a: any, b: any): Promise<any>;
    checkSwapTx(tx: TransactionType, pubKeyA: string, pubKeyB: string): Promise<any>;
}
export {};
