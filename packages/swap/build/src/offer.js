import { Transaction } from '@bitcoin-computer/nakamotojs';
const { Contract } = await import('@bitcoin-computer/lib');
export class Offer extends Contract {
    constructor(owner, url, txHex) {
        super({ _owners: [owner], _url: url, txHex });
    }
    addSaleTx(txHex) {
        this.txHex = txHex;
    }
}
export class OfferHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${Offer}`);
        return this.mod;
    }
    async createOfferTx(publicKey, url, tx) {
        const exp = tx
            ? `new Offer("${publicKey}", "${url}", "${tx.serialize()}")`
            : `new Offer("${publicKey}", "${url}")`;
        const exclude = tx ? tx.getInRevs() : [];
        return this.computer.encode({
            exp,
            exclude,
            mod: this.mod,
        });
    }
    async addSaleTx(offerTxId, tx) {
        const { res: syncedOffer } = (await this.computer.sync(offerTxId));
        return this.computer.encode({
            exp: `offer.addSaleTx("${tx.serialize()}")`,
            exclude: tx.getInRevs(),
            env: { offer: syncedOffer._rev },
        });
    }
    async decodeOfferTx(offerTxId) {
        const [rev] = await this.computer.query({ ids: [`${offerTxId}:0`] });
        const syncedOffer = await this.computer.sync(rev);
        const { txHex } = syncedOffer;
        return Transaction.deserialize(txHex);
    }
}
