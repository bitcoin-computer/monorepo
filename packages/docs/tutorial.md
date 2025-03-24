---
order: -20
icon: mortar-board
---

# Tutorial

In this tutorial we explain how to build a decentralized chat. We will start with a comically simple version of a one person chat, but we will work our way up to a chat platform where users can build a community and sell it trustlessly through a smart contract.

## A Smart Contract

The JavaScript program below is a smart contract for a one-person chat.

```js
import { Contract } from '@bitcoin-computer/lib'

class Chat extends Contract {
  constructor(greeting) {
    super({ messages: [greeting] }) // initialize messages array
  }

  post(message) {
    this.messages.push(message)
  }
}
```

We recommend to ignore the syntax for initializing `messages` in the constructor for now. If you are interested in the details you can find them [here](language/).

## The Client-Side Wallet

The `Computer` class is a client-side JavaScript wallet that manages a Bitcoin private-public key pair. It can create normal Bitcoin transactions but also ones that contain metadata according to the Bitcoin Computer protocol. This allows for the creation, updating, and retrieval of on-chain objects.

You can pass a [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic into the constructor to create a specific private-public key pair, or leave the `mnemonic` parameter undefined to generate a random wallet. More configuration options are described [here](./Lib/Computer/constructor.md).

```javascript
import { Computer } from '@bitcoin-computer/lib'

const computer = new Computer({ mnemonic: 'replace this seed' })
```

## Creating On-Chain Objects

The [`computer.new`](./Lib/Computer/new.md) function broadcasts a transaction inscribed with a JavaScript expression consisting of a class and a constructor call. For example, the call

```js
const chat = await computer.new(Chat, ['hello'])
```

broadcasts a transaction inscribed with the expression below.

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

The Bitcoin Computer protocol interprets such a transaction as creating an on-chain object of type `Chat` at the first output of the transaction.

The object `chat` returned from the `computer.new` call is similar to the object returned from the call `new Chat('hello')`. However it has additional properties `_id`, `_rev`, `_root`, `_owners` and `_amount`:

```js
expect(chat).to.deep.equal({
  messages: ['hello'],
  _id: '667c...2357:0',
  _rev: '667c...2357:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820n,
})
```

- The properties `_id`, `_rev`, `_root` are set to strings of the form `<id>:<num>` where `<id>` is the id of the transaction broadcast by the `computer.new` call and `<num>` is an output number.
- The `_owners` property is set to an array containing public keys.
- The `_amount` property specifies an amount in satoshis (bigint).

We refer to `chat` as an _on-chain object_.

!!!
Note that the transaction that created `chat` does not contain an encoding of the object itself. It only contains code that evaluates to its state.
!!!

## Updating On-Chain Objects

When a function is called on an on-chain object, a transaction is broadcast that is inscribed with a JavaScript expression encoding the function call and an environment determining the undefined variables in the expressions. For example, the call

```js
await chat.post('world')
```

broadcasts a transaction _tx_ that is inscribed with the data below.

```js
{
  exp: 'chat.post('world')'
  env: [chat]
}
```

The transaction's first input spends the output in which the previous revision of the `chat` object was stored.

Note that it is not possible to compute a value from the expression `chat.post('world')` alone because the variable `chat` is not defined. To make the expression determined the transaction's inscription contains an environment `env` that associates the variable name `chat` with its first input.

To compute the value of the `chat` after the `post` function is called and the transaction _tx_ is broadcast, the Bitcoin Computer protocol first computes the value stored at the output spent by the first input of _tx_. This value is then substituted for the name `chat` in the expression `chat.post('world')`. Now the expression is completely determined and can be evaluated. The new value for `chat` is associated with the first output of _tx_. In our example, this value is

```js
Chat {
  messages: ['hello', 'world'],
  _id: '667c...2357:0',
  _rev: 'de43...818a:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820n,
}
```

The property `_rev` has been updated and now refers to the first output of _tx_. The properties `_id`, `_root`, `_owners`, `_amount` have not changed. The meaning of these special properties is as follows:

- `_id` is the output in which the on-chain object was first created. As this output never changes the `_id` property never changes
- `_rev` is the output where the current revision of the object is stored. Therefore, initially, the revision is equal to the id, then the revision is changed every time the object is updated.
- `_root` is never updated. As it is not relevant to the chat example we refer the interested reader to [this](./language.md) section.
- `_owners` is set to the public key of the data owner. More on that [below](#data-ownership).
- `_amount` is set to the amount of satoshi of the output in which an on-chain object is stored. More [here](#cryptocurrency).

The properties `_id`, `_rev`, and `_root` are read only and an attempt to assign to them throws an error. The properties `_owners` and `_amount` can be assigned in a smart contract to determine the transaction that is built.

!!!
The state of the on-chain objects is never stored in the blockchain, just the JavaScript expression that creates it. This makes it possible to store data compressed to its <a target="blank" href="https://en.wikipedia.org/wiki/Kolmogorov_complexity">Kolmogorov complexity</a> which is optimal.
!!!

## Reading On-Chain Objects

The [`computer.sync`](./Lib/Computer/sync.md) function computes the state of an on-chain object given its revision. For example, if the function is called with an the id of an on-chain object, it returns the initial state of the object

```js
const initialChat = await computer.sync(chat._id)

expect(initialChat.messages).deep.eq(['hello'])
```

If `computer.sync` is called with latest revision it returns the current state.

```js
const latestChat = await computer.sync(chat._rev)

expect(latestChat.messages).deep.eq(['hello', 'world'])
expect(latestChat).to.deep.equal(chat)
```

## Finding On-Chain Objects

The [`computer.query`](./Lib/Computer/query.md) function returns an array of strings containing the latest revisions of on-chain objects. For example, it can return the latest revision of an object given its id:

```js
const [rev] = await computer.query({ ids: [chat._id] })
expect(rev).to.equal(chat._rev)
```

A basic pattern in applications is to identify a on-chain object by its id, to look up the object's latest revision using `computer.query`, and then to compute its latest state using `computer.sync`. For example, in our chat app the url could contain a chat's id and the latest state of the chat could be computed as shown below.

```js
// Extract the id from the url
const id = urlToId(window.location)

// Look up the latest revision
const [rev] = await computer.query({ ids: [id] })

// Compute the latest state
const latestChat = await computer.sync(rev)
```

`computer.query` can also return all revisions of on-chain objects owned by a public key. This could be useful for creating a user page for the chat application.

```js
// Get public key from a client side wallet
const publicKey = computer.getPublicKey()

// Look up all revisions owned by user
const revs = await computer.query({ publicKey })
```

It is also possible to navigate the revision history of a on-chain object using [`computer.next`](./Lib/Computer/next.md) and [`computer.prev`](./Lib/Computer/prev.md):

```js
// Navigating forward
expect(await computer.next(chat._id)).eq(chat._rev)

// Navigating backward
expect(await computer.prev(chat._rev)).eq(chat._id)
```

Note that the code above only works because there are only two revisions of the chat in our example, otherwise `computer.next` or `computer.prev` would have to be called multiple times.

## Data Ownership

We are finally ready to elevate our one-person chat to a three-person chat! We will explain how to allow an unlimited number of users [further below](#bitcoin-script-support).

The _owner_ of an on-chain object is the user that can spend the output that stores it, just like the owner of the satoshi in a output is the user that can spend it.

The owners can be set by assigning the `_owners` property. If this property is set to an array of public keys, the output script is a 1-of-n bare multisig script, meaning that any owner can update the object. If it is undefined the owner default to the public key of the computer object that created the on-chain object.

In the chat example, the initial owner is the public key of the `computer` object on which `computer.new` function was called. Only that user can post to the chat. We can add a function `invite` to update the owners array to allow other users to post.

```js
class Chat extends Contract {
  ... // like above

  invite(pubKeyString) {
    this._owners.push(pubKeyString)
  }
}
```

!!!
While a user can never change an on-chain object that they do not own, the owner has complete control. This includes the ability to destroy their own objects by spending their outputs with a transaction that does not conform to the Bitcoin Computer protocol. In this case the value of the object will be an Error value.

This is reminiscent of the real world where people have the right to destroy their own property but not the right to destroy somebody else's property.
!!!

## Encryption

By default, the state of an on-chain object is public in the sense that any user can compute its state by using `computer.sync`. However, read access can be restricted by setting an objects `_readers` property to an array of public keys. If `_readers` is assigned, the meta-data on the transaction is encrypted using a combination of AES and ECIES so that only the specified readers have read access.

For example, to ensure that only people invited to the chat can read the messages, you can update our example code as follows:

```js
class Chat extends Contract {
  constructor(greeting, owner) {
    super({
      messages: [greeting],
      _readers: [owner],
    })
  }

  invite(pubKey) {
    this._owners.push(pubKey)
    this._readers.push(pubKey)
  }
}
```

As all updates to an on-chain object are recorded in immutable transactions it is not possible to restrict access to a revision once it is granted. It is also not possible to grant read access to a revision without granting read access to its entire history as the entire history is needed to compute the value of a revision. It is however possible to revoke read access from some point forward or to restrict access to all revisions all together.

!!!
When on-chain objects are encrypted the flow of cryptocurrency is not obfuscated.
!!!

## Off-Chain Storage

It is possible to store the metadata of a transaction off-chain in the database of a Bitcoin Computer Node. In this case a hash of the metadata and a url where the metadata can be retrieved is stored on chain, while the metadata itself is stored on the server. To use this feature, set a property `_url` of an on-chain object to the URL of a Bitcoin Computer Node.

For example, if users want to send images to the chat that are too large to store on-chain, they can use the off-chain solution:

```js
class Chat extends Contract {
  // ... as above

  post(message) {
    this._url = null
    this.messages.push(message)
  }

  postImage(image) {
    this._url = 'https://my.bitcoin.computer.node.example.com'
    this.messages.push(image)
  }
}
```

## Cryptocurrency

Recall that an on-chain object is stored in an output and that the owners of the object are the users that can spend the output. Thus the owners of an object are always the owners of the satoshi in the output that stores the object. We therefore say that the satoshi are stored in the on-chain object.

The amount of satoshi in the output of an on-chain object can be configured by setting the `_amount` property to a number (bigint). If this property is undefined, the object will store an a minimal (non-dust) amount.

If the value of the `_amount` property is increased, the additional satoshi must be provided by the wallet of the `computer` object that executes the call. In the case of a constructor call with `computer.new` that is that `computer` object. In the case of a function call it is the `computer` object that created the on-chain object.

If the value of the `_amount` property is decreased, the difference in satoshi is credited to the associated computer object's wallet.

For example, if a user _Alice_ wants to send 21000 satoshis to a user _Bob_, then _Alice_ can create an on-chain object of the following `Payment` class.

```js
class Payment extends Contract {
  constructor(amount, recipient) {
    super({ _amount, _owners: [recipient] })
  }

  cashOut() {
    this._amount = 546n // minimal non-dust amount
  }
}

const computerAlice = new Computer({ mnemonic: mnemonicAlice })
const payment = computerA.new(Payment, [21000n, pubKeyBob])
```

When the `payment` on-chain object is created, the wallet inside the `computerA` object funds the 21000 satoshi that are stored in the `payment` object. Bob can withdraw the satoshi by calling the `cashOut` function.

```js
const computerB = new Computer({ seed: <B's mnemonic> })
const paymentB = await computerB.sync(payment._rev)
await paymentB.cashOut()
```

## Expressions

The syntax for on-chain objects introduced above provides a high-level abstraction over the Bitcoin Computer protocol. However we also provide low-level access to the protocol via the `computer.encode()` function. This gives more control over the transaction being built, enabling advanced applications like DEXes.

The [`computer.encode`](./Lib/Computer/encode.md) function takes three arguments:

- A JavaScript expression `exp`,
- an environment `env` that maps names to output specifiers,
- and a module specifier `mod`.

It returns a transaction but does not broadcast it. Therefore calling the `encode` function does not alter the state of any on-chain object. In addition to the transaction the function returns an object `effect` that represents the state that will emerge on-chain if the transaction is broadcast.

!!!success
The `effect` object returned from the `encode` function provides absolute certainty about a transaction's impact before broadcasting. If the transaction is included, the state updates exactly as reflected in the `effect` object, independent of other users' transactions; otherwise, the state remains unchanged.
!!!

The `effect` object has two sub-objects: `res` contains the value returned from the expression and `env` contains the side-effect, specifically the new values of the names in the environment.

The code below is equivalent to calling `await computer.new(Chat, ['hello'])`. In fact the `computer.new` function is just syntactic sugar for using the `encode` function.

```js
const exp = `${Chat} new Chat('hello')`

const { tx, effect } = await computer.encode({ exp })

expect(effect).deep.eq({
  res: {
    messages: ['hello'],
    _id: '667c...2357:0',
    _rev: '667c...2357:0',
    _root: '667c...2357:0',
    _owners: ['03...'],
    _amount: 5820n,
  }
  env: {}
})
```

The encode function allows fine grained control over the transaction being built via an options object as a second argument that can specify

- whether to fund the transaction
- whether to include or exclude specific UTXOs when funding
- whether to sign the transaction
- which sighash type to use when signing
- which inputs to sign
- whether to mock objects to do not exist yet on-chain (see more [below](#mocking))

## Module System

The [`computer.deploy`](./Lib/Computer/deploy.md) function stores a JavaScript modules on the blockchain. It returns a string representing the output where the module is stored. Modules can refer to one another using the familiar `import` syntax. In the example below `moduleB` refers to `moduleA` via `specifierA`. Module specifiers can be passed into `computer.encode` and `computer.new` functions.

```js
const moduleA = 'export class A extends Contract {}'
const specifierA = await computer.deploy(moduleA)

const moduleB = `
  import { A } from '${specifierA}'
  export class B extends A {}
`
const specifierB = await computer.deploy(moduleB)

const { tx } = await computer.encode({
  exp: `new B()`,
  mod: specifierB,
})
```

Modules can be loaded from the blockchain using [computer.load](./Lib/Computer/load.md).

```js
const loadedB = await computer.load(specifierB)
expect(loadedB).eq(moduleB)
```

## Bitcoin Script Support

In addition to setting the `_owners` property to an array of strings as described [above](#data-ownership), it is possible to set `_owners` to a string encoding a Bitcoin Script ASM. In this case the output created for that on-chain object will use a pay-to-script-hash (p2sh) output with that script.

```js
import { Contract } from '@bitcoin-computer/lib'

class A extends Contract {
  constructor() {
    super({
      n: 1,
      _owners: 'OP_3 OP_EQUAL',
      _amount: 100000000n,
    })
  }

  inc() {
    this.n += 1
    this._amount = 100000000n - 100000n
  }
}
```

In order to spend an output with a p2sh script, one needs to alter the transaction returned from `encode`. The example below shows how to build a transaction with an inputs script `OP_3`.

```js
import { Computer } from '@bitcoin-computer/lib'
import { payments } from '@bitcoin-computer/nakamotojs'

const computer = new Computer()
const a = await computer.new(A)

// Encode transaction that encodes update
const { tx } = await computer.encode({
  // Call the 'inc' function
  exp: 'a.inc()',

  // Spend output at revision a._rev
  env: { a: a._rev },

  // transaction can only be signed and funded when it is completed
  sign: false,
  fund: false,
})

// The code below creates a p2sh input script `OP_3`. To create a p2sh input
// script the redeem-script of the output script being spent needs to be
// specified as well. In our case the output redeem-script is `a._owners`.
const { input } = payments.p2sh({
  redeem: {
    // Specify input script ASM
    input: fromASM('OP_3'),

    // Specify the output redeem-script
    output: fromASM(a._owners),
  },
})

// Add input script to transaction
tx.setInputScript(0, input!)

// Broadcast transaction
await computer.broadcast(tx)
```

A Bitcoin Script could be used to allow more than three users to post to a chat. The idea is to use a Taproot script that has one spending path for each user. Taproot scripts have a large number of spending paths, so a large number of users could be supported. When this kind of Taproot chat is updated, only the spending path for the posting user needs to be revealed, meaning that the cost to post is constant and independent of the number of users in the chat.

## Mocking

Recall that an on-chain object is an object that is associated with the output of a transaction that is built according to the Bitcoin Computer protocol. We will call such an object an _off-chain object_ if the transaction has not been broadcasted yet.

It is sometimes necessary to update off-chain objects. For example, if smart contracts are used in payment channels or networks. Or, if an object is sold to an unknown buyer: in this case the object that the buyer will use is not known when seller build the transaction (see [here](./Examples/sale.md)).

Mocking is a technique for updating off-chain objects. The `mocks` property of the `encode` function can be set to a mapping from variable names to mocked objects. Here, a _mocked object_ is an object that has `_id`, `_rev` and `_root` set to strings `mock-${hex}:${num}` where `hex` is a string of 64 hexadecimal characters and `num` is a number. In addition a revision needs to be specified for the mocked variable name in the `env` array (if the revision in `env` does not match the revision of the mocked object for the same variable name the revision in `env` takes precedence). When the transaction is built, it is assumed that the value stored at the revision specified in `env` evaluates to the value in the `mocks` for the same variable name.

The Bitcoin Computer library exports a class [`Mock`](./Lib/Mock/index.md) that makes it easy to create mocked objects. The example below shows how a mocked object can be used. Note that in the example, the object `a` is created after the transaction that spends it. Thus the revision of `a` is not known when `tx` is built. Once `a` is created on-chain and its revision becomes known, the code below updated the input of `tx` to spend the revision of `a`.

```js
import { Mock, Contract } from '@bitcoin-computer/lib'

class M extends Mock {
  constructor() {
    super({ n: 1 })
  }

  inc() {
    this.n += 1
  }
}

class A extends Contract {
  constructor() {
    super({ n: 1 })
  }

  inc() {
    this.n += 1
  }
}

// Create Mock
const m = new M()

// Create transaction that updates an object a that does not exist yet
const { tx } = await computer.encode({
  // The update expression
  exp: `a.inc()`,

  // Map variable name a to mock m
  mocks: { a: m },

  // Specify that the input that spends a points to m._rev
  env: { a: m._rev },

  // The transaction can only be funded and signed once it is finalized
  fund: false,
  sign: false,
})

// Create on-chain object
const a = await computer.new(A)

// Update outpoint of tx to spend a's revision
const [txId, num] = a._rev.split(':')
const index = parseInt(num, 10)
tx.updateInput(0, { txId, index })

// Fund, sign and broadcast transaction
await computer.fund(tx)
await computer.sign(tx)
await computer.broadcast(tx)
```

## Building the Chat Platform

We now sketch how a chat platform could be built where moderators can create a community and then sell it over the internet.

Every community would be represented through multiple on-chain objects that are similar to the `Chat` object. In order to guarantee a fast load time, each of these objects contains a constant-size chunk of messages (have a look at [this](./optimizations.md) section to understand the build-in optimizations). When the current chunk object is full, a new object that would refer to the previous chunk would be created. When the chat app is loaded it syncs to the the latest chunk. If the user scrolls to the first message of the chunk, the user could click a button to load the previous chunk.

In order to support an unlimited number of users, the technique sketched at the end of [this](#bitcoin-script-support) section can be used. However the kinds of scripts described there have a 1-of-n ownership structure which can lead to abuse (for example, any member of the chat could destroy the current chunk object). This could be mitigated by maintaining an additional "moderators" object for every community. Moderators could spin up a new chunk in the case of abuse and point to the message before the chat was destroyed. Moderators could also have other privileges like kicking out users and deleting messages from the UI. The moderatos object could have an n-of-m ownership structure. To sell a community one can sell the moderators object. This can be accomplished by using the technique described [here](./Examples/sale.md).

If you would like to build such an app please reach out, we would be delighted to try to help you.
