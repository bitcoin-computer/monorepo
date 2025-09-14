import { NFT } from '@bitcoin-computer/TBC721'

export class Swappable extends Contract {
  name: string
  artist: string

  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this.setOwners([to])
  }

  swap(that: NFT) {
    const [thisOwner] = this.getOwners()
    const [thatOwner] = that.getOwners()
    this.transfer(thatOwner)
    that.transfer(thisOwner)
  }
}
