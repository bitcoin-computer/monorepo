import { Contract } from '@bitcoin-computer/lib';
export class TBC20 extends Contract {
    get root() {
        return this._root;
    }
    constructor(params) {
        const { to, amount, name, symbol = '', ...rest } = params;
        super({ amount, name, symbol, ...rest, _owners: [to] });
    }
    transfer(to, amount) {
        if (typeof amount === 'undefined') {
            this._owners = [to];
            return undefined;
        }
        if (amount <= 0n)
            throw new Error('Transfer amount must be positive');
        if (this.amount < amount)
            throw new Error('Insufficient funds');
        this.amount -= amount;
        return this._createTransferToken(to, amount);
    }
    _createTransferToken(to, amount) {
        const ctor = this.constructor;
        const { _id, _root, _rev, _owners, ...cleanState } = this;
        return new ctor({ ...cleanState, to, amount });
    }
    burn() {
        this.amount = 0n;
    }
    merge(tokens) {
        if (tokens.some((t) => t._root !== this._root))
            throw new Error('Cannot merge tokens from different lineages');
        let total = 0n;
        tokens.forEach((t) => {
            total += t.amount;
            t.burn();
        });
        this.amount += total;
    }
}
export class TBC20Helper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${TBC20}`);
        return this.mod;
    }
    async mint(publicKey, amount, name, symbol) {
        const params = [{ to: publicKey, amount, name, symbol }];
        const token = await this.computer.new(TBC20, params, this.mod);
        return token._root;
    }
    async totalSupply(root) {
        const rootBag = await this.computer.sync(root);
        return rootBag.amount;
    }
    async getBags(publicKey, root) {
        const revs = await this.computer.getOUTXOs({ publicKey, mod: this.mod });
        const bags = await Promise.all(revs.map(async (rev) => this.computer.sync(rev)));
        return bags.flatMap((bag) => (bag.root === root ? [bag] : []));
    }
    async balanceOf(publicKey, root) {
        if (typeof root === 'undefined')
            throw new Error('Please pass a root into balanceOf.');
        const bags = await this.getBags(publicKey, root);
        return bags.reduce((prev, curr) => prev + curr.amount, 0n);
    }
    async transfer(to, amount, root) {
        const owner = this.computer.getPublicKey();
        const bags = await this.getBags(owner, root);
        const results = [];
        while (amount > 0 && bags.length > 0) {
            const [bag] = bags.splice(0, 1);
            const available = amount < bag.amount ? amount : bag.amount;
            results.push(await bag.transfer(to, available));
            amount -= available;
        }
        if (amount > 0)
            throw new Error('Could not send entire amount');
        await Promise.all(results);
    }
}
