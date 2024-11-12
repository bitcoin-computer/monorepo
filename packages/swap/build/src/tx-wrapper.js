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
    async addSaleTx(txWrapperTxId, tx) {
        const { res: txWrapper } = (await this.computer.sync(txWrapperTxId));
        return this.computer.encode({
            exp: `txWrapper.addSaleTx("${tx.serialize()}")`,
            exclude: tx.getInRevs(),
            env: { txWrapper: txWrapper._rev }
        });
    }
    async decodeTx(txWrapperTxId) {
        const [rev] = await this.computer.query({ ids: [`${txWrapperTxId}:0`] });
        const { txHex } = await this.computer.sync(rev);
        return Transaction.deserialize(txHex);
    }
}
