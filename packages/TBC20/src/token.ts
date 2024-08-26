/* eslint-disable max-classes-per-file */
const { Contract } = await import('@bitcoin-computer/lib')

export class Token extends Contract {
  amount: number
  name: string
  symbol: string
  _owners: string[]

  constructor(to: string, amount: number, name: string, symbol = '') {
    super({ _owners: [to], amount, name, symbol })
  }

  transfer(to: string, amount?: number): Token | null {
    // Send entire amount
    if (typeof amount === 'undefined') {
      this._owners = [to]
      return null
    }
    // Send partial amount in a new object
    if (this.amount >= amount) {
      this.amount -= amount
      return new Token(to, amount, this.name, this.symbol)
    }

    throw new Error('Insufficient funds')
  }
}

export interface ITBC20 {
  deploy(): Promise<string>
  mint(publicKey: string, amount: number, name: string, symbol: string): Promise<string>
  totalSupply(root: string): Promise<number>
  balanceOf(publicKey: string, root: string): Promise<number>
  transfer(to: string, amount: number, root: string): Promise<void>
}

export class TBC20 implements ITBC20 {
  name: string
  symbol: string
  computer: any
  mod: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Token}`)
    return this.mod
  }

  async mint(
    publicKey: string,
    amount: number,
    name: string,
    symbol: string
  ): Promise<string | undefined> {
    const args = [publicKey, amount, name, symbol]
    const token = await this.computer.new(Token, args, this.mod)
    return token._root
  }

  async totalSupply(root: string): Promise<number> {
    const rootBag = await this.computer.sync(root)
    return rootBag.amount
  }

  private async getBags(publicKey: string, root: string): Promise<Token[]> {
    const revs = await this.computer.query({ publicKey, mod: this.mod })
    const bags = await Promise.all(revs.map(async (rev: string) => this.computer.sync(rev)))
    return bags.flatMap((bag: Token & { _root: string }) => (bag._root === root ? [bag] : []))
  }

  async balanceOf(publicKey: string, root: string): Promise<number> {
    if (typeof root === 'undefined') throw new Error('Please pass a root into balanceOf.')
    const bags = await this.getBags(publicKey, root)
    return bags.reduce((prev, curr) => prev + curr.amount, 0)
  }

  async transfer(to: string, amount: number, root: string): Promise<void> {
    let _amount = amount
    const owner = this.computer.getPublicKey()
    const bags = await this.getBags(owner, root)
    const results = []
    while (_amount > 0 && bags.length > 0) {
      const [bag] = bags.splice(0, 1)
      const available = Math.min(_amount, bag.amount)
      // eslint-disable-next-line no-await-in-loop
      results.push(await bag.transfer(to, available))
      _amount -= available
    }
    if (_amount > 0) throw new Error('Could not send entire amount')
    await Promise.all(results)
  }
}
