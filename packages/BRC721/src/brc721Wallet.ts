import { BRC721 } from './brc721'

interface IBRC721Wallet {
  balanceOf(owner: string): Promise<number>
  ownerOf(tokenId: string): Promise<string[]>
  transferTo(to: string, tokenId: string)
  mint(to: string, name?: string, symbol?: string): Promise<BRC721>
}

export class BRC721Wallet implements IBRC721Wallet {
  computer: any
  contract: any

  constructor(computer: any, contract: any = BRC721) {
    this.computer = computer
    this.contract = contract
  }

  async balanceOf(publicKey: string): Promise<number> {
    const revs = await this.computer.queryRevs({ publicKey, contract: this.contract })
    const nfts: any[] = await Promise.all(revs.map((rev) => this.computer.sync(rev)))
    return this.contract.balanceOf(nfts)
  }

  async ownerOf(tokenId: string): Promise<string[]> {
    const [rev] = await this.computer.idsToRevs([tokenId])
    const obj = await this.computer.sync(rev)
    return obj._owners
  }

  async transferTo(to: string, tokenId: string) {
    const [rev] = await this.computer.getLatestRevs([tokenId])
    const obj = await this.computer.sync(rev)
    await obj.transfer(to)
  }

  async mint(to: string, name: string, symbol: string, opts: any[] = []): Promise<any> {
    const nft = await this.computer.new(this.contract, [to, name, symbol, ...opts])
    return nft
  }
}
