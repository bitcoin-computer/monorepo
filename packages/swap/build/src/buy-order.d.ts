import { Transaction } from '@bitcoin-computer/nakamotojs';
import { Token } from '@bitcoin-computer/TBC20';
import { StaticSwapHelper } from './static-swap.js';
export declare class BuyOrder extends Contract {
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
    broadcastBuyOrder(price: number, amount: number, tokenRoot: string): Promise<BuyOrder>;
    closeBuyOrder(token: any, buyOrder: BuyOrder, offerMod: string): Promise<any>;
    settleBuyOrder(swapTx: Transaction): Promise<string>;
    findMatchingSwapTx(buyOrder: BuyOrder, offerModSpec: string): Promise<Transaction>;
    findMatchingToken(buyOrder: BuyOrder, tokenMod: string): Promise<Token>;
    isOpen(buyOrder: BuyOrder): Promise<boolean>;
}
