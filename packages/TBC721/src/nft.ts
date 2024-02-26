// @ts-ignore
import { Contract } from '@bitcoin-computer/lib'

export class NFT extends Contract {
  name: string
  symbol: string
  _id: string
  _rev: string
  _root: string
  _owners: string[]

  constructor(publicKey: string, name = '', symbol = '') {
    super({ _owners: [publicKey], name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
