import { Transaction } from '@bitcoin-computer/lib';
import { OfferHelper } from './offer.js';
import { Payment, PaymentHelper, PaymentMock } from './payment.js';
import { SaleHelper } from './sale.js';
export class SellOrder extends Contract {
    constructor(owner, txHex) {
        super({ _owners: [owner], txHex });
    }
}
export class SellOrderHelper {
    constructor(computer, saleMod, offerMod, paymentMod, sellMod) {
        this.computer = computer;
        this.saleHelper = new SaleHelper(computer, saleMod);
        this.offerHelper = new OfferHelper(computer, offerMod);
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
        const { tx: offerTx } = await this.offerHelper.createOfferTx(publicKey, url, saleTx);
        return this.computer.broadcast(offerTx);
    }
    async getSaleTx(sellOrderRev) {
        const { txHex: saleTxHex } = (await this.computer.sync(sellOrderRev));
        return Transaction.deserialize(saleTxHex);
    }
    async parseSellOrder(sellOrderRev) {
        const saleTx = await this.getSaleTx(sellOrderRev);
        if (!(await this.saleHelper.isSaleTx(saleTx)))
            return {};
        const price = await this.saleHelper.checkSaleTx(saleTx);
        const { env } = await this.computer.decode(saleTx);
        const tokenRev = env.o;
        const open = await this.computer.isUnspent(tokenRev);
        const token = await this.computer.sync(tokenRev);
        return { saleTx, price, open, token };
    }
    async settleSellOrder(price, deserialized) {
        const payment = await this.computer.new(Payment, [price], this.paymentHelper.mod);
        const finalTx = SaleHelper.finalizeSaleTx(deserialized, payment, this.computer.toScriptPubKey());
        await this.computer.fund(finalTx);
        await this.computer.sign(finalTx);
        return this.computer.broadcast(finalTx);
    }
}
