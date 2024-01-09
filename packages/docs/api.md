---
order: -40
---

# API

The ``Computer`` class can create and update smart objects and query for the location and latest revision of these.

## Overview

<table>
  <tr>
    <th>&nbsp;</th>
    <th>Method</th>
    <th>Description</th>
  </tr>

  <tr>
    <td rowspan="4">Basic</td>
    <td><a href="#constructor">constructor</a></td>
    <td>Creates an object of class Computer</td>
  </tr>

  <tr>
    <td><a href="#new">new</a></td>
    <td>Creates a smart object from a smart contract</td>
  </tr>

  <tr>
    <td><a href="#sync">sync</a></td>
    <td>Computes the state of a smart object at a given revision</td>
  </tr>

  <tr>
    <td><a href="#query">query</a></td>
    <td>Finds the latest revisions of smart object</td>
  </tr>


  <tr>
    <td rowspan="4">Advanced</td>
    <td><a href="#encode">encode</a></td>
    <td>Encodes a Javascript expression into a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="#decode">decode</a></td>
    <td>Decodes a Bitcoin transaction into a Javascript expression</td>
  </tr>

  <tr>
    <td><a href="#encodenew">encodeNew</a></td>
    <td>Encodes a constructor call into a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="#encodecall">encodeCall</a></td>
    <td>Encodes a function call into a Bitcoin transaction</td>
  </tr>


  <tr>
    <td rowspan="2">Modules</td>
    <td><a href="#deploy">deploy</a></td>
    <td>Deploys an ES6 module on the blockchain</td>
  </tr>

  <tr>
    <td><a href="#load">load</a></td>
    <td>Loads an ES6 module from the blockchain</td>
  </tr>


  <tr>
    <td rowspan="14">Wallet</td>
    <td><a href="#fund">fund</a></td>
    <td>Funds a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="#sign">sign</a></td>
    <td>Signs a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="#broadcast">broadcast</a></td>
    <td>Broadcasts a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="#send">send</a></td>
    <td>Sends satoshis to an address</td>
  </tr>

  <tr>
    <td><a href="#rpcCall">rpcCall</a></td>
    <td>Access Bitcoin's RPC interface</td>
  </tr>

  <tr>
    <td><a href="#getaddress">getAddress</a></td>
    <td>Returns the Bitcoin address of the computer wallet</td>
  </tr>

  <tr>
    <td><a href="#getbalance">getBalance</a></td>
    <td>Returns the balance in satoshi</td>
  </tr>

  <tr>
    <td><a href="#getchain">getChain</a></td>
    <td>Returns the blockchain (BTC or LTC)</td>
  </tr>

  <tr>
    <td><a href="#getnetwork">getNetwork</a></td>
    <td>Returns the network</td>
  </tr>

  <tr>
    <td><a href="#getmnemonic">getMnemonic</a></td>
    <td>Returns a BIP39 mnemonic sentence</td>
  </tr>

  <tr>
    <td><a href="#getpassphrase">getPassphrase</a></td>
    <td>Returns the passphrase</td>
  </tr>

  <tr>
    <td><a href="#getprivatekey">getPrivateKey</a></td>
    <td>Returns the private key</td>
  </tr>

  <tr>
    <td><a href="#getpublickey">getPublicKey</a></td>
    <td>Returns the public key</td>
  </tr>

  <tr>
    <td><a href="#getUtxos">getUtxos</a></td>
    <td>Returns an array of unspent transaction outputs</td>
  </tr>
</table>
<br />

## Basic

### Constructor

An instance of the ``Computer`` class is a smart contract enabled wallet. It has the usual features of a wallet like sending payments or checking the balance of an address. In addition it can create smart objects by encoding these in Bitcoin transactions and broadcasting them to the blockchain.

||| Example
```ts
import { Computer } from '@bitcoin-computer/lib'

// Bitcoin Computer wallet on LTC testnet
const computer1 = new Computer()

// Bitcoin Computer wallet on BTC testnet
const computer2 = new Computer({
  chain: 'BTC'
})

// Bitcoin Computer wallet with custom parameters
const computer3 = new Computer({
  chain: 'LTC'
  network: 'regtest',
  mnemonic: 'replace this seed'
  path: "m/44'/0'/0'/0",
  url: 'https://my-ltc-node.com',
  satPerByte: 1
})
```
||| Type
```ts
new (params: {
  // Target blockchain, defaults to 'LTC'
  chain?: 'LTC' | 'BTC' | 'DOGE',

  // Network, defaults to 'testnet'
  network?: 'mainnet' | 'testnet' | 'regtest',

  // BIP39 mnemonic phrase, defaults to a random phrase
  mnemonic?: string,

  // BIP32 path, defaults to "m/44'/0'/0'/0"
  path?: string,

  // BIP32 passphrase, defaults to ''
  passphrase?: string

  // Url of a Bitcoin Computer Node, defaults to https://node.bitcoincomputer.io
  url?: string,
  
  // set fee in satoshi per byte, defaults to 2
  satPerByte: number

  // Set dust relay fee, defaults are set for each chain
  dustRelayFee: number
} = {}) => Computer
```
|||


### new

Creates a new smart object. The parameters are a smart contract (a Javascript class inheriting from ``Contract``), a list of arguments for the constructor of the class and an optional module specifier. The arguments of the constructor can be of basic data type or smart objects.

||| Example
```ts
import { Contract } from '@bitcoin-computer/lib'

// A smart contract
class A extends Contract {
  constructor(n) {
    this.n = n
  }
}

// Create a smart object
const a = await computer.new(A, [1])

// Evaluates to true
expect(a).to.deep.equal({
  n: 1,
  _id: '667c...2357:0',
  _rev: '667c...2357:0',
  _root: '667c...2357:0',
  _owners: ['03...'],
  _amount: 5820
})
```
||| Type
```ts
<T extends new (...args: any) => any>(
  // A Javascript class
  constructor: T,

  // Arguments to the constructor of T
  args?: ConstructorParameters<T>,

  // A module specifier
  mod?: string
) => Promise<InstanceType<T> & Location>;
```
|||

Here a ``Location`` is the type

```ts
type Location = { _id: string, _rev: string, _root: string }
```

The ``new`` function builds a transaction that records the creation of a new smart object, signs it and broadcasts it. Smart objects can be updated by calling their functions, see [here](/tutorial.md#update-a-smart-object).


### sync

Returns the smart object stored at a given revision.

||| Example
```ts
// Compute smart object from revision
const synced = await computer.sync(a._rev)

// Evaluates to true for all smart objects "a"
expect(synced).to.deep.equal(a)
```
||| Type
```ts
<T extends new (...args: any) => any>(
  rev: string
) => Promise<T>;
```
|||

### query

Returns the latest revisions of smart objects. Conditions can be passed in to determine the smart objects. When multiple conditions are passed in, the latest revisions of the smart objects that satisfy all conditions are returned.

||| Examples
```ts
class A extends Contract { ... }
a = await computer.new(A)

// query by public key
const publicKey = computer.getPublicKey()
const [rev1] = await computer.query({ publicKey })
expect(rev1).to.equal(a._rev)

// query by id
const ids = [a._id]
const [rev2] = await computer.query({ ids })
expect(rev2).to.equal(a._rev)

// query by module specifier
const mod = await computer.export(`export ${A}`)
const b = await computer.new(A, [], mod)
const [rev3] = await computer.query({ mod })
expect(rev3).to.equal(b._rev)

// query by class
const contract = { class: A }
const [rev4] = await computer.query({ contract })
expect(rev4).to.equal(a._rev)

// query by multiple parameters
const [revs5] = await computer.query({
  limit: 10,
  order: 'ASC',
  contract: { class: A }
})
expect(rev5).to.equal(a._rev)
```
||| Type
```ts
(query: {
  // Return all unspent revisions
  // currently owned by a public key
  publicKey?: string

  // Return all unspent revision of
  // smart objects with these ids in
  // order
  ids: string[]

  // Return the latest revision of smart
  // objects created with this module
  // specifier
  mod: string[]

  // Return all unspent revisions of
  // smart objects from a class
  contract?: <T extends new (...args: any) => any>{
    class: T,
    args?: ConstructorParameters<T>;
  }

  // Order results
  order?: 'ASC' | 'DEC',

  // Return only limited number of revisions
  limit?: number,

  // Return results starting from offset
  offset?: number,
}) => Promise<string[]>
```
|||


## Advanced

The functions ``encode`` and ``decode`` provide the core functionality of the Bitcoin Computer: recording Javascript expressions on the blockchain and computing their values. The basic interface is syntactic sugar on top of the basic interface. The advanced interface is a more efficient than the basic interface and it provides access to advanced features.

### encode

The ``encode`` function evaluates a Javascript expression on a blockchain. It returns a [Bitcoin transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs-lib/ts_src/transaction.ts) and an object of type Effect.
```js
type EncodeResult = { tx: BitcoinLib.Transaction, effect: Effect }
type Effect = { res: unknown, env: unknown }
```
The object of type ``Effect`` captures the changes induced by evaluating the expression: It contains the result of the evaluation (property ``res``) and the side effects of the evaluation (property ``env``). The object of type ``Effect`` can be used to determine if the evaluation had the desired effect. If it did, the transaction can be broadcast to commit the update to the blockchain. If the transaction is not broadcast, the state on the blockchain does not change. The transaction can be broadcast at an arbitrarily long delay after calling ``encode``. If during the time between calling ``encode`` and broadcasting the transaction the blockchain undergoes any updates that could affect the evaluation, the miners will reject the transaction. However, if the transaction is accepted by the miners, it is guaranteed to have the effect indicated by object of type ``Effect``.

If the expression contains free variables (for example the variable ``x`` in the expression ``x.f()``) an environment must be passed in to define where the free variables are defined. Specifically, an environment is a JSON object that maps variables to their respective revisions.

If a [module specifier](#modules) is provided, the exports of that module are imported when the expression is evaluated. The module specifier can also be used to [query](#query) for all objects that were created in expressions that imported that module specifier.

Other options can customize the funding and signing process.

||| Example
```ts
// The code below works for any smart contract.
class C extends Contract {
  constructor(n) {
    this.n = n
  }
}

// Calling encode will not change the global memory.
const { effect, tx } = await computer.encode({
  exp: `${C} new C(1)`
})

// Effect captures change caused by evaluation.
expect(effect).deep.eq({
  res: { 
    n:1
    _id: '667c...2357:0',
    _rev: '667c...2357:0',
    _root: '667c...2357:0',
    _owners: ['03...'],
    _amount: 5820
  },
  env: {}
})

// The tx can be broadcast to commit the change
// to the global memory. Will be rejected by
// miners if another update might change the effect
const txId = await computer.broadcast(tx)

// Read the latest state.
const synced = await computer.sync(txId)

// The new state in memory will always equal effect.
expect(synced).deep.eq(effect)
```
||| Type
```ts
(opts: {
  // Javascript expression
  exp: string,

  // environment, maps free variables to revisions
  env?: { [s: string]: string },

  // module specifier
  mod?: string

  // fund the transaction, defaults to true
  fund?: boolean

  // include utxos when funding, defaults to []
  include?: string[]

  // exclude utxos when funding, defaults to []
  exclude?: string[]

  // sign the transaction, defaults to true
  sign?: boolean

  // specifies which part of transaction to sign
  sighashType?: number

  // sign only one input
  index?: number

  // custom input script
  script?: Buffer
}) => Promise<{
  // the changes caused by evaluating exp
  effect: Effect

  // transaction to commit the changes
  tx: BitcoinLib.Transaction
}> 
```
|||


### decode

Converts a Bitcoin transaction into a transition object. The inverse of ``encode`` if only ``exp``, ``env``, and ``mod`` are provided.

||| Example
```ts
class C extends Contract {}
const computer = new Computer()
const transition = {
  exp: `${C} new ${C.name}()`,
  env: {},
  mod: ''
}
const { tx } = await computer.encode(transition)
const decoded = await computer.decode(tx)

expect(decoded).to.deep.equal(transition)
```
||| Type
```ts
(tx: BitcoinLib.Transaction) => Promise<{
  exp: string,
  env?: { [s: string]: string },
  mod?: string
}>
```
|||

### encodeNew

Encodes a smart object creation.

||| Example
```ts
class C extends Contract { }
const computer = new Computer()
const { tx } = await computer.encodeNew({
  constructor: C
})
const decoded = await computer.decode(tx)

expect(decoded).to.deep.eq({
  exp: `${C} new C()`,
  env: {},
  mod: ''
})
```
||| Type
```ts
<T extends new (...args: any) => any>({
  constructor: T,
  args?: ConstructorParameters<T>,
  mod?: string
}) => Promise<{
  tx: BitcoinLib.Transaction
  effect: Effect
}> 
```
|||

### encodeCall

Encodes a function call on a smart object.

||| Example
```ts
class Counter extends Contract {
  n: number
  constructor() {
    super()
    this.n = 0
  }
  inc(m) {
    this.n += m
  }
}
const computer = new Computer(confs.pop())
const counter = await computer.new(Counter)
const { tx } = await computer.encodeCall({
  target: counter,
  property: 'inc',
  args: [1]
})
const decoded = await computer.decode(tx)

expect(decoded).to.deep.eq({
  exp: `__bc__.inc(1)`,
  env: { __bc__: counter._rev },
  mod: ''
})
```
||| Type
```ts
({
  target: InstanceType<T> & Location,
  property: string,
  args: Parameters<InstanceType<T>[K]>,
  mod?: string
}) => Promise<BitcoinLib.Transaction>
```
|||


## Modules

### deploy

The ``deploy`` function broadcasts a transaction containing an ES6 module. The return value is a string encoding the location where the object is stored. Modules can also import other modules that have been deployed to the blockchain previously (see example below).

Deploying your code has the advantage that many objects can import the same module. This saves transaction fees, as large pieces of code can be deployed once and then used to create or update many smart objects.

||| Example
```ts
const revA = await computer.export(
  `export class A extends Contract {}`
)

const revB = await computer.export(`
  import { A } from '${revA}'
  export class B extends A {}
`)

const transition = { exp: `new B()`, mod: revB }
const tx = await computer.encode(transition)
```
||| Type
```ts
(module: string) => Promise<string>
```
|||

Please note that modules are currently not encrypted, even if objects that use them have the ``_readers`` property set.

Previously this function was called ``export`` but this name is deprecated since version 0.16.0.

### load

Imports a ES6 module from a module specifier.

||| Example
```ts
class A extends Contract {}
const module = `export ${A}`
const rev = await computer.export(module)
const { A: AA } = await computer.import(rev)

expect(AA).to.equal(A)
```
||| Type
```ts
(name: string, rev: string) => Promise<new (...args: any) => any>;
```
|||

Previously this function was called ``import`` but this name is deprecated since version 0.16.0.

## Wallet

### fund

Funds a Bitcoin transaction.

||| Example
```ts
class C extends Contract {}
const { tx } = await computer.encode({
  exp: `${C} new ${C.name}()`
  fund: false
})
await computer.fund(tx)
```
||| Type
```ts
(tx: BitcoinLib.Transaction): Promise<void>
```
|||

### sign

Signs a Bitcoin transaction. Options can be passed in that determine which inputs to sign, the sigHash type to use, and which script to use.

||| Example
```ts
class C extends Contract {}
const tx = await computer.encode({
  exp: `${C} new ${C.name}()`
  sign: false
})
await computer.fund(tx)
computer.sign(tx)
```
||| Type
```ts
(
  tx: BitcoinLib.Transaction,
  opts: {
    inputIndex?: number
    sighashType?: number
    inputScript?: Buffer
  }
) => void
```
|||

### broadcast

Broadcasts a Bitcoin transaction to the Bitcoin mining network.

||| Example
```ts
class C extends Contract {}
const transition = { exp: `${C} new C()` }
const { tx } = await computer.encode(transition)
const txId = await computer.broadcast(tx)
```
||| Type
```ts
(tx: BitcoinLib.Transaction) => Promise<string>
```
|||

### send

Sends a payment.

||| Example
```ts
const satoshi = 100000
const address = '1FFsHfDBEh57BB1nkeuKAk25H44U7mmMXd'
const balance = await computer.send(satoshi, address)
```
||| Type
```ts
(amount: number, address: string) => Promise<string>
```
|||

### rpcCall

Calls a Bitcoin RPC method with the given parameters.

||| Example
```ts
await computer.rpcCall('getBlockchainInfo', '')
```
||| Type
```ts
(method: string, params: string) => Promise<any>
```
|||

### getAddress

Returns a string encoding Bitcoin address.

||| Example
```ts
const address = computer.getAddress()
```
||| Type
```ts
() => string
```
|||

### getBalance

Returns the current balance in satoshi.

||| Example
```ts
const balance = await computer.getBalance()
```
||| Type
```ts
() => Promise<number>
```
|||

### getPublicKey

Returns a string encoding a public key.

||| Example
```ts
const publicKey = computer.getPublicKey()
```
||| Type
```ts
() => string
```
|||

### getChain

Returns the chain.

||| Example
```ts
const chain = computer.getChain()
```
||| Type
```ts
() => string
```
|||

### getNetwork

Returns the network.

||| Example
```ts
const network = computer.getNetwork()
```
||| Type
```ts
() => string
```
|||

### getMnemonic

Returns a string encoding a BIP39 mnemonic sentence.

||| Example
```ts
const mnemonic = computer.getMnemonic()
```
||| Type
```ts
() => string
```
|||

### getPassphrase

Returns the BIP39 passphrase.

||| Example
```ts
const passphrase = computer.getPassphrase()
```
||| Type
```ts
() => string
```
|||

### getPrivateKey

Returns a string encoded private key.

||| Example
```ts
const privateKey = computer.getPrivateKey()
```
||| Type
```ts
() => string
```
|||

### getPublicKey

Returns a string encoded public key.

||| Example
```ts
const publicKey = computer.getPublicKey()
```
||| Type
```ts
() => string
```
|||

### getUtxos

Returns an array of unspent transaction outputs (UTXOs).

||| Example
```ts
const utxos = await computer.getUtxos()
```
||| Type
```ts
() => Promise<BitcoinLib.Transaction.UnspentOutput[]>
```
|||
