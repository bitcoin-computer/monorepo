import { NFT } from './nft'

export async function mint(computer: any, name: string, symbol: string, mod: string): Promise<NFT> {
  const { tx, effect } = await computer.encode({ exp: `new NFT("${name}", "${symbol}")`, mod })
  await computer.broadcast(tx)
  return effect.res
}