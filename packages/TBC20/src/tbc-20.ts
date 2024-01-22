import { TokenBag } from './token-bag'

interface ITBC20 {
  mint(publicKey: string, amount: number): Promise<string>
  totalSupply(): Promise<number>
  balanceOf(publicKey: string): Promise<number>
  transfer(to: string, amount: number): Promise<void>
}

export class TBC20 implements ITBC20 {
  name: string
  symbol: string
  computer: any
  mintId: string

  constructor(name: string, symbol: string, computer: any, mintId?: string) {
    this.name = name
    this.symbol = symbol
    this.computer = computer
    this.mintId = mintId
  }

  async mint(publicKey: string, amount: number): Promise<string> {
    const args = [publicKey, amount, this.name, this.symbol]
    const tokenBag = await this.computer.new(TokenBag, args)
    this.mintId = tokenBag._root
    return this.mintId
  }

  async totalSupply(): Promise<number> {
    if (!this.mintId) throw new Error('Please set a mint id.')
    const rootBag = await this.computer.sync(this.mintId)
    return rootBag.tokens
  }

  private async getBags(publicKey): Promise<TokenBag[]> {
    if (!this.mintId) throw new Error('Please set a mint id.')
    const revs = await this.computer.query({ publicKey })
    const bags = await Promise.all(revs.map(async (rev: string) => this.computer.sync(rev)))
    return bags.flatMap((bag: TokenBag & { _root: string }) =>
      bag._root === this.mintId ? [bag] : []
    )
  }

  async balanceOf(publicKey: string): Promise<number> {
    const bags = await this.getBags(publicKey)
    return bags.reduce((prev, curr) => prev + curr.tokens, 0)
  }

  async transfer(to: string, amount: number): Promise<void> {
    let _amount = amount
    const owner = this.computer.getPublicKey()
    const bags = await this.getBags(owner)
    const results = []
    while (_amount > 0 && bags.length > 0) {
      const [bag] = bags.splice(0, 1)
      const available = Math.min(_amount, bag.tokens)
      // eslint-disable-next-line no-await-in-loop
      results.push(await bag.transfer(to, available))
      _amount -= available
    }
    if (_amount > 0) throw new Error('Could not send entire amount')
    await Promise.all(results)
  }
}
