export class NFT {
  name;
  symbol;
  _owners;

  constructor(to, name, symbol) {
    this._owners = [to];
    this.name = name;
    this.symbol = symbol;
  }

  transfer(to) {
    this._owners = [to];
  }

  mint(to) {
    return new NFT(to, this.name, this.symbol);
  }
}
