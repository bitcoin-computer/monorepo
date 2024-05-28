---
order: -30
icon: light-bulb
---

# How it Works

## Intuition

A Bitcoin Computer transaction is a Bitcoin transaction with a Javascript expression inscribed. The value of the expression is associated with the first output of the transaction. If the value is an object or array that has sub-objects, then each sub-object is associated with a distinct output of the transaction.

If the expression contains a free variable (for example the variable `x` is free in the expression `x + 1`), then that free variable has to be associated with an input of the transaction. To determine the values of the outputs, the Bitcoin Computer  recursively determines the values of each output spent. The free variable is then substituted with the value before the expression is evaluated.

### Basic Example

![](/static/legend@1x.png)-
In the examples below, white boxes represent transactions and grey boxes represent expressions inscribed. Inputs and outputs are displayed as circles and spending relations are shown as arrows. 
<div style="clear: right;"></div>

-![](/static/int-example@1x.png)
Consider a transaction with the expression `1+2` inscribed. As this expression evaluates to `3`, the Bitcoin Computer will associate the first output with the value `3`.

If this output is spent by a transaction with an inscription `x+4` and the first input is associated with `x`, the Bitcoin Computer determines the value of the output spent by that input. In the example that output has the value `3`. Hence, the output of the second transaction has the value `7`.
<div style="clear: left;"></div>

## Detailed Description

### Smart Contracts and Objects

We will refer to a Javascript expression that is inscribed in a transaction as a *smart contract*. The value that such an expression evaluates to is called a *smart value*. If a smart value is of object type we refer to it as a *smart object*.

### Data Ownership

The method of associating data values to outputs described above gives rise to a natural notion of data ownership: A smart value that s *owned* by the users that can spend that output. This is analogous to how satoshis are owned by the users that can spend the output that store the satoshis.

The Bitcoin Computer adds a property `_owners` to every smart object. It is set to the array of the public keys of the owners. Conversely, if an object is created with a property `_owners` that is set to an array of *n* string encoded public keys, then the output that represents the object has a *1*-of-*n* multisig script with these public keys.

### Creating Objects and Object Identity

One advantage of associating values with transaction outputs is that the transaction id and output number can be used as an *identity* for the object. Whenever a smart object is created the Bitcoin Computer assigns the identity to a property `_id` of the object. The object identity cannot be reassigned and remains fixed throughout the lifetime of the object.

### Updating Objects and Object Revisions

Whenever a smart object is updated a transaction is broadcast that spends the outputs representing the object's old state. The outputs of the transaction as associated with the new state of the object. The transaction id and output number that is associated with the new state of an object is referred to as it's *revision*. The revision is assigned to a property `_rev` of the object.

### Ancestors and Roots of Objects

If an object is created in a function call of the form `x.f(...)` we say that `x` is its parent. We say that an object `x1` is the ancestor of an object `xn` if there is a sequence of objects `z2 ... zn-1` such that `xi` is the parent of `xi_1` for all `i`. The *root* of an object is its (unique) ancestor that does not have a parent. The Bitcoin Computer assigns the root of an smart object to the property `_root`. The root can be used to create fungible tokens with the Bitcoin Computer.

## Examples

### Non Fungible Tokens

The code on the left side of the picture below defines a class `NFT` with two properties `_owners` and `url` and a method `send` to update the `_owners`. The `_owners` property of a smart contract can be set to an array of string encoded public keys.

![](/static/nft-create@1x.png)

The right side of the picture shows a transaction in which both the class and a constructor call is inscribed. This expression evaluates to a new object of class `NFT`. It also shows that all three special properties `_id`, `_rev`, `_root_` are assigned the same value: the transaction id of the transaction shown and output number 1 (we represent this string as a blue circle in the picture).

The picture below shows the same object after two updates. First, the expression `nft.send('038e2...')` is evaluated where `nft` refers to the object immediately after the constructor call. The second update is due to the evaluation of the expression `nft.send('03f0b...')` where this time `nft` refers to the object after the first update. We can see that the revision is changed after every update but the identity and the root stays the same.

![](/static/nft-update@1x.png)

The `computer.sync` function can be called with each revision of a smart object. This provides access to all historical states of a smart object.

### Fungible Tokens

The figure below illustrates the minting and sending of 100 fungible tokens. The blue user, with public key 03a1d..., mints the tokens in the first transaction, producing one output that represents the 100 newly minted tokens. The second transaction represents the distribution of tokens after the blue user sends 3 tokens to the green user, with public key 03f0b....

![](/static/ft-create@1x.png)

The blue output of the second transaction represents the 97 tokens that the blue user still holds, while the green output represents the three tokens now owned by the green user. The _root property of both outputs in the second transaction is linked to the output of the first transaction, as the memory cell for the three tokens was allocated within a function call.

This setup prevents forgery, as any two tokens with the same root can be traced back to the same mint. To mint a second token with the same root, one would have to broadcast a transaction with the transaction id of the first transaction, which is impossible.

<!-- ## Passing Objects as Arguments

Swap

## Creating Sub Objects

Game -->
