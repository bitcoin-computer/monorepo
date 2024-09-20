import { Transaction } from '@bitcoin-computer/lib';
import { TxWrapperHelper } from './tx-wrapper.js';
import { PaymentHelper } from './payment.js';
import { SaleHelper } from './sale.js';
export declare class SellOrder extends Contract {
    txHex: string;
    constructor(owner: string, txHex?: string);
}
export declare class SellOrderHelper {
    computer: any;
    mod?: string;
    saleHelper: SaleHelper;
    txWrapperHelper: TxWrapperHelper;
    paymentHelper: PaymentHelper;
    constructor(computer: any, saleMod: string, txWrapperMod: string, paymentMod: string, sellMod?: string);
    deploy(): Promise<string>;
    broadcastSellOrder(amount: number, tokenRev: string): Promise<string>;
    closeAndSettleSellOrder(price: number, deserialized: Transaction): Promise<any>;
    getSaleTx(sellOrderRev: string): Promise<Transaction>;
    parseSellOrder(sellOrderRev: string): Promise<{
        saleTx: any;
        price: number;
        open: boolean;
        token: any;
    }>;
}
