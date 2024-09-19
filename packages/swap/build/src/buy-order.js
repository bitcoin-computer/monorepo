import { Transaction as BCTransaction } from '@bitcoin-computer/lib';
import { StaticSwapHelper } from './static-swap.js';
import { OfferHelper } from './offer.js';
export class BuyOrder extends Contract {
    constructor(price, amount, tokenRoot) {
        super({ _amount: price, amount, tokenRoot, open: true });
    }
    transfer(to) {
        this.open = false;
        this._owners = [to];
    }
}
export class BuyHelper {
    constructor(computer, swapMod, buyMod) {
        this.computer = computer;
        this.swapHelper = new StaticSwapHelper(computer, swapMod);
        this.mod = buyMod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${BuyOrder}`);
        return this.mod;
    }
    async broadcastBuyOrder(price, amount, tokenRoot) {
        return this.computer.new(BuyOrder, [price, amount, tokenRoot], this.mod);
    }
    async closeBuyOrder(token, buyOrder, offerMod) {
        const offerHelper = new OfferHelper(this.computer, offerMod);
        const { tx: swapTx } = await this.swapHelper.createSwapTx(token, buyOrder);
        const { tx: offerTx } = await offerHelper.createOfferTx(buyOrder._owners[0], this.computer.getUrl(), swapTx);
        return this.computer.broadcast(offerTx);
    }
    async settleBuyOrder(swapTx) {
        await this.computer.sign(swapTx);
        return this.computer.broadcast(swapTx);
    }
    async findMatchingSwapTx(buyOrder, offerModSpec) {
        const mod = offerModSpec;
        const publicKey = buyOrder._owners[0];
        const offerRevs = await this.computer.query({ mod, publicKey });
        const offers = (await Promise.all(offerRevs.map((rev) => this.computer.sync(rev))));
        const swapHexes = offers.map((s) => s.txHex);
        const swapTxs = swapHexes.map((t) => BCTransaction.deserialize(t));
        const swaps = await Promise.all(swapTxs.map((t) => this.computer.decode(t)));
        const matchingSwapsIndex = await Promise.all(swaps.map(async (swap) => {
            const { a: tokenRev, b: buyRev } = swap.env;
            if (buyOrder._rev !== buyRev)
                return false;
            if (!(await this.computer.isUnspent(tokenRev)))
                return false;
            const token = (await this.computer.sync(tokenRev));
            return buyOrder.amount === token.amount;
        }));
        const index = matchingSwapsIndex.findIndex((i) => i);
        if (index === -1)
            return null;
        return swapTxs[index];
    }
    async findMatchingToken(buyOrder, tokenMod) {
        const tokenRevs = await this.computer.query({
            mod: tokenMod,
            publicKey: this.computer.getPublicKey()
        });
        const tokens = (await Promise.all(tokenRevs.map((rev) => this.computer.sync(rev))));
        const matches = tokens.filter((token) => token.amount === buyOrder.amount);
        return matches[0] || null;
    }
    async isOpen(buyOrder) {
        return this.computer.isUnspent(buyOrder._id);
    }
}
