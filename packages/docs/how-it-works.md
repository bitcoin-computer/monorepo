---
order: -30
icon: light-bulb
---

# How it Works

## Intuition

A Bitcoin Computer transaction is a Bitcoin transaction with a Javascript expression inscribed. The value of the expression is associated with the first output of the transaction. If the value is an object or array that has sub-objects, then each sub-object is associated with a distinct output of the transaction.

If the expression contains a free variable (for example the variable `x` is free in the expression `x + 1`), then that free variable has to be associated with an input of the transaction. To determine the values of the outputs, the Bitcoin Computer will recursively determine the values of each output spent. The free variable is then substituted with the value before the expression is evaluated.

### Notation

![](/static/legend@1x.png)-
We will use some visual notion in the example that we describe first. White boxes represent transactions and grey boxes represent expressions that are inscribed into the transactions. Inputs and outputs are displayed as circles and spending relations are shown as arrows. 

To keep the explanation simple, we will pretend that any user (not just miners) can create transactions without inputs.
<div style="clear: right;"></div>

### Example

-![](/static/int-example@1x.png)
Now consider a transaction with one output and the expression `1+2` inscribed. As this expression evaluates to `3`, the Bitcoin Computer will associate the first output with the value `3`.

If this output is then spent by a transaction with an inscription `x+4` and the first input is labelled by `x`, the Bitcoin Computer will first determine the value of the output spent by that input. As described above that output is has the value `3`. Hence, the output of the second transaction has the value `7`.
<div style="clear: left;"></div>

## Data Ownership

The method of associating data values to outputs described above gives rise to a natural notion of data ownership: A piece of data that is stored in an output is owned by all users that can spend that output. This is analogous to how satoshis are owned by the users that can spend the output that store the satoshis.

In the case that a value is an object (as opposed to an array or a basic type), the Bitcoin Computer will add an extra property `_owners` to the object that contains the list of public keys that are owners. Conversely, if an object is created with a property `_owners` that is set to an array of string encoded public keys, the Bitcoin Computer will arrange the transaction so that the Bitcoin script of the output that represents that object can only be spent by the users that control the public keys in the array.

## Creating Objects and Object Identity

One advantage of associating values with transaction outputs is that the transaction id and output number can be used as an identity for the object. Specifically, whenever an object is created (as in a new memory is allocated) we assign the transaction id and output number to a property called `_id`. The id cannot be reassigned and remains immutable throughout the lifetime of the object.

## Updating Objects and Object Revisions

Whenever a smart object is updated, it's new state is stored in a new output. The transaction id and output number is assigned to a property `_rev` of the object. As any two Bitcoin transactions have distinct ids, each new version of a smart object has a fresh revision.

## Roots and Families of Objects

When a new object is created in an expression that is either a constructor call (that is of the form `new C(...)`) or a function call (that is of the form `x.f(...)`) we can keep track of this occurrence. Specifically, the root of an object is it's id if it is not created within a constructor or function call. If it is created in a constructor call it's root is the id of the newly created object. If an object `y` is created within a function call `x.f(...)` the the root of `y` is the root of `x`.

<!-- 
## Example

Consider a transaction that has the expression `1+2` inscribed. The Bitcoin Computer will associate the value `3` to it's first output. If we spend this transaction with a transaction that is inscribed with the expression `x+4`.


## Storing Values

When an expression is evaluated with the Bitcoin Computer, the expression is inscribed into a Bitcoin transaction. If the value of the expression has object type, this object is considered a "smart object" and an output of the transaction is considered the object's *id*. If the value has multiple sub-objects, each sub-object is assigned a separate output as its id.

## Reading Values

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
 -->




<!-- ### Storing Values

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
