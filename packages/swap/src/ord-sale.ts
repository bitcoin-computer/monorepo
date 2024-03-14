/* eslint-disable max-classes-per-file */

import { Contract } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'
import { Valuable } from './valuable'

export class Sale extends Contract {
  static exec(b1: Valuable, b2: Valuable, t: NFT, p: NFT) {
    const [ownerT] = t._owners
    const [ownerP] = p._owners
    t.transfer(ownerP)
    p.transfer(ownerT)
    b1.setAmount(b1._amount + b2._amount)
    return [b1, t, p, b2]
  }
}
