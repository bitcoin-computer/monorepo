const { Contract } = await import('@bitcoin-computer/lib');
export class NFT extends Contract {
    constructor(name = '', symbol = '') {
        super({ name, symbol });
    }
    transfer(to) {
        this._owners = [to];
    }
}
export class TBC721 {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${NFT}`);
        return this.mod;
    }
    async mint(name, symbol) {
        const { tx, effect } = await this.computer.encode({
            exp: `new NFT("${name}", "${symbol}")`,
            mod: this.mod,
        });
        await this.computer.broadcast(tx);
        return effect.res;
    }
    async balanceOf(publicKey) {
        const { mod } = this;
        const revs = await this.computer.query({ publicKey, mod });
        const objects = await Promise.all(revs.map((rev) => this.computer.sync(rev)));
        return objects.length;
    }
    async ownersOf(tokenId) {
        const [rev] = await this.computer.query({ ids: [tokenId] });
        const obj = await this.computer.sync(rev);
        return obj._owners;
    }
    async transfer(to, tokenId) {
        const [rev] = await this.computer.query({ ids: [tokenId] });
        const obj = await this.computer.sync(rev);
        await obj.transfer(to);
    }
}
