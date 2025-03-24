---
order: -20
icon: comment-discussion
---

# Chat

## Smart Contract

The smart contract below creates a chat that can be initialized with an array of participants. All messages are encrypted so that only the members can read the messages. It is not possible to add a new participant, but any current participant can remove another participant from the chat.

```ts
class Chat extends Contract {
  messages: string[]
  _owners: string[]
  _readers: string[]

  constructor(publicKeys: string[]) {
    super({
      messages: [],
      _owners: publicKeys,
      _readers: publicKeys,
    })
  }

  post(message) {
    this.messages.push(message)
  }

  remove(publicKey: string) {
    const isNotPublicKey = (o) => o !== publicKey
    this._readers = this._readers.filter(isNotPublicKey)
    this._owners = this._owners.filter(isNotPublicKey)
  }
}
```

## Usage

A new chat can be created using the [`new`](../Lib/Computer/new.md) function. Note that Bob can initially post to the chat and read it's state as Bob's public key was added by Alice to the `_owners` array and to the `_readers` array upon creation of the chat.

Later, Alice called the `remove` function removing Bob's public key from these arrays. After this point Bob cannot read or write anymore.

```ts
// Create and fund wallets
const alice = new Computer()
const bob = new Computer()
await alice.faucet(0.01e8)
await bob.faucet(0.01e8)

// Alice creates a chat with Bob and posts a message
const publicKeys = [alice.getPublicKey(), bob.getPublicKey()]
const alicesChat = await alice.new(Chat, [publicKeys])

// Alice can post to the chat
await alicesChat.post('Hi')

// Bob can read the current state of the chat and post a message
const bobsChat = await bob.sync(alicesChat._rev)
await bobsChat.post('Yo')
expect(bobsChat.messages).deep.eq(['Hi', 'Yo'])

// Alice removes Bob's public key from the _readers array
await alicesChat.remove(bob.getPublicKey())

// Now Bob cannot read the latest state of the chat anymore
try {
  // This line throws an error
  await bob.sync(alicesChat._rev)
  expect(true).eq(false)
} catch (err) {
  expect(err.message).not.undefined
}
```

## Code

You can find the code [here](https://github.com/bitcoin-computer/monorepo/blob/main/packages/chat/README.md).
