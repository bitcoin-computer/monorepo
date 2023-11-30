export const nft = `class  NFT extends  Contract {
    constructor(data, owner) {
      super({
        data,
        _owners :[owner]
      })
    }
    send(to) {
      this._owners = [to]
    }
}`

export const nftExpresion = `class  NFT extends  Contract {
  constructor(data, owner) {
    super({
      data,
      _owners :[owner]
    })
  }
  send(to) {
    this._owners = [to]
  }
}
new NFT(name, ownder)`

export const nftExport = `export class  NFT extends  Contract {
  constructor(data, owner) {
    super({
      data,
      _owners :[owner]
    })
  }
  send(to) {
    this._owners = [to]
  }
}`

export const fungibleToken = `class  Token extends  Contract {
  constructor(supply, to) {
    super({
      tokens : supply
      _owners : [to]
    })
  }
  send(amount, to) {
    if (this.tokens < amount) throw new Error()
    this._amount -= amount
    return new Token(amount, to)
  }
}`

export const fungibleTokenExpresion = `class  Token extends  Contract {
  constructor(supply, to) {
    super({
      tokens : supply
      _owners : [to]
    })
  }
  send(amount, to) {
    if (this.tokens < amount) throw new Error()
    this._amount -= amount
    return new Token(amount, to)
  }
}
new Token(supply, to)`

export const fungibleTokenExport = `export class  Token extends  Contract {
  constructor(supply, to) {
    super({
      tokens : supply
      _owners : [to]
    })
  }
  send(amount, to) {
    if (this.tokens < amount) throw new Error()
    this._amount -= amount
    return new Token(amount, to)
  }
}`

export const chat = `class  Chat extends  Contract {
  constructor() {
    super({ messages: [] })
  }
  invite(pubKey) {
    this._owners.push(pubKey)
  }
  post(message) {
    this.messages.push(message)
  }
}`

export const chatExpresion = `class  Chat extends  Contract {
  constructor() {
    super({ messages: [] })
  }
  invite(pubKey) {
    this._owners.push(pubKey)
  }
  post(message) {
    this.messages.push(message)
  }
}
new Chat()`

export const chatExport = `export class  Chat extends  Contract {
  constructor() {
    super({ messages: [] })
  }
  invite(pubKey) {
    this._owners.push(pubKey)
  }
  post(message) {
    this.messages.push(message)
  }
}`
