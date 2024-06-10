import type { Transaction as TransactionType } from '@bitcoin-computer/lib';
import { NFT } from '@bitcoin-computer/TBC721';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class StaticSwap extends Contract {
    static exec(a: NFT, b: NFT): void;
}
export declare class StaticSwapHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSwapTx(a: NFT, b: NFT): Promise<any>;
    checkSwapTx(tx: TransactionType, pubKeyA: string, pubKeyB: string): Promise<any>;
}
export {};
