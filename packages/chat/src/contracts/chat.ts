export class ChatSc extends Contract {
  messages!: string[]
  channelName!: string
  constructor(channelName: string, publicKey: string) {
    super({
      messages: [],
      channelName,
      _owners: [publicKey]
    })
  }

  post(message: string) {
    this.messages.push(message)
  }

  invite(publicKey: string) {
    this._owners.push(publicKey)
  }
}
