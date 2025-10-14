import { Contract } from '@bitcoin-computer/lib';
export class Token extends Contract {
    constructor(to, amount, name, symbol = '') {
        super({ _owners: [to], amount, name, symbol });
    }
    transfer(to, amount) {
        if (typeof amount === 'undefined') {
            this._owners = [to];
            return undefined;
        }
        if (this.amount >= amount) {
            this.amount -= amount;
            const ctor = this.constructor;
            return new ctor(to, amount, this.name, this.symbol);
        }
        throw new Error('Insufficient funds');
    }
    burn() {
        this.amount = 0n;
    }
    merge(tokens) {
        let total = 0n;
        tokens.forEach((token) => {
            total += token.amount;
            token.burn();
        });
        this.amount += total;
    }
}
export class TokenHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${Token}`);
        return this.mod;
    }
    async mint(publicKey, amount, name, symbol) {
        const args = [publicKey, amount, name, symbol];
        const token = await this.computer.new(Token, args, this.mod);
        return token._root;
    }
    async totalSupply(root) {
        const rootBag = await this.computer.sync(root);
        return rootBag.amount;
    }
    async getBags(publicKey, root) {
        const revs = await this.computer.query({ publicKey, mod: this.mod });
        const bags = await Promise.all(revs.map(async (rev) => this.computer.sync(rev)));
        return bags.flatMap((bag) => (bag._root === root ? [bag] : []));
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
