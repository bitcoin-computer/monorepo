---
order: -20
icon: mortar-board
---

# Tutorial

In this tutorial we explain how to build a decentralized chat. We will start with a comically simple version but we will work our way up to a real world chat.

## Write a Smart Contract

The Javascript program below is a smart contract for a one-person chat.

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

We recommend to ignore the syntax for initializing `messages` in the constructor for now. If you are interested in the details you can find them [here](language/#assigning-to-this-in-constructors-is-prohibited).

## Create a Client-Side Wallet

The `Computer` class is a client-side Javascript wallet that manages a Bitcoin private-public key pair. It can create normal Bitcoin transactions but also ones that contain metadata according to the Bitcoin Computer protocol. This allows for the creation, updating, and retrieval of on-chain objects.

You can pass a [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) mnemonic into the constructor to create a specific private-public key pair, or leave the `mnemonic` parameter undefined to generate a wallet from a random mnemonic. More configuration options are described [here](/lib/constructor/).

```javascript
import { Computer } from '@bitcoin-computer/lib'

const computer = new Computer({ mnemonic: 'replace this seed' })
```

## Create an On-Chain Object

The [`computer.new`](/api/new) function broadcasts a transaction inscribed with a Javascript expression consisting of a class and a constructor call. For example, the call

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

The Bitcoin Computer protocol interprets such a transaction as creating an on-chain object of type `Chat` at an output of the transaction.

The object `chat` returned from the `computer.new` call is similar to the object returned from the call `new Chat('hello')`. However it has additional properties `_id`, `_rev`, `_root`, `_owners` and `_amount`:

```js
expect(chat).to.deep.equal({
  messages: ['hello'],
  _id: '667c...2357:0',
  _rev: '667c...2357:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820,
})
```

- The properties `_id`, `_rev`, `_root` are set to strings of the form `<tx-id>:<out-num>` where `<tx-id>` is the id of the transaction broadcast by the `computer.new` call.
- The `_owners` property is set to an array containing public keys.
- The `_amount` property specifies an amount in satoshis.

We refer to `chat` as an _on-chain object_.

!!!
Note that the transaction that created `chat` does not contain an encoding of the object itself. It only contains code that evaluates to its state.
!!!

## Update an On-Chain Object

When a function is called on an on-chain object, a transaction is broadcast that is inscribed with a Javascript expression encoding the function call and an environment determining the undefined variables in the expressions. For example, the call

```js
await chat.post('world')
```

broadcasts a transaction _tx_ that is inscribed with the data below.

```js
{
  exp: 'chat.post('world')'
  env: { chat: 0 }
}
```

The transaction's zeroth input spends the output in which the previous revision of the `chat` object was stored.

Note that it is not possible to compute a value from the expression `chat.post('world')` alone because the variable `chat` is not defined. To make the expression determined the transaction's inscription contains an environment `env` that associates the variable name `chat` with its zeroth input.

To compute the value of the `chat` after the `post` function is called and the transaction _tx_ is broadcast, the Bitcoin Computer protocol first computes the value stored at the output spent by the zeroth input of _tx_. This value is then substituted for the name `chat` in the expression `chat.post('world')`. Now the expression is completely determined and can be evaluated. The new value for `chat` is associated with the zeroth output of _tx_. In our example, this value is

```js
Chat {
  messages: ['hello', 'world'],
  _id: '667c...2357:0',
  _rev: 'de43...818a:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820,
}
```

The property `_rev` has been updated and now refers to the zeroth output of _tx_. The properties `_id`, `_root`, `_owners`, `_amount` have not changed. The meaning of these special properties is as follows:

- `_id` is the output in which the on-chain object was first created. As this output never changes the `_id` property never changes
- `_rev` is the output where the current revision of the object is stored. Therefore, initially, the revision is equal to the id, then the revision is changed every time the object is updated.
- `_root` is never updated. As it is not relevant to the chat example we refer the interested reader to [this](./language.md/#control-keyword-properties) section.
- `_owners` is set to the public key of the data owner. More on that [below](#data-ownership).
- `amount` is set to the amount of satoshi of the output in which an on-chain object is stored. More [here](#cryptocurrency).

The properties `_id`, `_rev`, and `_root` are read only and an attempt to assign to them will throw an error. The properties `_owners` and `_amount` can be assigned in a smart contract to determine the transaction that is built.

!!!
The state of the on-chain objects is never stored in the blockchain, just the Javascript expression that creates it. This makes it possible to store data compressed to its <a target="blank" href="https://en.wikipedia.org/wiki/Kolmogorov_complexity">Kolmogorov complexity</a> which is optimal.
!!!

## Read an On-Chain Object

The [`computer.sync`](/api/sync) function computes the state of an on-chain object given its revision. For example, if the function is called with an the id of an on-chain object, it returns the initial state of the object

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

## Find On-Chain Objects

### Find the Latest Revisions

The [`computer.query`](/api/query) function returns an array of strings containing the latest revisions of on-chain objects. For example, it can return the latest revision of an object given its id:

```js
const [rev] = await computer.query({ ids: [chat._id] })
expect(rev).to.equal(chat._rev)
```

A basic pattern in applications is to identify a on-chain object by its ids, look up the object's latest revision using `computer.query`, and then to compute its latest state using `computer.sync`. For example, in our chat app the url could contain a chat's id and the latest state of the chat could be computed as shown below.

```js
const urlToId = (url) => ... // extracts the id from the url
const id = urlToId(window.location)
const [rev] = await computer.query({ ids: [id] })
const latestChat = await computer.sync(rev)
```

### Find All Objects of a User

`computer.query` can also return all revisions of on-chain objects owned by a public key. This could be useful for creating a user page for the chat application.

```js
const publicKey = computer.getPublicKey()
const revs = await computer.query({ publicKey })
```

### Navigating the History

It is also possible to navigate the revision history of a on-chain object using [`computer.next`](lib/next.md) and [`computer.prev`](lib/prev.md):

```js
expect(await computer.next(chat._id)).eq(chat._rev)
expect(await computer.prev(chat._rev)).eq(chat._id)
```

Note that the code above only works because there are only two revisions of the chat in our example, otherwise `computer.next` or `computer.prev` would have to be called multiple times.

## Data Ownership

We are finally ready to elevate our one-person chat to a multi-person chat!

The _owner_ of an on-chain object is the user that can spend the output that stores it, just like the owner of the satoshi in a output is the user that can spend it.

The owners can be set by assigning the `_owners` property. If this property is set to an array of public keys, the output script is a 1-of-n bare multisig script. If it is set to an ASM encoded script the output will have that script, more on that [later](#bitcoin-script-support). If the `_owners` property is not assigned the owners default to the public key of the computer object that created the on-chain object.

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

By default, the state of an on-chain object is public in the sense that any user can compute the state from its revision using `computer.sync`. However, you can restrict read access to an object by setting its `_readers` property to an array of public keys. If `_readers` is assigned, the meta-data on the transaction is encrypted using a combination of AES and ECIES so that only the specified readers have read access.

For example, if we want to ensure that only people invited to the chat can read the messages, we can update our example code as follows:

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

It is possible to store the metadata of a transaction off-chain in the database of a Bitcoin Computer Node. In this case a hash of the data and a url where the metadata can be retrieved is stored on chain, while the metadata itself is stored on the server. To use this feature, set a property `_url` of an on-chain object to the URL of a Bitcoin Computer Node.

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

Recall that an on-chain object is stored in an output and that the owners of the on-chain object are the users that can spend the output. Thus the owners of an on-chain object are always the owners of the satoshi in the output that stores it. We therefore say that the satoshi are stored in the on-chain object.

The amount of satoshi in the output of an on-chain object can be configured by setting the `_amount` property to a number. If this property is undefined, the object will store an a minimal (non-dust) amount.

If the value of the `_amount` property is increased, the additional satoshi must be provided by the wallet of the `computer` object that executes the call. In the case of a constructor call with `computer.new` that is that `computer` object. In the case of a function call it is the `computer` object that created the on-chain object.

If the value of the `_amount` property is decreased, the difference in satoshi is credited to the wallet with the associated computer object.

For example, if a user _Alice_ wants to send 21000 satoshis to a user _Bob_, then _Alice_ can create an on-chain object of the following `Payment` class.

```js
class Payment extends Contract {
  constructor(amount, recipient) {
    super({ _amount, _owners: [recipient] })
  }

  cashOut() {
    this._amount = 546 // minimal non-dust amount
  }
}

const computerAlice = new Computer({ mnemonic: mnemonicAlice })
const payment = computerA.new(Payment, [21000, pubKeyBob])
```

When the `payment` on-chain object is created, the wallet inside the `computerA` object funds the 21000 satoshi that are stored in the `payment` object. Bob can withdraw the satoshi by calling the `cashOut` function.

```js
const computerB = new Computer({ seed: <B's mnemonic> })
const paymentB = await computerB.sync(payment._rev)
await paymentB.cashOut()
```

## Expressions

The syntax for on-chain objects introduced provides a high-level abstraction over the transactions of the Bitcoin Computer protocol. However we also provide low-level access to the protocol via the [`computer.encode()`](./lib/encode) function. This gives more control over the transaction being built, enabling advanced applications like DEXes.

The [`computer.encode`](./lib/encode.md) function takes three arguments:

- A Javascript expression `exp`,
- an environment `env` that maps names to output specifiers,
- and a module specifier `mod`.

It returns a transaction but does not broadcast it. Therefore calling the `encode` function does not alter the state of any on-chain object. In addition to the transaction the function returns an object `effect` that represents the state that will emerge on-chain if the transaction were included in the blockchain. If the transaction is not included, the on-chain state will not change. This gives the user complete predictability over the state change that will be induced by their action.

The `effect` object has two sub-objects: `res` contains the value returned from the expression and `env` contains the side-effect, specifically the new values of the names in the environment.

The code below is equivalent to calling `await computer.new(Chat, ['hello'])`. In fact the smart contract abstraction introduced above is just syntactic sugar for using the `encode` function.

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
    _amount: 5820,
  }
  env: {}
})
```

The encode function allows fine grained control over the transaction being built via an options object as a second parameter. Specifically one can specify

- whether to fund the transaction
- whether to include or exclude specific UTXOs when funding
- whether to sign the transaction
- which sighash type to use
- which inputs to sign
- to use a technique called mocking in order to build transactions when some of its inputs aren't known yet (see more below)

## Module System

The [`computer.deploy`](./Lib/deploy.md) function stores an ES6 modules on the blockchain. It returns a string representing the output where the module is stored. Modules can refer to one another using the familiar `import` syntax.

```js
const moduleA = 'export class A extends Contract {}'
const specifierA = await computer.deploy(moduleA)

const moduleB = `
  import { A } from '${specifierA}'
  export class B extends A {}
`
const specifierB = await computer.deploy(moduleB)
```

Note that `moduleB` refers to `moduleA` via `specifierA`.

These modules can also be loaded from the blockchain using [computer.load](./lib/load.md).

```js
const loadedB = await computer.load(specifierB)
expect(loadedB).eq(moduleB)
```

Modules can also be passed into `computer.encode`:

```js
const { tx } = await computer.encode({
  exp: `new B()`,
  mod: specifierB,
})
```

## Bitcoin Script Support

Todo

## Mocking

Todo
