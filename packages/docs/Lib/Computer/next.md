# next

_Returns the next revision of a given revision if it exists._

## Type

```ts
next(rev: string): Promise<string | undefined>
```

### Parameters

#### `rev`

A revision encoded as a string of the form `<transaction-id>:<output-number>`.

### Return value

The next revision or undefined.

## Description

Given the revision of an on-chain object, the function returns the next revision of the same on-chain object. If no such revision exists because the revision passed in is a latest revision, `undefined` is returned.

### Example

```ts
import { Computer, Contract } from '@bitcoin-computer/lib'

class Counter extends Contract {
  constructor() {
    super({ n: 0 })
  }
  inc() {
    this.n += 1
  }
}

const computer = new Computer()
const counter = await computer.new(Counter, [])
await counter.inc()
expect(await computer.next(counter._id)).eq(counter._rev)
```
