
// eslint-disable-next-line no-undef
export default class ChatSc extends Contract {
  constructor(publicKey) {
    super({
      messages: [],
      _owners: [publicKey]
    })
  }

  post(message) {
    this.messages.push(message)
  }

  invite(publicKey) {
    this._owners.push(publicKey)
  }
}
