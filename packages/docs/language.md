---
order: -35
icon: log
---

# Smart Contract Language

Writing smart contracts is all about imposing constraints of future values. These constraints can be local or global. An example of a local constraint is a non-fungible token: These are objects that can change their owners but the data itself typically cannot be changed. A non-fungible token is an example of a class with a non-local constraint: the number of tokens must remain constant across all objects emerging from the same mint.

In order to make it possible to write smart contracts in Javascript, the Bitcoin Computer library exports a class `Contract` that enforces that whenever a class extends from it, its properties can only be assigned through function calls. This is reminiscent to the behavior of Solidity and makes it possible to write smart contracts in Javascript.

We call an expression a _smart contract_ if it returns a value that contains only sub-objects whose classes that extend from `Contract`. The function `encode` throws an error if it called with an expression that is not a smart contract. Likewise, the function `sync` throws an error if it is called with a transaction whose expression is not a smart contract.

To describe the behavior of `Contract` more precisely, let `obj` be an object of a class that extends from `Contract`. Then an error is thrown if either

1. a property of `obj` is assigned outside of a method of `obj`,
2. a property `_id`, `_rev`, and `_root` is assigned, or
3. `this` is assigned to in the constructor of `C`.

To initialize objects without violating rule 3. an initialization object can be passed into `super` in a constructor:

```js
class A extends Contract {
  constructor(v1 ... vn) {
    super({
      k1: v1,
      ...
      kn: vn
    })
  }
}
```

This has the same effect as assigning to `this` in a normal Javascript program

```js
class A {
  constructor(v1 ... vn) {
    this.k1 = v1
    ...
    this.kn = vn
  }
}
```
