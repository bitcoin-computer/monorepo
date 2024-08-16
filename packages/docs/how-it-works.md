---
order: -30
icon: light-bulb
---

# How it Works

## Intuition

In a Bitcoin Computer transaction, a JavaScript expression is embedded within a standard Bitcoin transaction. The result of evaluating this expression is linked to an output. If the result contains objects, each of these objects is assigned to a separate output.

For expressions with an undefined variable (for example, the variable `x` is undefined in the expression `x + 1`), the smart contract developer can associate that variables with an input of the transaction. The Bitcoin Computer then recursively calculates the values of these outputs, and replaces the undefined variables with their computed values from previous transactions to evaluate the expression.

### Basic Example

![](/static/legend@1x.png)-
 

-![](/static/int-example@1x.png)

In this example, the transaction is inscribed with the arithmetic expression `1+2`, which evaluates to `3`. This value is then associated with the transaction’s first output. In a subsequent transaction, an expression `x+4` uses this output's value as its variable `x`. Given that the output from the first transaction was `3`, the expression in the second transaction evaluates to `7`, and this new value is assigned to its output. This demonstrates how values can be propagated and transformed across transactions in the Bitcoin Computer system.

<div style="clear: left;"></div>

## Detailed Description

### Smart Contracts and Objects

We will refer to a Javascript expression that is inscribed in a transaction as a *smart contract*. The value that such an expression evaluates to is called a *smart value*. If a smart value is of object type we refer to it as a *smart object*.

In the Bitcoin Computer system, JavaScript expressions embedded within transactions are called smart contracts. The values of these expressions is known as a smart values. When a smart value is of an object type, it is referred to as a smart object. This terminology is borrowed from object oriented programming and helps distinguish between a class and the objects created from such a class.

### Data Ownership

In the TBC system, data ownership is linked to the ability to spend an output, similar to the ownership of Bitcoin. A “smart object embedded in a transaction is the property of the user(s) who can spend that output. For enhanced security and ownership clarity, every “smart object” includes an `_owners` property, listing the public keys of its owners. Conversely, if an object is created with a property `_owners` that is set to an array of $n$ string encoded public keys, then the output that represents the object has a $1$-of-$n$ multisig script with these public keys.

### Creating Objects and Object Identity

Associating values with transaction outputs facilitates the use of the transaction ID and output number as a unique identifier for each smart object. This identifier is assigned to the _id property of the smart object upon its creation and remains unchanged for the object’s entire lifespan.

### Updating Objects and Object Revisions

When a smart object is updated, a transaction is broadcast that spends the old state’s utxo with new one, reflecting the object’s updated state. This transaction ID and output number are designated as the object’s revision and stored in the `_rev` property of the object. This mechanism ensures that each update is traceable and securely linked to the specific transaction.

### Ancestors and Roots of Objects

If an object is created in a function call of the form $x.f(\ldots)$ we say that $x$ is its parent. We say that an object $x_1$ is the ancestor of an object $x_n$ if there is a sequence of objects $x_2 \ldots x_{n-1}$ such that $x_i$ is the parent of $x_{i+1}$ for all $i$. The root of an object is its (unique) ancestor that does not have a parent. The Bitcoin Computer assigns the root of a smart object to the property `_root`. The root can be used to create fungible tokens with the Bitcoin Computer.

In other words, an object’s lineage is defined by its function calls. If an object is created within a function, the object calling the function is deemed the parent. An ancestor of an object is defined by a lineage of parent-child relationships leading back to a unique ancestor with no parent, which is called the root. The root identity is critical for creating fungible tokens, as it provides a stable reference point for all transactions and interactions related to that object.

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
