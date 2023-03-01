import { NFT } from './nft'

interface IBRC721 {
  mint(to: string, name?: string, symbol?: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownerOf(tokenId: string): Promise<string[]>
  transfer(to: string, tokenId: string)
}

export class BRC721 implements IBRC721 {
  computer: any

  constructor(computer: any) {
    this.computer = computer
  }

  async mint(to: string, name?: string, symbol?: string, url?: string): Promise<NFT> {
    return this.computer.new(NFT, [to, name, symbol, url])
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
