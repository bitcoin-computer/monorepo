// @ts-ignore
import { Contract } from '@bitcoin-computer/lib'

// @ts-ignore
import { NFT } from '../../TBC721/src/nft'

export class Swappable extends Contract {
  name: string
  symbol: string
  _id: string
  _rev: string
  _root: string
  _owners: string[]

  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }

  swap(b: NFT) {
    const [ownerA] = this._owners
    const [ownerB] = b._owners
    this.transfer(ownerB)
    b.transfer(ownerA)
  }
}