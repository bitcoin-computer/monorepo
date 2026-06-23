import { Computer, SmartContract, Contract } from '@bitcoin-computer/lib'

// eslint-disable-next-line
type Constructor<T> = new (...args: any[]) => T

export type TokenConstructorParams = {
  to: string
  amount: bigint
  name: string
  symbol?: string
  [s: string]: unknown
}

/**
 * Base fungible token contract for the Bitcoin Computer (TBC20 standard).
 *
 * This is a mirror of the canonical `TBC20` implementation in the TBC777
 * package. It keeps the historical `Token` export name for backwards
 * compatibility while adopting the standard behavior.
 */
export class Token extends Contract {
  amount!: bigint
  name!: string
  symbol!: string
  _owners!: string[]

  get root(): string {
    return this._root
  }

  constructor(params: TokenConstructorParams) {
    const { to, amount, name, symbol = '', ...rest } = params
    super({ amount, name, symbol, ...rest, _owners: [to] })
  }

  /**
   * Transfer tokens to another owner.
   *
   * If `amount` is omitted, the entire balance is transferred by reassigning
   * ownership of this token in place (the same UTXO/output changes owner). This
   * preserves the original TBC20 behavior and, crucially, keeps the output
   * layout fixed so SIGHASH_SINGLE-based swaps (e.g. the `Sale` contract used by
   * swap / swap2 / ft2) continue to work.
   *
   * For a partial transfer the value is split off into a new token instance for
   * the recipient. Subclasses can customize that token by overriding
   * `_createTransferToken`.
   */
  transfer(to: string, amount?: bigint): this | undefined {
    if (typeof amount === 'undefined') {
      this._owners = [to]
      return undefined
    }

    if (amount <= 0n) throw new Error('Transfer amount must be positive')
    if (this.amount < amount) throw new Error('Insufficient funds')

    this.amount -= amount
    return this._createTransferToken(to, amount)
  }

  /**
   * Factory method used by `transfer` when creating a new token for a partial
   * transfer. Subclasses should override this method to control which fields
   * are copied to the new token instance.
   *
   * Default implementation performs a shallow copy of all current state
   * (preserving original behavior) while setting the new owner and amount.
   */
  protected _createTransferToken(to: string, amount: bigint): this {
    const ctor = this.constructor as Constructor<this>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, _root, _rev, _owners, ...cleanState } = this
    return new ctor({ ...cleanState, to, amount })
  }

  burn() {
    this.amount = 0n
  }

  merge(tokens: Token[]) {
    if (tokens.some((t) => t._root !== this._root))
      throw new Error('Cannot merge tokens from different lineages')
    let total = 0n
    tokens.forEach((t) => {
      total += t.amount
      t.burn()
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
    const token = await this.computer.new(
      Token,
      [{ to: publicKey, amount, name, symbol }],
      this.mod,
    )
    return token._root
  }

  async totalSupply(root: string): Promise<bigint> {
    const rootBag = (await this.computer.sync<typeof Token>(root)) as SmartContract<typeof Token>
    return rootBag.amount
  }

  private async getBags(publicKey: string, root: string): Promise<SmartContract<typeof Token>[]> {
    const revs = await this.computer.getOUTXOs({ publicKey, mod: this.mod })
    const bags = await Promise.all(
      revs.map(async (rev: string) => this.computer.sync<typeof Token>(rev)),
    )
    return bags.flatMap((bag: SmartContract<typeof Token> & { root: string }) =>
      bag.root === root ? [bag] : [],
    )
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
