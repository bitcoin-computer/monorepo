// eslint-disable-next-line no-undef
export default class Token extends Contract {
  constructor(to, supply, name) {
    super({
      coins: supply,
      _owners: [to],
      name: name
    })
  }

  send(amount, to) {
    if (this.coins < amount) throw new Error()
    this.coins -= amount
    return new Token(to, amount, this.name)
  }
}
