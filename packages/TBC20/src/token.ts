import { Computer } from '@bitcoin-computer/lib'

// eslint-disable-next-line
type Constructor<T> = new (...args: any[]) => T

export class Token extends Contract {
  amount: bigint
  name: string
  symbol: string
  _owners: string[]

  constructor(to: string, amount: bigint, name: string, symbol = '') {
    super({ _owners: [to], amount, name, symbol })
  }

  transfer(to: string, amount?: bigint): Token | undefined {
    if (typeof amount === 'undefined') {
      // Send entire amount
      this._owners = [to]
      return undefined
    }
    if (this.amount >= amount) {
      // Send partial amount in a new object
      this.amount -= amount
      const ctor = this.constructor as Constructor<this>
      return new ctor(to, amount, this.name, this.symbol)
    }
    throw new Error('Insufficient funds')
  }

  burn() {
    this.amount = 0n
  }

  merge(tokens: Token[]) {
    let total = 0n
    tokens.forEach((token) => {
      total += token.amount
      token.burn()
    })
    this.amount += total
  }
}

export interface ITBC20 {
  deploy(): Promise<string>
  mint(publicKey: string, amount: bigint, name: string, symbol: string): Promise<string>
  totalSupply(root: string): Promise<bigint>
  balanceOf(publicKey: string, root: string): Promise<bigint>
  transfer(to: string, amount: bigint, root: string): Promise<void>
}

export class TokenHelper implements ITBC20 {
  name: string
  symbol: string
  computer: Computer
  mod: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${Token}`)
    return this.mod
  }

  async mint(
    publicKey: string,
    amount: bigint,
    name: string,
    symbol: string,
  ): Promise<string | undefined> {
    const token = await this.computer.new(Token, [publicKey, amount, name, symbol], this.mod)
    return token._root
  }

  async totalSupply(root: string): Promise<bigint> {
    const rootBag = (await this.computer.sync(root)) as Token
    return rootBag.amount
  }

  private async getBags(publicKey: string, root: string): Promise<Token[]> {
    const revs = await this.computer.query({ publicKey, mod: this.mod })
    const bags = await Promise.all(revs.map(async (rev: string) => this.computer.sync(rev)))
    return bags.flatMap((bag: Token & { _root: string }) => (bag._root === root ? [bag] : []))
  }

  async balanceOf(publicKey: string, root: string): Promise<bigint> {
    if (typeof root === 'undefined') throw new Error('Please pass a root into balanceOf.')
    const bags = await this.getBags(publicKey, root)
    return bags.reduce((prev, curr) => prev + curr.amount, 0n)
  }

  async transfer(to: string, amount: bigint, root: string): Promise<void> {
    const owner = this.computer.getPublicKey()
    const bags = await this.getBags(owner, root)
    const results = []
    while (amount > 0 && bags.length > 0) {
      const [bag] = bags.splice(0, 1)
      const available = amount < bag.amount ? amount : bag.amount
      results.push(await bag.transfer(to, available))
      amount -= available
    }
    if (amount > 0) throw new Error('Could not send entire amount')
    await Promise.all(results)
  }
}
