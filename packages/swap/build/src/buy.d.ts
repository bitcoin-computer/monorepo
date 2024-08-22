import { Transaction } from '@bitcoin-computer/lib';
import { SwapHelper } from './swap.js';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Buy extends Contract {
    constructor(price: number, amount: number, tokenRoot: string);
    transfer(to: any): void;
}
export declare class BuyHelper {
    computer: any;
    swapHelper: SwapHelper;
    mod?: string;
    buyOrder: Transaction;
    constructor(computer: any, swapMod: string, buyMod?: string);
    deploy(): Promise<string>;
    broadcastBuyOrder(price: number, amount: number, tokenRoot: string): Promise<any>;
    acceptBuyOrder(token: any, buyOrder: Buy): Promise<{
        tx: Transaction;
    }>;
    settleBuyOrder(swapTx: Transaction): Promise<any>;
}
export {};
