import { Transaction } from '@bitcoin-computer/nakamotojs';
import { Token } from '@bitcoin-computer/TBC20';
import { StaticSwapHelper } from './static-swap.js';
export declare class Buy extends Contract {
    amount: number;
    open: boolean;
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
    closeBuyOrder(token: any, buy: Buy, offerMod: string): Promise<any>;
    findMatchingSwapTx(buy: Buy, offerModSpec: string): Promise<Transaction>;
    findMatchingToken(buy: Buy, tokenMod: string): Promise<Token>;
    isOpen(buy: Buy): Promise<boolean>;
    settleBuyOrder(swapTx: Transaction): Promise<string>;
}
