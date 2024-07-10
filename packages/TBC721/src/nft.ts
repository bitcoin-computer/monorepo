/* eslint-disable max-classes-per-file */
const { Contract } = await import('@bitcoin-computer/lib')

export class NFT extends Contract {
  name: string
  symbol: string
  url: string
  offerTxRev: string

  constructor(name = '', symbol = '', url = '') {
    super({ name, symbol, url })
  }
  transfer(to) {
    this._owners = [to]
    this.offerTxRev = undefined
  }
  list(rev) {
    this.offerTxRev = rev
  }
}

export interface ITBC721 {
  deploy(): Promise<string>
  mint(name: string, symbol: string, url: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownersOf(tokenId: string): Promise<string[]>
  transfer(to: string, tokenId: string): Promise<void>
}

export class TBC721 implements ITBC721 {
  computer: any
  mod: string | undefined

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${NFT}`)
    return this.mod
  }

  async mint(name: string, symbol: string, url: string): Promise<NFT> {
    const { tx, effect } = await this.computer.encode({
      exp: `new NFT("${name}", "${symbol}", "${url}")`,
      mod: this.mod
    })
    await this.computer.broadcast(tx)
    return effect.res
  }

  async balanceOf(publicKey: string): Promise<number> {
    const { mod } = this
    const revs = await this.computer.query({ publicKey, mod })
    const objects: NFT[] = await Promise.all(revs.map((rev: string) => this.computer.sync(rev)))
    return objects.length
  }

  async ownersOf(tokenId: string): Promise<string[]> {
    const [rev] = await this.computer.query({ ids: [tokenId] })
    const obj = await this.computer.sync(rev)
    return obj._owners
  }

  async transfer(to: string, tokenId: string): Promise<void> {
    const [rev] = await this.computer.query({ ids: [tokenId] })
    const obj = await this.computer.sync(rev)
    await obj.transfer(to)
  }
}
