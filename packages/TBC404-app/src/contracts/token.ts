export class Token extends Contract {
  constructor(to: string, img: string, supply: number, totalSupply: number, name: string, symbol = '') {
    super({ _owners: [to], img, totalSupply, supply, name, symbol })
  }

  transfer(to: string, amount: number): Token {
    if (this.supply < amount) throw new Error()
    this.supply -= amount
    return new Token(to, this.img, amount, this.totalSupply, this.name, this.symbol)
  }
}