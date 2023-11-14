---
order: -20
---

# Tutorial


## Write a Smart Contract

Smart contracts are Javascript classes that extend from ``Contract``. For example, a smart contract for a simple chat is

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

Our goal is that every Javascript class that extends from Contract can be used, but we are not there yet. For example, it is currently not possible to assign to ``this`` in constructors. Instead you can initialize a smart object by passing an argument into ``super`` as shown above.

## Create a Wallet

To create a wallet call the constructor of the [``Computer``](/api/#constructor) class.

```javascript
import { Computer } from '@bitcoin-computer/lib'

const computer = new Computer({ mnemonic: 'replace this seed' })
```

You can pass in a [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic to initialize the wallet. To generate a fresh mnemonic click [here](https://iancoleman.io/bip39/). You can find more wallet configuration options [here](https://docs.bitcoincomputer.io/api/#constructor).

## Create a Smart Object

The [``computer.new``](/api/#new) function can be used to create a smart object from a smart contract. For example

```js
const a = await computer.new(Chat, ['hello'])
```

When this call is executed, a transaction is broadcast that contains both the source code of ``Chat`` as well as the expression ``new Chat('hello')``. The object ``a`` that is returned has all the properties defined in the class, and five extra properties ``_id``, ``_rev``, ``_root``, ``_owners`` and ``_amount``.

```js
expect(a).to.deep.equal({
  messages: ['hello'],
  _id: '667c...2357:0',
  _rev: '667c...2357:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820
})
```

The additional properties are explained in detail in the [Protocol](/protocol#keyword-properties). For now it is sufficient to know that ``667c...2357`` is the transaction id of the transaction that contains the expression `` `${Chat} new Chat('hello')` ``. The property ``_owners`` is an array of public keys that are allowed to update the object. The property ``_amount`` is the amount of satoshis that is stored in the object.

## Read a Smart Object

The [``computer.sync``](/api/#sync) function computes the state of smart object from the transactions on the blockchain. For example, synchronizing to ``667c...2357:0`` will return an object with the same value as ``a``.

```js
const b = await computer.sync('667c...2357:0')

expect(b).to.deep.equal(a)
```

Smart objects are readable by any user by default, but they can be [encrypted](#privacy) for privacy. The ``computer.sync`` function is deterministic, therefore multiple users can get consensus over the state of a smart object.

## Update a Smart Object

Smart objects can only be updated through function calls. Whenever a function of a smart object is called a transaction is broadcast to record the function call. Therefore it is necessary to ``await`` on all function calls.

```js
await a.post('world')

expect(a).to.deep.equal({
  messages: ['hello', 'world'],
  _id: '667c...2357:0',
  _rev: 'de43...818a:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820
})
```

Note that ``_rev`` has been update but that ``_id`` and ``_root`` stayed the same. Every time a smart object is updated a new *revision* is created and assigned to the ``_rev`` property. Revisions allow you to reconstruct each historical state of an object.

```js
const oldChat = await computer.sync(a._id)
expect(oldChat.messages).to.deep.equal(['hello'])

const newChat = await computer.sync(a._rev)
expect(newChat.messages).to.deep.equal(['hello', 'world'])
```

## Find a Smart Object

The [``computer.query``](/api/#query) function can find the latest revision of smart objects from different parameters like their ids.

```js
const [rev] = await computer.query({ ids: ['667c...2357:0']})
expect(rev).to.equal('de43...818a:0')
```

A basic pattern for many applications is to identify smart objects by their id, look up their latest revision using ``computer.query`` and then to compute their current state using ``computer.sync``. For example, in a chat, we might have the url for the chat containing the id of the chat object. We could then recover the latest state of the chat as follows:

```js
const parse = (url) => ... // extracts id from url
const id = parse(window.location)
const [rev] = await computer.query({ ids: [id] })
const obj = await computer.sync(rev)
```

## Data Ownership

Every smart object can have up to three owners. Only an owner can update the object. The owners can be set by assigning string encoded public keys to the ``_owners`` property of a smart object. If the ``_owners`` property is not assigned in a smart contract it defaults to the public key of the computer object that created the smart object.

In the chat example the initial owner is the user that created the chat with ``computer.new``. Thus only this user will be able to post to the chat. We can add a function to update the owners array to invite more guests to chat.

```js
class Chat extends Contract {
  ... // like above

  invite(pubKeyString) {
    this._owners.push(pubKeyString)
  }
}
```

## Privacy

By default, the state of all smart objects is public. However, you can restrict read access to an object by setting a property ``_readers``. If ``_readers`` is assigned to an array of public keys in a constructor of function call, the meta-data of that call is encrypted using a combination of AES and ECIES. Only the specified readers can decrypt an encrypted object using the ``computer.sync`` function.

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

A user can (only) read the state of a smart object if they have read access to the current and all previous versions of the object. It is, therefore, not possible to revoke access to a revision. However, it is possible to remove a user's ability to read the state of a smart object from a point in time forwards.

When the ``_readers`` property is set the data is end-to-end encrypted users' browsers. Even when smart objects are encrypted the flow of cryptocurrency is not obfuscated so that anti-money laundering efforts are not hindered.

## Off-Chain Storage

Not all data needs to be stored on the blockchain. For example, personal data should never be stored on chain, not even encrypted.

When the property ```_url``` of a smart object is set to the URL of a Bitcoin Computer Node, the metadata of the current function call is stored on the specified Bitcoin Computer Node. The blockchain contains a hash of the meta data and a link to where it can be retrieved.

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

Each smart object can store an amount of satoshi. By default a smart object stores a minimal (non-dust) amount. If the ``_amount`` property of a smart object is set to a number, the output storing that smart object will contain that number of satoshis. For example, consider the class ``Payment`` below.

```js
class Payment extends Contract {
  constructor(to: string, amount: number) {
    super()
    this._owners = [to]
    this._amount = amount
  }

  cashOut() {
    this._amount = 546 // min non dust amount
  }
}
```

If a user ``A`` wants to send 210.000 satoshis to a user ``B``, the user ``A`` can setup the payment as follows:

```js
const computerA = new Computer({ mnemonic: <A's seed phrase> })
const payment = computerA.new(Payment, [<B's public key>, 210000])
```

When the ``payment`` smart object is created, the wallet inside the ``computerA`` object funds the ``210.000`` satoshi that are stored in the ``payment`` object. Once user ``B`` becomes aware of the payment, he can withdraw by syncing against the object and calling the ``cashOut`` function.


```js
const computerB = new Computer({ seed: <B's seed phrase> })
const paymentB = await computerB.sync(payment._rev)
await paymentB.cashOut()
```

One more transaction is broadcast for which user ``B`` pays the fees. This transaction has two outputs: one that records that the ``cashOut`` function was called with 546 satoshi and another that spends the remaining satoshi to ``computerB.getAddress()``.
