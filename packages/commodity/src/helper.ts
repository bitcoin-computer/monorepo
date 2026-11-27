import { Computer, SmartContract } from '@bitcoin-computer/lib'
import { TBC777Helper, exportClasses } from '@bitcoin-computer/TBC777'
import { Commodity } from './commodity.js'

export class CommodityHelper {
  computer: Computer
  mod: string

  constructor(computer: Computer, mod?: string) {
    this.computer = computer
    this.mod = mod ?? ''
  }

  static moduleSource(): string {
    return `${TBC777Helper.moduleSource()}\n${exportClasses(Commodity)}`
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(CommodityHelper.moduleSource())
    return this.mod
  }

  async mint(
    to: string,
    salt: string,
    name = '',
    symbol = '',
  ): Promise<SmartContract<typeof Commodity>> {
    if (!this.mod) throw new Error('Commodity module specifier is not set')
    return this.computer.new(
      Commodity,
      [{ to, salt, amount: 0n, name, symbol }],
      this.mod,
    )
  }

  private async getBags(publicKey: string): Promise<SmartContract<typeof Commodity>[]> {
    if (!this.mod) throw new Error('Commodity module specifier is not set')
    const revs = await this.computer.getOUTXOs({ publicKey, mod: this.mod })
    const bags = (await Promise.all(
      revs.map((rev) => this.computer.sync<typeof Commodity>(rev)),
    )) as SmartContract<typeof Commodity>[]
    const genuine: SmartContract<typeof Commodity>[] = []
    for (const bag of bags) {
      if (bag.amount > 0n && (await bag.isGenuine())) genuine.push(bag)
    }
    return genuine
  }

  async balanceOf(publicKey: string): Promise<bigint> {
    const bags = await this.getBags(publicKey)
    return bags.reduce((sum, bag) => sum + bag.amount, 0n)
  }

  /**
   * Send `amount` to `to` from this wallet's genuine bags of this module.
   * Splits go through `encode({ mod })` so the child is tagged with the module.
   */
  async transfer(to: string, amount: bigint): Promise<void> {
    if (amount <= 0n) throw new Error('Transfer amount must be positive')
    const owner = this.computer.getPublicKey()
    const bags = await this.getBags(owner)
    let remaining = amount
    for (const bag of bags) {
      if (remaining <= 0n) break
      const take = remaining < bag.amount ? remaining : bag.amount
      if (take === bag.amount) {
        await bag.transfer(to)
      } else {
        const { tx } = await this.computer.encode({
          exp: `token.transfer("${to}", ${take}n)`,
          env: { token: bag._rev },
          mod: this.mod,
        })
        await this.computer.broadcast(tx)
      }
      remaining -= take
    }
    if (remaining > 0n) throw new Error('Could not send entire amount')
  }
}
