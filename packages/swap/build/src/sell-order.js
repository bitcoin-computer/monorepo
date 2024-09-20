import { Transaction } from '@bitcoin-computer/lib';
import { TxWrapperHelper } from './tx-wrapper.js';
import { Payment, PaymentHelper, PaymentMock } from './payment.js';
import { SaleHelper } from './sale.js';
export class SellOrder extends Contract {
    constructor(owner, txHex) {
        super({ _owners: [owner], txHex });
    }
}
export class SellOrderHelper {
    constructor(computer, saleMod, txWrapperMod, paymentMod, sellMod) {
        this.computer = computer;
        this.saleHelper = new SaleHelper(computer, saleMod);
        this.txWrapperHelper = new TxWrapperHelper(computer, txWrapperMod);
        this.paymentHelper = new PaymentHelper(computer, paymentMod);
        this.mod = sellMod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${SellOrder}`);
        return this.mod;
    }
    async broadcastSellOrder(amount, tokenRev) {
        const mock = new PaymentMock(amount);
        const { tx: saleTx } = await this.saleHelper.createSaleTx({ _rev: tokenRev }, mock);
        const publicKey = this.computer.getPublicKey();
        const url = this.computer.getUrl();
        const { tx: wrappedSaleTx } = await this.txWrapperHelper.createWrappedTx(publicKey, url, saleTx);
        return this.computer.broadcast(wrappedSaleTx);
    }
    async closeAndSettleSellOrder(price, saleTx) {
        const payment = await this.computer.new(Payment, [price], this.paymentHelper.mod);
        const scriptPubKey = this.computer.toScriptPubKey();
        const finalTx = SaleHelper.finalizeSaleTx(saleTx, payment, scriptPubKey);
        await this.computer.fund(finalTx);
        await this.computer.sign(finalTx);
        return this.computer.broadcast(finalTx);
    }
    async parseSellOrder(sellOrderRev) {
        const { txHex: saleTxHex } = (await this.computer.sync(sellOrderRev));
        const saleTx = Transaction.deserialize(saleTxHex);
        if (!(await this.saleHelper.isSaleTx(saleTx)))
            return {};
        const price = await this.saleHelper.checkSaleTx(saleTx);
        const { env } = await this.computer.decode(saleTx);
        const tokenRev = env.o;
        const open = await this.computer.isUnspent(tokenRev);
        const token = await this.computer.sync(tokenRev);
        return { saleTx, price, open, token };
    }
}
