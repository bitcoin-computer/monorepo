import { StaticSwapHelper } from './static-swap.js';
import { OfferHelper } from './offer.js';
const { Contract } = await import('@bitcoin-computer/lib');
export class Buy extends Contract {
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
        this.mod = await this.computer.deploy(`export ${Buy}`);
        return this.mod;
    }
    async broadcastBuyOrder(price, amount, tokenRoot) {
        return this.computer.new(Buy, [price, amount, tokenRoot], this.mod);
    }
    async acceptBuyOrder(token, buyOrder) {
        return this.swapHelper.createSwapTx(token, buyOrder);
    }
    async close(token, buy, mod) {
        const offerHelper = new OfferHelper(this.computer, mod);
        const { tx: swapTx } = await this.acceptBuyOrder(token, buy);
        const { tx: offerTx } = await offerHelper.createOfferTx(buy._owners[0], this.computer.getUrl(), swapTx);
        return this.computer.broadcast(offerTx);
    }
    async isOpen(buy) {
        const { _id } = await this.computer.sync(buy._rev);
        const [txId, outNum] = _id.split(':');
        const { result } = await this.computer.rpcCall('gettxout', `${txId} ${outNum} true`);
        return !!result;
    }
    async settleBuyOrder(swapTx) {
        await this.computer.sign(swapTx);
        return this.computer.broadcast(swapTx);
    }
}
