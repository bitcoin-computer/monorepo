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

The example below shows how a mocked object can be used. Note that the object `a` is created after the transaction that spends it. Thus the revision of `a` is not known when `tx` is built. Once `a` is created on-chain and its revision becomes known, the code below updated the input of `tx` to spend the revision of `a`.

:::code source="../../../lib/test/lib/mock/index.test.ts" :::
