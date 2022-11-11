export class Token {
  name: string
  symbol: string
  _owners: string[]
  readonly _id: string
  readonly _rev: string
  readonly _root: string

  constructor(to: string, name: string, symbol: string) {
    this._owners = [to]
    this.name = name
    this.symbol = symbol
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

export class Payment {
  _owners: string[]
  _amount: number
  readonly _id: string
  readonly _rev: string
  readonly _root: string
  constructor(to: string, satoshis: number) {
    this._owners = [to]
    this._amount = satoshis
  }

  redeem() {
    this._amount = 50000
  }
}

export class Swap {
  constructor(t: Token, p: Payment) {
    const pOwners = p._owners
    p._owners = t._owners
    t._owners = pOwners
    return 'done'
  }
}
