---
order: -30
---

# Tutorial


## Write a Smart Contract

Smart contracts are Javascript or Typescript classes that extend from ``Contract``. For example, a smart contract for a simple chat is

```js
import { Contract } from '@bitcoin-computer/lib'

class Chat extends Contract {
  constructor(greeting) {
    super({ messages: [greeting] })
  }

  post(message) {
    this.messages.push(message)
  }
}
```

Note that it is not possible to assign to ``this`` in constructors. Instead you can initialize a smart object by passing an argument into ``super`` as shown above.

## Create a Computer Object

You need to create an instance of the `Computer` class in oder to deploy smart contracts and create smart objects.

```javascript
import { Computer } from '@bitcoin-computer/lib'

const computer = new Computer({ mnemonic: 'replace this seed' })
```

You can pass in a [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic to initialize the wallet in the computer object. To securely generate a random mnemonic leave the ``mnemonic`` key undefined. You can find more configuration options [here](/api/constructor/).

## Create a Smart Object

The [``computer.new``](/api/new) function creates a smart object from a smart contract.

```js
const chat = await computer.new(Chat, ['hello'])
```

The object ``chat`` that is returned has the properties defined in the class and five extra properties ``_id``, ``_rev``, ``_root``, ``_owners`` and ``_amount``.

```js
expect(chat).to.deep.equal({
  messages: ['hello'],
  _id: '667c...2357:0',
  _rev: '667c...2357:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820
})
```

The property ``_owners`` is an array of public keys that are able to spend that UTXO and the property ``_amount`` is the amount of satoshis in that UTXO. The meaning of the other properties are explained below.

The properties `_id`, `_rev`, `_root` reference a transaction that is broadcast when the expression `await computer.new(Chat, ['hello'])` is evaluated. This transaction encodes the expression 

```js
class Chat extends Contract {
  constructor(greeting) {
    super({ messages: [greeting] })
  }

  post(message) {
    this.messages.push(message)
  }
}

new Chat('hello')
```

Another user can download this transaction and evaluate this expression to obtain a copy of the smart object. This can be done using the `computer.sync` function described in the next section.

## Read a Smart Object

The [``computer.sync``](/api/sync) function computes the state of smart object. For example, synchronizing to ``667c...2357:0`` will return an object with the same value as ``chat``.

```js
expect(await computer.sync('667c...2357:0')).to.deep.equal(chat)
```

You can find more details about how this works [here](./how-it-works.md#storing-values).

## Update a Smart Object

A Smart object can be updated by calling one of it's functions. Note that you have to ``await`` on all function calls to read the latest state.

```js
await chat.post('world')

expect(chat).to.deep.equal({
  messages: ['hello', 'world'],
  _id: '667c...2357:0',
  _rev: 'de43...818a:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820
})
```

When a function is called, a transaction is broadcast that inscribes the expression of the function call. In the example, the transaction with id ``de43...818a`` inscribes the expression

```js
chat.post('world')
```

Note that the ``_rev`` property of the ``chat`` object has been updated to ``de43...818a:0``. Every time a smart object is updated a new *revision* is created. The corresponding transaction id and output number is assigned to the ``_rev`` property. The ``_id`` property is never updated and is a unique identifier for each smart object. You can find more details about updating smart object [here](./how-it-works.md#updating-values).


The ``computer.sync`` function maps revisions to historical states. It can be called with any historical revision. It will return the current state for the latest revision.

```js
const oldChat = await computer.sync(chat._id)
expect(oldChat.messages).to.deep.equal(['hello'])

const newChat = await computer.sync(chat._rev)
expect(newChat.messages).to.deep.equal(['hello', 'world'])
```

## Find a Smart Object

The [``computer.query``](/api/query) function returns the latest revision of a smart objects. It can be called with many different kinds of arguments, for example object one or more ids:

```js
const [rev] = await computer.query({ ids: ['667c...2357:0']})
expect(rev).to.equal('de43...818a:0')
```

A basic pattern for many applications is to identify a smart object by its id, look up the object's latest revision using ``computer.query``, and then to compute its latest state using ``computer.sync``. For example, imagine a chat app where the url would contain the id of a specific chat. The app could compute the latest state of the chat as follows:

```js
const urlToId = (url) => ...
const id = urlToId(window.location)
const [rev] = await computer.query({ ids: [id] })
const obj = await computer.sync(rev)
```

## Data Ownership

Every smart object can have up to three owners. Only an owner can update the object. The owners can be set by assigning string encoded public keys to the ``_owners`` property of a smart object. If the ``_owners`` property is not assigned in a smart contract it defaults to the public key of the computer object that created the smart object.

In the chat example the initial owner is the public key of the ``computer`` object on which ``computer.new`` function was called. Thus only a user with the private key for that public key will be able to post to the chat. We can add a function `invite` to update the owners array to allow more users to post.

```js
class Chat extends Contract {
  ... // like above

  invite(pubKeyString) {
    this._owners.push(pubKeyString)
  }
}
```

## Privacy

By default, the state of all smart objects is public in the sense that any user can call the ``computer.sync`` function on an object's revision. However, you can restrict read access to an object by setting its ``_readers`` property to an array of public keys. If ``_readers`` is assigned, the meta-data on the transaction is encrypted using a combination of AES and ECIES. Only the specified readers can decrypt an encrypted object using the ``computer.sync`` function.

For example, if we want to ensure that only people invited to the chat can read the messages, we can update our example code as follows:

```js
class Chat extends Contract {
  constructor(greeting, owner) {
    super({
      messages: [greeting],
      _readers: [owner]
    })
  }

  invite(pubKey) {
    this._owners.push(pubKey)
    this._readers.push(pubKey)
  }
}
```

A user can (only) read the state of a smart object if they have read access to the current and all previous versions of the object. It is, therefore, not possible to revoke read access to a revision after it has been granted. However, it is possible to remove a user's ability to read the state of a smart object from a point in time forwards.

When smart objects are encrypted the flow of cryptocurrency is not obfuscated.

## Off-Chain Storage

Not all data needs to be stored on the blockchain. For example, personal information should never be stored on chain, not even encrypted.

When the property `_url` of a smart object is set to the URL of a Bitcoin Computer Node, the metadata of the current function call is stored on the specified Bitcoin Computer Node. The blockchain contains a hash of the meta data and a link to where it can be retrieved.

For example, if we want to allow users to send images that are too large to be stored on chain to the chat, we can make use of the off-chain solution:

```js
class Chat extends Contract {
  // ... as above

  post(message) {
    this._url = null
    this.messages.push(message)
  }

  postPic(picBuf) {
    this._url = 'https://my.bc.node.example.com'
    this.messages.push(picBuf)
  }
}
```

## Cryptocurrency

Each smart object can store an amount of cryptocurrency. By default a smart object stores a minimal (non-dust) amount. If the ``_amount`` property of a smart object is set to a number, the output storing that smart object will contain that number of satoshis. For example, consider the class ``Payment`` below.

```js
class Payment extends Contract {
  constructor(to: string, amount: number) {
    super()
    this._owners = [to]
    this._amount = amount
  }

  cashOut() {
    this._amount = 546 // minimal non-dust amount
  }
}
```

If a user *A* wants to send 210000 satoshis to a user *B*, the user *A* can setup the payment as follows:

```js
const computerA = new Computer({ mnemonic: <A's mnemonic> })
const payment = computerA.new(Payment, [<B's public key>, 210000])
```

When the ``payment`` smart object is created, the wallet inside the ``computerA`` object funds the 210000 satoshi that are stored in the ``payment`` object. Once user *B* becomes aware of the payment, he can withdraw by syncing against the object and calling the ``cashOut`` function.

```js
const computerB = new Computer({ seed: <B's mnemonic> })
const paymentB = await computerB.sync(payment._rev)
await paymentB.cashOut()
```

One more transaction is broadcast for which user *B* pays the fees. This transaction has two outputs: one that records that the ``cashOut`` function was called with 546 satoshi and another that spends the remaining satoshi to user *B*'s address.
