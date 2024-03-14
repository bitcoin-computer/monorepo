import { Contract } from '@bitcoin-computer/lib'
import { NFT } from '@bitcoin-computer/TBC721/src/nft'

export class Swap extends Contract {
  static exec(a: NFT, b: NFT) {
    const [ownerA] = a._owners
    const [ownerB] = b._owners
    a.transfer(ownerB)
    b.transfer(ownerA)
  }
}

export class SwapHelper {
  computer: any
  mod?: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Swap}`)
    return this.mod
  }

  async createSwapTx(a: NFT, b: NFT) {
    return this.computer.encode({
      exp: `Swap.exec(a, b)`,
      env: { a: a._rev, b: b._rev },
      mod: this.mod
    })
  }
}
