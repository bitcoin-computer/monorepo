import { NFT } from '@bitcoin-computer/TBC721/src/nft'

const { Contract } = await import('@bitcoin-computer/lib')

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

  swap(that: NFT) {
    const [thisOwner] = this._owners
    const [thatOwner] = that._owners
    this.transfer(thatOwner)
    that.transfer(thisOwner)
  }
}
