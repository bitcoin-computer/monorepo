// eslint-disable-next-line no-undef
export default class Token extends Contract {
  constructor(to, supply, name) {
    super()
    this.coins = supply
    this._owners = [to]
    this.name = name
  }

  send(amount, to) {
    if (this.coins < amount) throw new Error()
    this.coins -= amount
    return new Token(to, amount, this.name)
  }
}
