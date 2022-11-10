export interface IBRC721 {
  transfer(to: string)
}

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

  static balanceOf(nfts: BRC721[]) {
    return nfts.length
  }
}
