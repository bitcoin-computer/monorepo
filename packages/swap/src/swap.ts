// @ts-ignore
import { Contract } from '@bitcoin-computer/lib'
// @ts-ignore
import { NFT } from '../../TBC721/src/nft'

export class Swap extends Contract {
  static exec(a: NFT, b: NFT) {
    const [ownerA] = a._owners
    const [ownerB] = b._owners
    a.transfer(ownerB)
    b.transfer(ownerA)
  }
}
