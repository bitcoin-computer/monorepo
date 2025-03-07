---
icon: smiley
---

# Mock

Mocking is a technique for spending objects that are associated with Bitcoin Computer transactions that have not been broadcast yet. This is required for advanced applications like swaps and for using smart contracts over payment channels (see [here](../../tutorial.md#mocking) for more information).

A _mocked object_ is an object that has `_id`, `_rev` and `_root` set to strings of the form `mock-${hex}:${num}` where `hex` is a string of 64 hexadecimal characters and `num` is a number. The Bitcoin Computer library exports a class `Mock` to make it easy to create a mock.

```js
const makeRev = () => `mock-${'0'.repeat(64)}:${Math.floor(Math.random() * 1000000)}`

export class Mock {
  _id: string
  _rev: string
  _root: string
  _amount: number
  _owners: string | string[]

  constructor(opts = { _id: rev(), _rev: rev(), _root: rev() }) {
    Object.entries(opts).forEach(([key, value]) => {
      this[key] = value
    })
  }
}
```

## Example

The example below shows how a mocked object can be used. Note that in the example, the object `a` is created after the transaction that spends it. Thus the revision of `a` is not known when `tx` is built. Once `a` is created on-chain and its revision becomes known, the code below updated the input of `tx` to spend the revision of `a`.

```js
import { Mock, Contract } from '@bitcoin-computer/lib'

class M extends Mock {
  constructor() {
    super({ n: 1 })
  }

  inc() {
    this.n += 1
  }
}

class A extends Contract {
  constructor() {
    super({ n: 1 })
  }

  inc() {
    this.n += 1
  }
}

// Create Mock
const m = new M()

// Create transaction that updates an object a that does not exist yet
const { tx } = await computer.encode({
  // The update expression
  exp: `a.inc()`,

  // Map variable name a to mock m
  mocks: { a: m },

  // Specify that the input that spends a points to m._rev
  env: { a: m._rev },

  // The transaction can only be funded and signed once it is finalized
  fund: false,
  sign: false,
})

// Create on-chain object
const a = await computer.new(A)

// Update outpoint of tx to spend a's revision
const [txId, num] = a._rev.split(':')
const index = parseInt(num, 10)
tx.updateInput(0, { txId, index })

// Fund, sign and broadcast transaction
await computer.fund(tx)
await computer.sign(tx)
await computer.broadcast(tx)
```
