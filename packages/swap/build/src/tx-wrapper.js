import { Transaction } from '@bitcoin-computer/lib';
export class TxWrapper extends Contract {
    constructor(owner, url, txHex) {
        super({ _owners: [owner], txHex });
    }
    addSaleTx(txHex) {
        this.txHex = txHex;
    }
}
export class TxWrapperHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${TxWrapper}`);
        return this.mod;
    }
    async createWrappedTx(publicKey, url, tx) {
        const exp = tx
            ? `new TxWrapper("${publicKey}", "${url}", "${tx.serialize()}")`
            : `new TxWrapper("${publicKey}", "${url}")`;
        const exclude = tx ? tx.getInRevs() : [];
        return this.computer.encode({
            exp,
            exclude,
            mod: this.mod
        });
    }
    async addSaleTx(offerTxId, tx) {
        const { res: syncedOffer } = (await this.computer.sync(offerTxId));
        return this.computer.encode({
            exp: `offer.addSaleTx("${tx.serialize()}")`,
            exclude: tx.getInRevs(),
            env: { offer: syncedOffer._rev }
        });
    }
    async decodeOfferTx(offerTxId) {
        const [rev] = await this.computer.query({ ids: [`${offerTxId}:0`] });
        const { txHex } = await this.computer.sync(rev);
        return Transaction.deserialize(txHex);
    }
}