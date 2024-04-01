import { Transaction } from '@bitcoin-computer/nakamotojs';
import { NFT } from '@bitcoin-computer/TBC721/src/nft';
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
    checkSwapTx(tx: Transaction, pubKeyA: string, pubKeyB: string): Promise<any>;
}
export {};