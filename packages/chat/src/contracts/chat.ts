import type { Contract } from '@bitcoin-computer/lib/contract-env'
declare const Contract: Contract

export class ChatSc extends Contract {
  messages!: string[]
  channelName!: string
  _owners!: string[]

  constructor(channelName: string, publicKey: string) {
    super({
      messages: [],
      channelName,
      _owners: [publicKey],
    })
  }

  post(message: string) {
    this.messages.push(message)
  }

  invite(publicKey: string) {
    this._owners.push(publicKey)
  }
}
