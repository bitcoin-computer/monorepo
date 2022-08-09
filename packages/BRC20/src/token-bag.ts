export class TokenBag {
  tokens: number

  name: string

  symbol: string

  _owners: string[]

  constructor(to: string, supply: number, name: string, symbol = '') {
    this.tokens = supply
    this._owners = [to]
    this.name = name
    this.symbol = symbol
  }

  transfer(to: string, amount: number): TokenBag {
    if (this.tokens < amount) throw new Error()
    this.tokens -= amount
    return new TokenBag(to, amount, this.name, this.symbol)
  }
}
