import { Transaction } from '@bitcoin-computer/nakamotojs';
import { Token, TokenHelper } from '@bitcoin-computer/TBC20';
import { StaticSwapHelper } from './static-swap.js';
import { TxWrapperHelper } from './tx-wrapper.js';
export declare class BuyOrder extends Contract {
    amount: number;
    open: boolean;
    _owners: string[];
    constructor(total: number, amount: number, tokenRoot: string);
    transfer(to: any): void;
}
export declare class BuyHelper {
    computer: any;
    swapHelper: StaticSwapHelper;
    txWrapperHelper: TxWrapperHelper;
    tokenHelper: TokenHelper;
    mod?: string;
    constructor(computer: any, swapMod: string, txWrapperMod: string, tokenMod: string, buyOrderMod?: string);
    deploy(): Promise<string>;
    broadcastBuyOrder(total: number, amount: number, tokenRoot: string): Promise<BuyOrder>;
    closeBuyOrder(token: Token, buyOrder: BuyOrder): Promise<any>;
    settleBuyOrder(swapTx: Transaction): Promise<string>;
    findMatchingSwapTx(buyOrder: BuyOrder, txWrapperMod: string): Promise<Transaction>;
    findMatchingToken(buyOrder: BuyOrder): Promise<Token | undefined>;
    isOpen(buyOrder: BuyOrder): Promise<boolean>;
}
