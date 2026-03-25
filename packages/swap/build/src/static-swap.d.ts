import type { Transaction } from '@bitcoin-computer/lib';
import type { Contract } from '@bitcoin-computer/lib/contract-env';
declare const Contract: Contract;
export declare class StaticSwap extends Contract {
    static exec(a: any, b: any): void;
}
export declare class StaticSwapHelper {
    computer: any;
    mod?: string;
    constructor(computer: any, mod?: string);
    deploy(): Promise<string>;
    createSwapTx(a: any, b: any): Promise<{
        tx: Transaction;
        effect: {
            res: any;
            env: any;
        };
    }>;
    checkSwapTx(tx: Transaction, pubKeyA: string, pubKeyB: string): Promise<any>;
}
export {};
