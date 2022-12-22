import { Contract } from '@bitcoin-computer/lib'

export default class Chat extends Contract {
  constructor(publicKey) {
    super()
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
