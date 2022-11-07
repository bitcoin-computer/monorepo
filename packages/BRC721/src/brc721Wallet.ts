import { BRC721 } from './brc721'

interface IBRC721Wallet {
  balanceOf(owner: string): Promise<number>
  ownerOf(tokenId: string): Promise<string[]>
  transferTo(to: string, tokenId: string)
  mint(to: string, name?: string, symbol?: string): Promise<BRC721>
}

export class BRC721Wallet implements IBRC721Wallet {
  computer: any

  constructor(computer: any) {
    this.computer = computer
  }

  async balanceOf(publicKey: string): Promise<number> {
    const revs = await this.computer.queryRevs({ publicKey, contract: BRC721 })
    const nfts: BRC721[] = await Promise.all(revs.map((rev) => this.computer.sync(rev)))
    return BRC721.balanceOf(nfts)
  }

  async ownerOf(tokenId: string): Promise<string[]> {
    const rev = await this.computer.idToRev(tokenId)
    const obj = await this.computer.sync(rev)
    return obj._owners
  }

  async transferTo(to: string, tokenId: string) {
    const [rev] = await this.computer.getLatestRevs([tokenId])
    const obj = await this.computer.sync(rev)
    await obj.transfer(to)
  }

  async mint(to: string, name: string, symbol: string): Promise<BRC721> {
    const nft = await this.computer.new(BRC721, [to, name, symbol])
    return nft
  }
}
