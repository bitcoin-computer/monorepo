import { Contract } from '@bitcoin-computer/lib'

export class NFT extends Contract {
  name: string
  symbol: string
  _owners: string[]
  readonly _id: string
  readonly _rev: string
  readonly _root: string

  constructor(to: string, name: string, symbol: string) {
    super()
    this._owners = [to]
    this.name = name
    this.symbol = symbol
  }

  transfer(to: string) {
    this._owners = [to]
  }

  mint(to: string) {
    return new NFT(to, this.name, this.symbol)
  }
}
