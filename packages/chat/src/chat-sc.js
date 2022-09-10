export default class Chat {
  constructor(publicKey) {
    this.messages = []
    this._owners = [publicKey]
  }

  post(message) {
    this.messages.push(message)
  }

  invite(publicKey) {
    this._owners.push(publicKey)
  }
}
