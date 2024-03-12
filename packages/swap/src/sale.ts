import { Contract } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'

export class Sale extends Contract {
  static exec(a: NFT, b: NFT) {
    const [ownerA] = a._owners
    const [ownerB] = b._owners
    a.transfer(ownerB)
    b.transfer(ownerA)
    return [b, a]
  }
}
