---
order: -30
icon: light-bulb
# visibility: hidden
---

# How it Works

The Bitcoin Computer protocol associates JavaScript values with the outputs of Bitcoin transactions that contain JavaScript expressions.

## Storing Values

To compute the value associated with an output, the expression is first evaluated. If the expression evaluates to a basic type, this value is associated with the first output. If the value is nested and contains multiple sub-objects, each sub-object is associated with a separate output.

This simple mechanism makes it possible to store arbitrarily complex Javascript values in the outputs of a transaction using an highly efficient encoding: Instead of storing a value, an expression is stored that computes the value. This is much more efficient. In fact, it makes it possible to store a value at its optimal compression (see the [Kologromov Complexity](https://en.wikipedia.org/wiki/Kolmogorov_complexity)).

### Example

Consider a transaction that contains the JavasScript expression `'0'.repeat(100000)`. In this case the first output of the transaction is associated with a string of 100,000 zeroes.

Note that this encodes a 100,000 character string in just 18 characters

## Updating Values

Expressions can contain undefined variables. For example, the variable `x` is undefined in the expression `x+4`. It is not possible to evaluate an expression with an undefined variable. For example, an Javascript interpreter will throw a `ReferenceError` when trying to evaluate `x+4`.

In the Bitcoin Computer protocol, expressions with undefined variables are used to encode data updates. To determine a value for the undefined variables, the undefined variables in an expression must be associated with inputs of the transaction. The protocol will then compute the values associated with the outputs spent. These values are the substituted (aka plugged into) the respective undefined variables. This yields an expression where all variables are defined that can be evaluated. The value returned from this evaluation is associated with the outputs as explained in the previous section.

### Example

![](/static/legend@1x.png)-

-![](/static/int-example@1x.png)

Consider the transactions on the left. The first is labelled with `1+2`. This expression contains no undefined variables and evaluates to `3`, therefore the output of the first transaction is associated with the value `3`.

The expression `x+4` on the second transaction contains the undefined variable `x`. The input of this transaction is associated with this undefined variable. To compute the value associated with the output of the second transaction, the Bitcoin Computer protocol first computed the value of the output spent, which is `3`. This value is then substituted for `x` in the expression `x+4`. This yields the expression `3+4` which evaluates to `7`. This is the value associated with the output of the second transaction.

<div style="clear: left;"></div>

## The Interface

We call a string of the form `id:num` where `id` is a transaction if and `num` is an output number a revision. The following two functions provide access to the protocol through two main functions:

- `sync` maps a revision to a value.
- `encode` maps an expression and a blockchain environment to a transaction.

## Provenance

If the value returned from _sync_ contains an object, it has extra properties _\_id_, _\_rev_, _\_root_ that specify its location on the blockchain and its provenance.

- The _identity_ of an object, denoted `obj._id`, is a unique identifier that remains unchanged throughout the object's lifecycle. It is set to the transaction and output that the object was associated to when it was first created.
- The _revision_ of an object, denoted `obj._rev`, encodes an object's current location on the blockchain.
- The _root_ of an object, denoted `obj._root`, records whether _obj_ was created in a function call of another object, and if so which object that was.

## Keyword Properties

Smart contracts can contain the keyword properties `_owners`, `_amount`, `_url` and `_readers` that determine how the transaction is built. Specifically

- The `_owners` property of a smart object determines the output script of the output that is associated with it. If it is set to an array of strings that encode public keys, then the output script will be a 1-of-n multisig script with these public keys. If it is set to a string that encodes a Bitcoin Script ASM, then that will be the script of the output.
- The `_amount` property can be set to a number and determined the amount of satoshi of the output associated with a smart object. If this property is undefined the output will contain a minimal, non-dust amount of satoshis.
- The `_url` property can be set to the url of a Bitcoin Computer node. If set the metadata that would otherwise be stored in the transaction is stored on that node. The metadata will consist only of a url where the data can be obtained.
- The `_readers` property can be set to encrypt the meta data. It can be set to an array of strings encoding public keys. In this case the metadata on the transaction will be encrypted such that only the specified users can decrypt the data and read the object.

<!--
## Detailed Description

### Smart Contracts and Objects

In the tutorial section, we introduced the concept of Smart Contract, typically referred as Javascript classes that extends from `Contract`. We also introduced the concept of Smart Object, which are instances of these classes. In this section, we will provide a more formal definition of these concepts.

In the Bitcoin Computer system, we refer to a _smart contract_ as any valid JavaScript expression that is inscribed in a transaction. The value that such an expression evaluates to is called a _smart value_. When a smart value is of an object type, it is referred to as a smart object. This terminology is borrowed from object oriented programming and helps distinguish between a class and instances of that class, i.e. the objects created from such a class.

### Data Ownership

In the Bitcoin Computer, data ownership is linked to the ability to spend an output, similar to the ownership of Bitcoin. For enhanced security and ownership clarity, every “smart object” includes an `_owners` property, listing the public keys of its owners. Conversely, if an object is created with a property `_owners` that is set to an array of $n$ string encoded public keys, then the output that represents the object has a $1$-of-$n$ multisig script with these public keys.

### Creating Objects and Object Identity

Associating values with transaction outputs facilitates the use of the transaction ID and output number as a unique identifier for each smart object. This identifier is assigned to the `_id` property of the smart object upon its creation and remains unchanged for the object’s entire lifespan.

### Updating Objects and Object Revisions

When a smart object is updated, a transaction is broadcast that spends the old state’s UTXO with new one, reflecting the object’s updated state. This transaction ID and output number are designated as the object’s revision and stored in the `_rev` property of the object. This mechanism ensures that each update is traceable and securely linked to the specific transaction.

### Ancestors and Roots of Objects

If an object is created in a function call of the form $x.f(\ldots)$ we say that $x$ is its parent. We say that an object $x_1$ is the ancestor of an object $x_n$ if there is a sequence of objects $x_2 \ldots x_{n-1}$ such that $x_i$ is the parent of $x_{i+1}$ for all $i$. The root of an object is its (unique) ancestor that does not have a parent. The Bitcoin Computer assigns the root of a smart object to the property `_root`. The root can be used to create fungible tokens with the Bitcoin Computer.

In other words, an object’s lineage is defined by its function calls. If an object is created within a function, the object calling the function is deemed the parent. An ancestor of an object is defined by a lineage of parent-child relationships leading back to a unique ancestor with no parent, which is called the root. The root identity is critical for creating fungible tokens, as it provides a stable reference point for all transactions and interactions related to that object.

## Examples

### Non Fungible Tokens

The code on the left side of the picture below defines a class `NFT` with two properties `_owners` and `url` and a method `send` to update the `_owners`. The `_owners` property of a smart contract can be set to an array of string encoded public keys.

![](/static/nft-create@1x.png)

The right side of the picture shows a transaction in which both the class and a constructor call is inscribed. This expression evaluates to a new object of class `NFT`. It also shows that all three special properties `_id`, `_rev`, `_root` are assigned the same value: the transaction id of the transaction shown and the first output (we represent this string as a blue circle in the picture).

The picture below shows the same object after two updates. First, the expression `nft.send('038e2...')` is evaluated where `nft` refers to the object immediately after the constructor call. The second update is due to the evaluation of the expression `nft.send('03f0b...')` where this time `nft` refers to the object after the first update. We can see that the revision is changed after every update but the identity and the root stays the same.

![](/static/nft-update@1x.png)

The `computer.sync` function can be called with each revision of a smart object. This provides access to all historical states of a smart object.

### Fungible Tokens

The figure below illustrates the minting and sending of 100 fungible tokens. The blue user, with public key 03a1d..., mints the tokens in the first transaction, producing one output that represents the 100 newly minted tokens. The second transaction represents the distribution of tokens after the blue user sends 3 tokens to the green user, with public key 03f0b....

![](/static/ft-create@1x.png)

The blue output of the second transaction represents the 97 tokens that the blue user still holds, while the green output represents the three tokens now owned by the green user. The `_root` property of both outputs in the second transaction is linked to the output of the first transaction, as the memory cell for the three tokens was allocated within a function call.

This setup prevents forgery, as any two tokens with the same root can be traced back to the same mint. To mint a second token with the same root, one would have to broadcast a transaction with the transaction id of the first transaction, which is impossible. -->

<!-- ## Passing Objects as Arguments

Swap

## Creating Sub Objects

Game -->
