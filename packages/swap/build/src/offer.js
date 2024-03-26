import { Transaction } from '@bitcoin-computer/nakamotojs';
const { Contract } = await import('@bitcoin-computer/lib');
export class Offer extends Contract {
    constructor(owner, url, json) {
        super({ _owners: [owner], _url: url, json });
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
        return this.computer.encode({
            exp: `new Offer("${publicKey}", "${url}", "${tx.serialize()}")`,
            exclude: tx.getInRevs(),
            mod: this.mod,
        });
    }
    async decodeOfferTx(offerId) {
        const { res: syncedOffer } = (await this.computer.sync(offerId));
        const { json } = syncedOffer;
        return Transaction.deserialize(json);
    }
}
