import { Contract } from '@bitcoin-computer/lib';
export const config = {
    DEFAULT_CHAIN: 'LTC',
    DEFAULT_NETWORK: 'regtest',
    DEFAULT_URL: 'http://localhost:1031',
    FAUCET_AMOUNT: Number(process.env.FAUCET_AMOUNT) || 100000000,
};
export class Commodity extends Contract {
    constructor(to, salt = '', amount = 0n) {
        if (salt) {
            if (amount !== 0n)
                throw new Error('Mined Commodity must start with amount === 0n');
        }
        else {
            if (amount < 0n)
                throw new Error('Amount cannot be negative');
        }
        super({ _owners: [to], amount, salt });
    }
    async isGenuine() {
        const root = this._root === this._rev ? this : await computer.sync(this._root);
        return !!root.salt;
    }
    transfer(to, amount) {
        if (typeof amount === 'undefined') {
            this._owners = [to];
            return undefined;
        }
        if (this.amount >= amount) {
            this.amount -= amount;
            const Ctor = this.constructor;
            return new Ctor(to, '', amount);
        }
        throw new Error('Insufficient funds');
    }
    burn() {
        this.amount = 0n;
    }
    merge() {
        throw new Error('Merge disabled.');
    }
    async claim() {
        if (this._rev !== this._root)
            throw new Error('claim() can only be called on the mint creation revision of an object');
        const creationTxId = this._id.split(':')[0].toLowerCase();
        const blockHeight = await computer.txIdToBlockHeight(creationTxId);
        const { mod } = await computer.decode(creationTxId);
        if (!mod)
            throw new Error('Could not recover module from creation tx');
        const candidateRevs = await computer.getOUTXOs({ mod, blockHeight });
        if (candidateRevs.length === 0)
            throw new Error(`No objects of this module found for block ${blockHeight}`);
        candidateRevs.sort();
        const winnerRev = candidateRevs[0];
        if (this._id !== winnerRev)
            throw new Error(`Object ${this._id} is not canonical for host block ${blockHeight}. `);
        if (!(await this.isGenuine()))
            throw new Error('Only objects belonging to a genuine mint lineage may claim the subsidy');
        this.amount = Commodity.getSubsidy(blockHeight);
    }
    static getSubsidy(hostBlockHeight) {
        if (hostBlockHeight < 0)
            return 0n;
        const halvings = Math.floor(hostBlockHeight / 210000);
        if (halvings >= 64)
            return 0n;
        const COIN = 100000000n;
        return (50n * COIN) / (1n << BigInt(halvings));
    }
}
