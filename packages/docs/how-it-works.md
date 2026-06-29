---
order: -30
icon: light-bulb
---

# How it Works

The Bitcoin Computer protocol associates JavaScript values with the outputs of Bitcoin transactions that contain JavaScript expressions.

## Storing Values

To compute the value associated with an output, the expression is first evaluated. If the expression evaluates to a basic type, this value is associated with the first output. If the value is nested and contains multiple sub-objects, each sub-object is associated with a separate output.

This simple mechanism makes it possible to store arbitrarily complex JavaScript values in the outputs of a transaction using a highly efficient encoding: Instead of storing a value, an expression is stored that computes the value. This is much more efficient. In fact, it makes it possible to store a value at its optimal compression (see the [Kolmogorov Complexity](https://en.wikipedia.org/wiki/Kolmogorov_complexity)).

### Example

Consider a transaction that contains the JavaScript expression `'0'.repeat(100000)`. In this case the first output of the transaction is associated with a string of 100,000 zeroes.

Note that this encodes a 100,000 character string in just 18 characters.

## Updating Values

Expressions can contain undefined variables. For example, the variable `x` is undefined in the expression `x+4`. It is not possible to evaluate an expression with an undefined variable. For example, a JavaScript interpreter will throw a `ReferenceError` when trying to evaluate `x+4`.

In the Bitcoin Computer protocol, expressions with undefined variables are used to encode data updates. To determine a value for the undefined variables, the undefined variables in an expression must be associated with inputs of the transaction. The protocol will then compute the values associated with the outputs spent. These values are the substituted (aka plugged into) the respective undefined variables. This yields an expression where all variables are defined that can be evaluated. The value returned from this evaluation is associated with the outputs as explained in the previous section.

### Example

![](/static/legend@1x.png)

![](/static/int-example@1x.png)

Consider the transactions on the left. The first is labelled with `1+2`. This expression contains no undefined variables and evaluates to `3`, therefore the output of the first transaction is associated with the value `3`.

The expression `x+4` on the second transaction contains the undefined variable `x`. The input of this transaction is associated with this undefined variable. To compute the value associated with the output of the second transaction, the Bitcoin Computer protocol first computed the value of the output spent, which is `3`. This value is then substituted for `x` in the expression `x+4`. This yields the expression `3+4` which evaluates to `7`. This is the value associated with the output of the second transaction.

<div style="clear: left;"></div>

## The Interface

We call a string of the form `id:num` where `id` is a transaction id and `num` is an output number a revision. The following two functions provide access to the protocol through two main functions:

- `sync` maps a revision to a value.
- `encode` maps an expression and a blockchain environment to a transaction.

## Provenance

If the value returned from _sync_ contains an object, it has extra properties _\_id_, _\_rev_, _\_root_ that specify its location on the blockchain and its provenance.

- The _identity_ of an object, denoted `obj._id`, is a unique identifier that remains unchanged throughout the object's lifecycle. It is set to the transaction and output that the object was associated to when it was first created.
- The _revision_ of an object, denoted `obj._rev`, encodes an object's current location on the blockchain.
- The _root_ of an object, denoted `obj._root`, records whether _obj_ was created in a function call of another object, and if so which object that was.

## Keyword Properties

Smart contracts can contain the keyword properties `_owners`, `_satoshis`, `_url` and `_readers` that determine how the transaction is built. Specifically:

- The `_owners` property of a smart object determines the output script of the output that is associated with it. If it is set to an array of strings that encode public keys, then the output script will be a 1-of-n multisig script with these public keys. If it is set to a string that encodes a Bitcoin Script ASM, then that will be the script of the output.
- The `_satoshis` property can be set to a number (bigint) and determines the number of satoshis of the output associated with a smart object. If this property is undefined the output will contain a minimal, non-dust amount of satoshis.
- The `_url` and `_readers` properties together control where the metadata (including the JavaScript expression) is stored and whether it is encrypted. There are four combinations:

  - **Neither `_url` nor `_readers`**: The expression and full metadata are stored unencrypted directly in the transaction’s metadata outputs.
  - **Only `_readers`**: The expression and metadata are stored encrypted directly in the transaction’s metadata outputs (only the specified readers can decrypt them).
  - **Only `_url`**: Only a small pointer/hash is stored on-chain in the (still-present) dust metadata output(s). The full (unencrypted) metadata is stored on the server at the provided URL. This changes the on-chain dust cost from proportional to the size of the expression to a small constant, independent of expression size.
  - **Both `_url` and `_readers`**: The metadata is stored encrypted on the server at the provided URL; only a pointer goes on-chain.

  The `_url` value must be a Bitcoin Computer node (or a compatible server implementing the required secret storage endpoint). These choices (plus use of the module system and `moduleStorageType`) affect how much data is written to the blockchain and therefore the on-chain technical dust / hygiene dust costs. See the [Fees](./fees.md) page — especially the "User Choices to Control On-Chain Data and Hygiene Dust Costs" section — for details on minimization best practices, the precise scope of hygiene dust outputs, bare-multisig UX rationale, absolute minimum dust, and verification.
