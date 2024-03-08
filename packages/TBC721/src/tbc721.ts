import { NFT } from './nft'

interface ITBC721 {
  balanceOf(publicKey: string): Promise<number>
  ownersOf(tokenId: string): Promise<string[]>
  transfer(to: string, tokenId: string)
}

export class TBC721 implements ITBC721 {
  computer: any
  mod: string

  constructor(computer: any, mod: string) {
    this.computer = computer
    this.mod = mod
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

  async transfer(to: string, tokenId: string) {
    const [rev] = await this.computer.query({ ids: [tokenId] })
    const obj = await this.computer.sync(rev)
    await obj.transfer(to)
  }
}
