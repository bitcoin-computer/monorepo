/* eslint-disable max-classes-per-file */

import { Contract } from '@bitcoin-computer/lib'

export class NFT extends Contract {
  name: string
  symbol: string
  _owners: string[]

  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

export interface ITBC721 {
  deploy(): Promise<string>
  mint(name: string, symbol: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownersOf(tokenId: string): Promise<string[]>
  transfer(tokenId: string, to: string)
}

export class TBC721 implements ITBC721 {
  computer: any
  mod: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${NFT}`)
    return this.mod
  }

  async mint(name: string, symbol: string): Promise<NFT> {
    const { tx, effect } = await this.computer.encode({
      exp: `new NFT("${name}", "${symbol}")`,
      mod: this.mod,
    })
    await this.computer.broadcast(tx)
    return effect.res
  }

  async balanceOf(publicKey: string): Promise<number> {
    const { mod } = this
    const revs = await this.computer.query({ publicKey, mod })
    const objects: NFT[] = await Promise.all(revs.map((rev) => this.computer.sync(rev)))
    return objects.length
  }

  async ownersOf(tokenId: string): Promise<string[]> {
    const [rev] = await this.computer.query({ ids: [tokenId] })
    const obj = await this.computer.sync(rev)
    return obj._owners
  }

  async transfer(tokenId: string, to: string) {
    const [rev] = await this.computer.query({ ids: [tokenId] })
    const obj = await this.computer.sync(rev)
    await obj.transfer(to)
  }
}
