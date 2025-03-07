# subscribe

_Calls a callback when an on-chain object is updated._

## Type

```ts
subscribe(
  id: string,
  onMessage: ({ rev, hex }: { rev: string; hex: string }) => void,
  onError?: (error: Event) => void,
): Promise<() => void>
```

### Parameters

#### `id`

The id of an on-chain object.

#### `onMessage`

The function to call when the object is updated. The callback has two parameters, the new revision of the object and the hex of the transaction encoding the update.

#### `onError`

The function to call when an error is thrown.

### Return Value

A function to close the connection to the server.

## Description

The function enables real-time updates via Server-Sent Events (SSEs). The function takes an on-chain ID and a callback function as arguments. The callback is triggered whenever a method is called on the on-chain object with the specified ID.

## Examples

```ts
import { Computer, Contract } from '@bitcoin-computer/lib'

class Counter extends Contract {
  n: number

  constructor() {
    super({ n: 0 })
  }
  inc() {
    this.n += 1
  }
}

const computer = new Computer()
await computer.faucet(1e8)

// Create on-chain object
const c = await computer.new(Counter, [])

// Subscribe to updates on object c
let eventCount = 0
const close = await computer.subscribe(c._id, ({ rev, hex }) => {
  eventCount += 1
})

// Update on-chain object
await c.inc()
await c.inc()

// Wait for events using a Promise
await new Promise<void>((resolve, reject) => {
  let retryCount = 0

  // Retry every 200 ms
  const interval = setInterval(() => {
    retryCount += 1

    // if two events have been received the test passes
    if (eventCount === 2) {
      clearInterval(interval)
      resolve()
    }

    // After 4 s the test fails
    if (retryCount > 20) {
      clearInterval(interval)
      close()
      reject(new Error('Missed SSE'))
    }
  }, 200)
})

// Close connection to the server
close()
```
