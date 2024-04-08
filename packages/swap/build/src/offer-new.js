import { Transaction } from '@bitcoin-computer/nakamotojs';
const { Contract } = await import('@bitcoin-computer/lib');
export class OfferN extends Contract {
    constructor(owner, url) {
        super({ _owners: [owner], _url: url });
    }
    addSaleTx(tx) {
        this.json = tx;
    }
}
export class OfferNHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${OfferN}`);
        return this.mod;
    }
    async createOfferTx(publicKey, url) {
        return this.computer.encode({
            exp: `new Offer("${publicKey}", "${url}")`,
            mod: this.mod,
        });
    }
    async decodeOfferTx(offerId) {
        const { res: syncedOffer } = (await this.computer.sync(offerId));
        const { json } = syncedOffer;
        return Transaction.deserialize(json);
    }
}
