---
order: -35
icon: log
---

# Smart Contract Language

The Bitcoin Computer uses Javascript with slight modifications. Specifically:
* *Property assignments are not permitted outside function calls.* This makes it possible to impose constraints on all future values of an object, thereby making Javascript a viable smart contract language
* *Certain keyword properties have a special semantics.* This gives the smart contract programmer fine grained control over the transaction being built.
* *Assignments to `this` is not permitted in constructor calls.* This is necessary for internal reasons to ensure the first two properties. 

These properties are technically enforced by the requirement that all objects returned from a smart contract inherit from a class `Contract` that is exported from the Bitcoin Computer Library.

In the following we explain the three properties in detail.

### Assigning Properties Outside of Function Calls is Prohibited

Assigning to a property outside of a function call throws an error.

This makes it possible to write classes that impose constraints on all future values of an object. Consider for example the class `Even` below. The condition guarantees that all instances of the class will always have an even value.

```js
class Even extends Contract {
  inc2() {
    this.n = (this.n || 0) + 2
  }
}
const even = new Even()
```

Calling `even.inc2()` works as expected.
```js
even.inc2()
expect(even.n).eq(2)
```

However, assigning to `even.n` outside of a function call throws an error.
``` js
try {
  even.n = 3
  expect(true).eq(false)
} catch(err) {
  expect(err.message).eq("Cannot set property 'n' directly")
}
```



While this is not a very useful example for a constraint, all smart contracts are based on constraints to future values in a similar way. 

### Special Semantics of Keyword Properties

The Bitcoin Computer uses special properties (called keyword properties) that
* control details of the transaction being build, and
* give the user information as to where on the blockchain a smart object was created and where it is currently stored.

```ts


type SmartObject = OutputDetails & Location
```

In the following we describe these properties in details

#### Control Keyword Properties

Properties named `_amount`, `_owners`, `_readers`, and `_url` provide control over the transaction being built. These properties can optionally be set in the smart contract.

```ts
type OutputDetails = {
    // determines which users can update the object
  _owners?: string[]

  // determines number of Satoshis stored in the output associated with the object
  _amount?: number

  // determines whether object is encrypted and who can decrypt it
  _readers?: string[]
  
  // determines if data is stored off-chain
  _url?: string
}
```

The effect that these properties have on the transaction being built is described below:
* If a property `_amount` is set it needs to be set to a number. It determines the amount of Satoshi stored in the output representing the current revision. If it is not set the revision will have a minimal (non-dust) amount of Satoshi.
* If a property `_owners` is set it needs to be set to an array of strings $[p_1\ ...\ p_n]$. These determine the output script of the current revision. Specifically, the script for the current revision is a 1-of-n multisig script with the public keys $p_1\ ...\ p_n$. This guarantees that only a user that has a private key corresponding to one of the public keys can update the object. If the property is not set it defaults to the public key of the computer that created the object.
* If a property `_readers` is set it needs to be set to an array of strings $[p_1\ ...\ p_n]$. If this property is set the meta data in the corresponding transaction is encrypted such that only users with corresponding private keys can decrypt the expression and compute the value of the smart object. If the `_readers` property is not set the meta data is not encrypted and any user can compute the value of the smart object.
* If a property `_url` is set it needs to be set to the url of a Bitcoin Computer node. If it is set the expression is not stored in the transaction but on the node instead. The transaction only contains a hash of the expression and the location where the expression can be obtained from the node. This is convenient if the expression is large, for example because it contains a lot of data.

#### Location Keyword Properties

The properties `_id`, `_rev`, `_root` contain information about where a smart object was created and where it is currently stored. These properties are set by the runtime. While they can be read, attempts to overwrite their state will lead to an error.

```ts
type Location = {
  // output where object was created
  readonly _id: string

  // output where object is currently stored
  readonly _rev: string

  // useful for building fungible tokens
  readonly _root: string
}
```
* The value of the `_id` property is the output (encoded as \<transaction id\>:\<output index\>) that represented the object immediately after it was created.
* The value of the `_rev` property is the output of the currently representing the object (that is, the object's revision).
* The value of the `_root` property is assigned once when the object is created and is never modified subsequently. If the expression that creates the object is of the form `new C(...)` then its root is equal to its id. If the expression is of the form `x.f(...)` then the root of the new object is equal to the id of `x`. Otherwise the root is set to `n/a`. The root property is useful for building fungible tokens.

### Assigning to `this` in Constructors is Prohibited

In order to enforce the properties above, it is currently not permitted to assign to `this` in constructor calls. Instead, an initialization object can be passed into the constructor:

```js
class A extends Contract {
  constructor() {
    super({ k1: v1, ... kn: vn })
  }
}
```

This has the same effect as setting assigning to `this` in a normal Javascript program

```js
// Not a smart contract, for illustration purposes only
class A {
  constructor() {
    this.k1 = v1
    ...
    this.kn = vn
  }
}
```