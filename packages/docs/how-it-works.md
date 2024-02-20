---
order: -40
icon: light-bulb
---

# How it Works

!!!info
We recommend to read the [tutorial](/tutorial.md) first.
!!!

The Bitcoin Computer is a Javascript <a href="https://en.wikipedia.org/wiki/Runtime_system" target="_blank">runtime environment</a> that uses Bitcoin as a <a href="https://en.wikipedia.org/wiki/Persistence_(computer_science)" target="_blank">persistence</a> layer.

## Storing Values

When an expression is evaluated with the Bitcoin Computer, the expression is inscribed into a Bitcoin transaction. If the value of the expression has object type, this object is considered a "smart object" and an output of the transaction is considered the object's *id*. If the value has multiple sub-objects, each sub-object is assigned a separate output as its id.

To determine the value of a given smart object id, the Bitcoin Computer library will download the corresponding transaction and compute the value of the expression. As the mapping from sub-objects to outputs is deterministic and one-to-one, the software can determine which sub-object of the value is the smart object for the given id.

## Updating Values

In order to explain how updating values works we need the notions of "free variable", "environment", and "closure". Consider the Javascript expression:

```js
const x = 1;
counter.add(x);
```

It contains two variables, `x` and `counter`. The variable `x` is defined in the expression and one can determine that the value of `x` is `1`. The variable `counter` is not defined so it is impossible to tell what the value of `counter` is. Such variables are called *free variables*. In order to evaluate an expression with free variables, a definition of the values of the free variables is required. This is what an *environment* does: it maps free variables to values. A *<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures" target="_blank">closure</a>* is a pair consisting of an expression and an environment.

To evaluate an expression $e$ containing free variables $x_1\ ...\ x_n$ with the Bitcoin Computer, the user needs to provide a *Bitcoin environment* $\{ x_1: o_1\ ...\ x_n: o_n \}$ that maps the free variables of $e$ to outputs $o_1\ ...\ o_n$. The Bitcoin Computer will recursively determine the values $v_1\ ...\ v_n$ of the outputs $o_1\ ...\ o_n$ respectively. It then creates a closure consisting of the expression $e$ and the environment $\{ x_1: v_1\ ...\ x_n: v_n \}$ and evaluates this closure with a standard Javascript runtime.

All sub-objects of the value returned are designated one output of the transaction. We refer to both the outputs as well as the values they represent as *revisions*. Note that when a closure is evaluated, the values $v_1\ ...\ v_n$ can change (for example if $e$ is a function call $f(x_1\ ...\ x_n)$ with side effects). Therefore a these transactions must have outputs that represent the new revisions for these values as well.

The Bitcoin Computer protocol requires that a transaction spends all outputs in the environment. A practical advantage is that this provides a space efficient way to store the environment: Only a list of variable names needs to be stored as meta data and the full environment can be reconstructed from the inputs. It also has two important consequences: It provides a notion of data ownership as it is necessary to be able to spend an output in order to update it's value. And it makes it possible to run the Bitcoin Computer as a light client as the inputs of a transaction contain pointers to the transactions that contain the expressions that need to be evaluated first.

## Smart Contract Language

The programming language used for the Bitcoin Computer has the exact same syntax as Javascript. However there is one important semantic difference: 

!!!
All values returned from evaluating an expression that have object type must inherit from `Contract`.
!!!

The class `Contract` is exported from the library. It enforces the following properties, which we think turn Javascript into a viable smart contract language.

### Assigning Properties Outside of Function Calls is Prohibited

Assigning to a property outside of a function call throws an error.

This makes it possible to write classes that impose constraints on all future values of an object. Consider for example the class `Even` below. The condition guarantees that all instances of the class will always have an even value.

```js
class Even extends Contract {
  inc() {
    if (typeof this.n === 'undefined') this.n = 0
    else this.n = this.n + 2
  }
}
```

While this is not a very useful example for a constraint, all smart contracts are based on constraints to future values in a similar way. 

### Keyword Properties Control the Transaction Being Built

The `Contract` class enforces certain types for the properties `_id`, `_rev`, `_root`, `_amount`, `_owners`, `_readers`, and `_url`:

```ts
type SmartObject = {
  readonly _id: string // output where object was created
  readonly _rev: string // output where object is currently stored
  readonly _root: string // useful for building fungible tokens
  _owners?: string[] // determines data ownership
  _amount?: number // determines number of Satoshis stored in the current output
  _readers?: string[] // determines whether object is encrypted and who can decrypt is so
  _url?: string // determines if data is stores off-chain
}
```

The properties `_id`, `_rev`, and `_root` are read only and set by the runtime to relay information about which transaction created the object and where it is currently stored.

* The value of the `_id` property is the output (encoded as \<transaction id\>:\<output index\>) that represented the object immediately after it was created.
* The value of the `_rev` property is the output of the currently representing the object (that is, the object's revision).
* The value of the `_root` property is assigned once when the object is created and is never modified subsequently. If the expression that creates the object is of the form `new C(...)` then its root is equal to its id. If the expression is of the form `x.f(...)` then the root of the new object is equal to the id of `x`. Otherwise the root is set to `n/a`. The root property is useful for building fungible tokens.

The properties `_amount`, `_owners`, `_readers`, and `_url` can be set by the smart contract developer to influence how the transaction is built.

* If a property `_amount` is set it needs to be set to a number. It determines the amount of Satoshi stored in the output representing the current revision. If it is not set the revision will have a minimal (non-dust) amount of Satoshi.
* If a property `_owners` is set it needs to be set to an array of strings $[p_1\ ...\ p_n]$. These determine the output script of the current revision. Specifically, the script for the current revision is a 1-of-n multisig script with the public keys $p_1\ ...\ p_n$. This guarantees that only a user that has a private key corresponding to one of the public keys can update the object. If the property is not set it defaults to the public key of the computer that created the object.
* If a property `_readers` is set it needs to be set to an array of strings $[p_1\ ...\ p_n]$. If this property is set the meta data in the corresponding transaction is encrypted such that only users with corresponding private keys can decrypt the expression and compute the value of the smart object. If the `_readers` property is not set the meta data is not encrypted and any user can compute the value of the smart object.
* If a property `_url` is set it needs to be set to the url of a Bitcoin Computer node. If it is set the expression is not stored in the transaction but on the node instead. The transaction only contains a hash of the expression and the location where the expression can be obtained from the node. This is convenient if the expression is large, for example because it contains a lot of data.

### Assigning to `this` in Constructors is Prohibited

This is not a property that we think this will make Javascript a better smart contract language, it is just a consequence how we enforce the properties above. In order to have useful constructors it is possible to pass an initialization object into the constructor:

```js
class A extends Contract {
  constructor() {
    super({ k1: v1, ... kn: vn })
  }
}
```

This has the same effect as setting assigning to `this` in a normal Javascript program

```js
// not a smart contract, for illustration purposes only
class A {
  constructor() {
    this.k1 = v1
    ...
    this.kn = vn
  }
}
```
<!-- 
## An Example

We will use some visual notion in the example that we describe first.

### Notation

![](/static/legend@1x.png)-
White boxes represent transactions and grey boxes represent expressions that are inscribed into the transactions. Inputs and outputs are displayed as circles and spending relations are shown as arrows. A blockchain environment that maps a free variable $x$ to an output $o$ is shown as a label $x$ in the arrow indicating the spending of $o$.
<div style="clear: right;"></div>

### Storing Values

Consider the code in the picture below. It defines a class `NFT` with two properties `_owners` and `url` and a method to update the `_owners`. The `_owners` property of a smart contract can be set to an array of string encoded public keys. The output that will store that 



To allocate a memory cell and to store a new smart object in it, a transaction that contains a Javascript expression <code>e<sub>1</sub>; e<sub>2</sub> ... e<sub>n</sub></code> where <code>e<sub>n</sub></code> is of the form `new C(...)` must be broadcast. The class `C` can be defined in the expression or it can be passed in from a module.

![](/static/nft-create@1x.png)

The function `computer.sync` computes Javascript objects from outputs as shown in the figure. Note that `_id`, `_rev`, and `_root` are all set to the same output.

### Updating Values

To update a smart object stored in the shared global memory, a Bitcoin transaction must be broadcast that includes a Javascript expression of the form of `x.f(...)`. To determine which memory cell the free variable `x` is stored in, the blockchain environment must associate `x` with an input. In the example this input is shown as `nft`.

![](/static/nft-update@1x.png)

The transaction will create corresponding outputs to these inputs, which represent the updated state of the memory cells. These outputs are called the *revisions* of a smart object, and the most recent revision is stored in the `_rev` property of the smart object.

The `computer.sync` function can be called with each revision of a smart object. This provides access to all historical states of a smart object.

### Sub-Objects

When a function call on a smart object returns a value of type object, a new memory cell is allocated to store the returned value.

The figure below illustrates the minting and sending of 100 fungible tokens. The blue user, with public key 03a1d..., mints the tokens in the first transaction, producing one output that represents the 100 newly minted tokens. The second transaction represents the distribution of tokens after the blue user sends 3 tokens to the green user, with public key 03f0b....

![](/static/ft-create@1x.png)

The blue output of the second transaction represents the 97 tokens that the blue user still holds, while the green output represents the three tokens now owned by the green user. The _root property of both outputs in the second transaction is linked to the output of the first transaction, as the memory cell for the three tokens was allocated within a function call.

This setup prevents forgery, as any two tokens with the same root can be traced back to the same mint. To mint a second token with the same root, one would have to broadcast a transaction with the transaction id of the first transaction, which is impossible. -->

<!-- ## Passing Objects as Arguments

Swap

## Creating Sub Objects

Game -->
