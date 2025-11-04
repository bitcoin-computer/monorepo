export class NFT extends Contract {
    constructor(name = '', artist = '', url = '') {
        super({ name, artist, url });
    }
    transfer(to) {
        this._owners = [to];
        this.offerTxRev = undefined;
    }
    list(rev) {
        this.offerTxRev = rev;
    }
    unlist() {
        this.offerTxRev = undefined;
    }
}
export class NftHelper {
    constructor(computer, mod) {
        this.computer = computer;
        this.mod = mod;
    }
    async deploy() {
        this.mod = await this.computer.deploy(`export ${NFT}`);
        return this.mod;
    }
    async mint(name, artist, url) {
        const { tx, effect } = (await this.computer.encode({
            exp: `new NFT("${name}", "${artist}", "${url}")`,
            mod: this.mod,
        }));
        await this.computer.broadcast(tx);
        return effect.res;
    }
    async balanceOf(publicKey) {
        const { mod } = this;
        const revs = await this.computer.query({ publicKey, mod });
        const objects = (await Promise.all(revs.map((rev) => this.computer.sync(rev))));
        return objects.length;
    }
    async ownersOf(tokenId) {
        const rev = await this.computer.latest(tokenId);
        const obj = (await this.computer.sync(rev));
        return obj._owners;
    }
    async transfer(to, tokenId) {
        const rev = await this.computer.latest(tokenId);
        const obj = (await this.computer.sync(rev));
        await obj.transfer(to);
    }
}
