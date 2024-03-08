import { NFT } from './nft'

export async function mint(computer: any, name: string, symbol: string): Promise<NFT> {
  return computer.new(NFT, [name, symbol])
}