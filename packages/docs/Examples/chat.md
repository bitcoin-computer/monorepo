---
order: -20
icon: comment-discussion
---

# Encrypted Chat

## Smart Contract

A chat is just a smart object with a property `messages` of type `string[]`. Like all smart objects it has an `_owners` property set to the current data owner. The [`_readers`](./how-it-works.md#keyword-properties-control-the-transaction-being-built) property can be used to restrict read access. 

```ts
class Chat extends Contract {
  messages: string[]
  _owners: string[]
  _readers: string[]

  constructor(publicKeys: string[]) {
    super({
      messages: [],
      _owners: publicKeys,
      _readers: publicKeys
    })
  }

  post(message) {
    this.messages.push(message)
  }

  remove(publicKey: string) {
    this._readers = this._readers.filter(o => o !== publicKey)
    this._owners_ = this._owners_.filter(o => o !== publicKey)
  }
}
```

## Usage

A new chat can be created using the [`new`](./API/new.md) function. Note that Bob can initially post to the chat and read it's state as Bob's public key was added to the `_owners` array and `_readers` array by Alice upon creation of the chat. 

Later, Alice called the `remove` function removing Bob's public key from these arrays. After this point Bob cannot read or write anymore.

Eve was never part of the `_readers` array so she cannot read the content of the chat, nor write to it.

```ts
// Create and fund wallets
const alice = new Computer()
const bob = new Computer()
const eve = new Computer()
await alice.faucet(0.01e8)
await bob.faucet(0.01e8)

// Alice creates a chat with Bob and posts a message
const publicKeys = [alice.getPublicKey(), bob.getPublicKey()].sort()
const alicesChat = await alice.new(Chat, [publicKeys])

// Alice can post to the chat
await alicesChat.post('Hi')

// Bob can read the current state of the chat and post a message
const bobsChat = await bob.sync(alicesChat._rev) as Chat
await bobsChat.post('Yo')
expect(bobsChat.messages).deep.eq(['Hi', 'Yo'])

// Eve was not invited and can neither read nor write
try {
  // This line throws an error
  await eve.sync(alicesChat._rev)
  expect(true).eq(false)
} catch(err) {
  expect(err.message).not.undefined
}

// Alice removes Bob's public key from the _readers array
await alicesChat.remove(bob.getPublicKey())

// Now Bob cannot read the latest state of the chat anymore
try {
  // This line throws an error
  await bob.sync(alicesChat._rev)
  expect(true).eq(false)
} catch(err) {
  expect(err.message).not.undefined
}
```