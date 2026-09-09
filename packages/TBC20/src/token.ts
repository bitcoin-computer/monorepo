import { Computer, SmartContract, Contract } from '@bitcoin-computer/lib'

// eslint-disable-next-line
type Constructor<T> = new (...args: any[]) => T

export type TBC20ConstructorParams = {
  to: string
  amount: bigint
  name: string
  symbol?: string
  [s: string]: unknown
}

/** @deprecated Prefer `TBC20ConstructorParams` */
export type TokenConstructorParams = TBC20ConstructorParams

/**
 * Base fungible token contract for the Bitcoin Computer (TBC20 standard).
 */
export class TBC20 extends Contract {
  amount!: bigint
  name!: string
  symbol!: string
  _owners!: string[]

  /**
   * Fungibility identifier. TBC20 uses the object `_root` (one mint = one token).
   * Subclasses may override (TBC777: remoteRoot; Commodity: module specifier).
   */
  get root(): string {
    return this._root
  }

  /**
   * Overridable. True iff `other` is the same fungible token as `this`.
   * Default: same `root`. Subclasses add extra rules (e.g. Commodity requires
   * both bags to be genuine mints of that module).
   */
  protected async isFungibleWith(other: TBC20): Promise<boolean> {
    return this.root === other.root
  }

  constructor(params: TBC20ConstructorParams) {
    const { to, amount, name, symbol = '', ...rest } = params
    super({ amount, name, symbol, ...rest, _owners: [to] })
  }

  /**
   * Transfer tokens to another owner.
   *
   * If `amount` is omitted, the entire balance is transferred by reassigning
   * ownership of this token in place (the same UTXO/output changes owner). This
   * preserves the original TBC20 behavior and keeps the output layout fixed so
   * SIGHASH_SINGLE-based swaps (e.g. the `Sale` contract) continue to work.
   *
   * For a partial transfer the value is split off into a new token instance for
   * the recipient. Subclasses can customize that token by overriding
   * `_createTransferToken`.
   *
   * NOTE: Subclasses that must sanitize per-instance state on transfer (e.g.
   * TBC777, which strips escrow/claim history) override this method to route
   * full transfers through `_createTransferToken` as well.
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

  async merge(tokens: TBC20[]): Promise<void> {
    for (const t of tokens) {
      if (!(await this.isFungibleWith(t)))
        throw new Error('Cannot merge tokens from different lineages')
    }
    let total = 0n
    tokens.forEach((t) => {
      total += t.amount
      t.burn()
    })
    this.amount += total
  }
}

/** @deprecated Prefer `TBC20` */
export { TBC20 as Token }

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
  computer: Computer
  mod: string

  constructor(computer: Computer, mod?: string) {
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
    const token = await this.computer.new(
      TBC20,
      [{ to: publicKey, amount, name, symbol }],
      this.mod,
    )
    return token._root
  }

  async totalSupply(root: string): Promise<bigint> {
    const rootBag = (await this.computer.sync<typeof TBC20>(root)) as SmartContract<typeof TBC20>
    return rootBag.amount
  }

  private async getBags(publicKey: string, root: string): Promise<SmartContract<typeof TBC20>[]> {
    const revs = await this.computer.getOUTXOs({ publicKey, mod: this.mod })
    const bags = await Promise.all(
      revs.map(async (rev: string) => this.computer.sync<typeof TBC20>(rev)),
    )
    return bags.flatMap((bag: SmartContract<typeof TBC20> & { root: string }) =>
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

/** @deprecated Prefer `TBC20Helper` */
export { TBC20Helper as TokenHelper }
