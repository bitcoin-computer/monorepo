import { Contract } from '@bitcoin-computer/lib'

export class Token extends Contract {
  tokens: number
  name: string
  symbol: string
  _owners: string[]

  constructor(to: string, tokens: number, name: string, symbol = '') {
    super({ _owners: [to], tokens, name, symbol })
  }

  transfer(to: string, amount: number): Token {
    if (this.tokens < amount) throw new Error()
    this.tokens -= amount
    return new Token(to, amount, this.name, this.symbol)
  }
}
