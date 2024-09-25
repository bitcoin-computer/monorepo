import { Transaction as BCTransaction } from '@bitcoin-computer/lib';
import { TokenHelper } from '@bitcoin-computer/TBC20';
import { StaticSwapHelper } from './static-swap.js';
import { TxWrapperHelper } from './tx-wrapper.js';
export class BuyOrder extends Contract {
    constructor(total, amount, tokenRoot) {
        super({ _amount: total, amount, tokenRoot, open: true });
    }
    transfer(to) {
        this.open = false;
        this._owners = [to];
    }
}
export class BuyHelper {
    constructor(computer, swapMod, txWrapperMod, tokenMod, buyOrderMod) {
        this.computer = computer;
        this.swapHelper = new StaticSwapHelper(computer, swapMod);
        this.txWrapperHelper = new TxWrapperHelper(computer, txWrapperMod);
        this.tokenHelper = new TokenHelper(computer, tokenMod);
        this.mod = buyOrderMod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${BuyOrder}`);
        return this.mod;
    }
    async broadcastBuyOrder(total, amount, tokenRoot) {
        return this.computer.new(BuyOrder, [total, amount, tokenRoot], this.mod);
    }
    async closeBuyOrder(token, buyOrder) {
        const { tx: swapTx } = await this.swapHelper.createSwapTx(token, buyOrder);
        const { tx: wrappedTx } = await this.txWrapperHelper.createWrappedTx(buyOrder._owners[0], this.computer.getUrl(), swapTx);
        return this.computer.broadcast(wrappedTx);
    }
    async settleBuyOrder(swapTx) {
        await this.computer.sign(swapTx);
        return this.computer.broadcast(swapTx);
    }
    async findMatchingSwapTx(buyOrder, txWrapperMod) {
        const mod = txWrapperMod;
        const publicKey = buyOrder._owners[0];
        const wrappedTxRevs = await this.computer.query({ mod, publicKey });
        const wrappedTxs = (await Promise.all(wrappedTxRevs.map((rev) => this.computer.sync(rev))));
        const swapHexes = wrappedTxs.map((s) => s.txHex);
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
    async findMatchingToken(buyOrder) {
        const tokenRevs = await this.computer.query({
            mod: this.tokenHelper.mod,
            publicKey: this.computer.getPublicKey()
        });
        const tokens = (await Promise.all(tokenRevs.map((rev) => this.computer.sync(rev))));
        const matches = tokens.filter((token) => token.amount === buyOrder.amount);
        return matches[0] || undefined;
    }
    async isOpen(buyOrder) {
        return this.computer.isUnspent(buyOrder._id);
    }
}
