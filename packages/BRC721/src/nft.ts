import { Contract } from '@bitcoin-computer/lib'

export class NFT extends Contract {
  name: string
  symbol: string
  _owners: string[]
  readonly _id: string
  readonly _rev: string
  readonly _root: string

  constructor(to: string, name: string, symbol: string) {
    super({ _owners: [to], name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
