export class BRC721 {
  name: string
  symbol: string
  _owners: string[]
  readonly _id: string
  readonly _rev: string
  readonly _root: string

  constructor(to: string, name: string, symbol: string) {
    this._owners = [to]
    this.name = name
    this.symbol = symbol
  }

  transfer(to: string) {
    this._owners = [to]
  }

  mint(to: string) {
    return new BRC721(to, this.name, this.symbol)
  }

  static balanceOf(nfts: BRC721[]) {
    return nfts.length
  }
}
