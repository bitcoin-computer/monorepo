/* eslint-disable max-classes-per-file */
const { Contract } = await import('@bitcoin-computer/lib');
export class Token extends Contract {
    constructor(to, amount, name, symbol = '') {
        super({ _owners: [to], amount, name, symbol });
    }
    transfer(to, amount) {
        // Send entire amount
        if (typeof amount === 'undefined') {
            this._owners = [to];
            return null;
        }
        // Send partial amount in a new object
        if (this.amount >= amount) {
            this.amount -= amount;
            return new Token(to, amount, this.name, this.symbol);
        }
        throw new Error('Insufficient funds');
    }
}
export class TBC20 {
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
        return bags.reduce((prev, curr) => prev + curr.amount, 0);
    }
    async transfer(to, amount, root) {
        let _amount = amount;
        const owner = this.computer.getPublicKey();
        const bags = await this.getBags(owner, root);
        const results = [];
        while (_amount > 0 && bags.length > 0) {
            const [bag] = bags.splice(0, 1);
            const available = Math.min(_amount, bag.amount);
            // eslint-disable-next-line no-await-in-loop
            results.push(await bag.transfer(to, available));
            _amount -= available;
        }
        if (_amount > 0)
            throw new Error('Could not send entire amount');
        await Promise.all(results);
    }
}
