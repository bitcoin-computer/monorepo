---
icon: log
---

# Contract

The `Contract` class allows you to create objects whose properties can only be updated through its methods. This enables the development of smart contracts in JavaScript. For details, please see [here](../../language.md).

If a class `C` extends from `Contract` and if `c` is an instance of `C` then an error is thrown if

- a property of `c` is created, updated or deleted outside of a method of `c`
- a property `_id`, `_rev` or `_root` of `c` is created, updated, or deleted.

In order to provide the two guarantees above we also need to forbid assigning to `this` inside of constructors. Instead, an object can be passed into `super` to initialize an object.

## Examples

### Updating Properties Outside of Methods

```js
class C extends Contract {
  constructor() {
    super({ n: 0 })
  }

  set(n: number) {
    this.n = n
  }
}

const c = new C()

// Assigning n through a method works
c.set(1)

expect(() => {
  // Assigning to property outside of a method throws an error
  c.n = 2
}).to.throw("Cannot set property 'n' directly")
```

### Updating `_id`, `_rev` or `_root`

```js
class C extends Contract {
  set(rev) {
    this._rev = rev
  }
}

const c = new C()

expect(() => {
  // Assigning a provenance property throws an error, even inside a method
  c.set('rev')
}).to.throw('Cannot set _rev')
```

### Using the Initialization Object

```js
class C extends Contract {
  n: number

  constructor() {
    // Use the initialization object
    super({ n: 0 })
  }
}

const c = new C()
expect(c.n).eq(0)
```
