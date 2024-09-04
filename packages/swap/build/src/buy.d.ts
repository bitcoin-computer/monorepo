import { Transaction } from '@bitcoin-computer/nakamotojs';
import { StaticSwapHelper } from './static-swap.js';
declare const Contract: typeof import("@bitcoin-computer/lib").Contract;
export declare class Buy extends Contract {
    amount: number;
    constructor(price: number, amount: number, tokenRoot: string);
    transfer(to: any): void;
}
export declare class BuyHelper {
    computer: any;
    swapHelper: StaticSwapHelper;
    mod?: string;
    buyOrder: Transaction;
    constructor(computer: any, swapMod: string, buyMod?: string);
    deploy(): Promise<string>;
    broadcastBuyOrder(price: number, amount: number, tokenRoot: string): Promise<Buy>;
    acceptBuyOrder(token: any, buyOrder: Buy): Promise<{
        tx: Transaction;
        effect: {
            res: any;
            env: any;
        };
    }>;
    isOpen(buy: Buy): Promise<boolean>;
    settleBuyOrder(swapTx: Transaction): Promise<string>;
}
export {};
