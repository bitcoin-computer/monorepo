# subscribe

_Executes a callback when an on-chain object is updated. The client will receive two messages, one when the transaction is first seen in the mempool, and another when it is confirmed on-chain. The callback receives the new revision of the object and the hex of the transaction encoding the update. This function uses Server-Sent Events (SSEs) to provide real-time updates._

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

The function enables real-time updates via Server-Sent Events (SSEs). The function takes an on-chain ID and a callback function as arguments. The callback is triggered whenever a method is called on the on-chain object with the specified ID. The callback receives two parameters: the new revision of the object and the hex of the transaction encoding the update.

When invoked, the function establishes a connection to the server to listen for updates related to the specified on-chain ID. It returns a function that can be called to close the connection when real-time updates are no longer needed.

## Example

:::code source="../../../lib/test/lib/computer/subscribe.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/subscribe.test.ts" target=_blank>Source</a>
