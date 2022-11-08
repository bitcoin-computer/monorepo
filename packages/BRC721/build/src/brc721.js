export class BRC721 {
    constructor(to, name, symbol) {
        this._owners = [to];
        this.name = name;
        this.symbol = symbol;
    }
    transfer(to) {
        this._owners = [to];
    }
    mint(to) {
        return new BRC721(to, this.name, this.symbol);
    }
    static balanceOf(nfts) {
        return nfts.length;
    }
}
