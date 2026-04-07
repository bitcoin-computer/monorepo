type Constructor<T> = new (...args: any[]) => T

export type TBC20ConstructorParams = {
  to: string
  amount: bigint
  name: string
  symbol?: string
  [s: string]: unknown
}

export class TBC20 extends Contract {
  amount: bigint
  name: string
  symbol: string
  _owners: string[]

  constructor(params: TBC20ConstructorParams) {
    const { to, amount, name, symbol = '', ...rest } = params
    super({ _owners: [to], amount, name, symbol, ...rest })
  }

  transfer(to: string, amount?: bigint): TBC20 | undefined {
    // Send entire amount
    if (typeof amount === 'undefined') {
      this._owners = [to]
      return undefined
    }

    // Send partial amount in a new object
    if (this.amount >= amount) {
      this.amount -= amount
      const ctor = this.constructor as Constructor<this>
      const { name, symbol } = this
      return new ctor({ to, amount, name, symbol })
    }
    throw new Error('Insufficient funds')
  }

  burn() {
    this.amount = 0n
  }

  merge(tokens: TBC20[]) {
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

export class TBC20Helper implements ITBC20 {
  name: string
  symbol: string
  computer: any
  mod: string

  constructor(computer: any, mod?: string) {
    this.computer = computer
    this.mod = mod
  }

  async deploy() {
    this.mod = await this.computer.deploy(`export ${TBC20}`)
    return this.mod
  }

  async mint(
    publicKey: string,
    amount: bigint,
    name: string,
    symbol: string,
  ): Promise<string | undefined> {
    const params = [{ to: publicKey, amount, name, symbol }]
    const token = await this.computer.new(TBC20, params, this.mod)
    return token._root
  }

  async totalSupply(root: string): Promise<bigint> {
    const rootBag = await this.computer.sync(root)
    return rootBag.amount
  }

  private async getBags(publicKey: string, root: string): Promise<TBC20[]> {
    const revs = await this.computer.getOUTXOs({ publicKey, mod: this.mod })
    const bags = await Promise.all(revs.map(async (rev: string) => this.computer.sync(rev)))
    return bags.flatMap((bag: TBC20 & { _root: string }) => (bag._root === root ? [bag] : []))
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
