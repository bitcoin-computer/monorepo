import { NFT } from './nft'

interface ITBC721 {
  mint(to: string, name?: string, symbol?: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownerOf(tokenId: string): Promise<string[]>
  transfer(to: string, tokenId: string)
}

export class TBC721 implements ITBC721 {
  computer: any

  constructor(computer: any) {
    this.computer = computer
  }

  async mint(name?: string, symbol?: string): Promise<NFT> {
    return this.computer.new(NFT, [name, symbol])
  }

  async balanceOf(publicKey: string): Promise<number> {
    const revs = await this.computer.query({ publicKey })
    const objects: NFT[] = await Promise.all(revs.map((rev) => this.computer.sync(rev)))
    return objects.length
  }

  async ownerOf(tokenId: string): Promise<string[]> {
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
