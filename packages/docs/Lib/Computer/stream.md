# stream

_Executes a callback when a transaction matching the provided filter is seen. The client will receive two messages – one when the transaction is first seen in the mempool, and another when it is confirmed on-chain. The callback receives the revision of the matching output and the hex of the transaction. This function uses Server-Sent Events (SSEs) to provide real-time updates._

## Type

```ts
type Stream = {
  satoshis?: bigint
  asm?: string
  exp?: string
  mod?: string
}

stream(
  filter: Partial<Stream>,
  onMessage: ({ rev, hex }: { rev: string; hex: string }) => void,
  onError?: (error: Event) => void,
): Promise<() => void>
```

### Parameters

#### `filter`

A partial `Stream` object that defines the criteria a transaction output must satisfy. Any combination of the supported fields (e.g., `mod`, `satoshis`, `asm`) can be used. All provided fields are combined with AND logic.

#### `onMessage``

The function to call when a matching transaction is detected. The callback receives an object containing:

`rev` – the revision string of the matching output

`hex` – the full raw transaction hex

#### `onError` (optional)

The function to call when an error occurs on the SSE connection.

### Return Value

A function that, when called, closes the SSE connection and stops receiving updates.

## Description

The stream method enables real-time updates via Server-Sent Events (SSEs) that match a custom filter. It opens an SSE connection to the server and invokes the provided callback whenever a transaction containing an output that exactly matches all conditions in the filter is broadcast — first in the mempool and again when confirmed in a block.

Example:::code source="../../../lib/test/lib/computer/stream.test.ts" :::<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/stream.test.ts" target="_blank">Source</a>

```


```
