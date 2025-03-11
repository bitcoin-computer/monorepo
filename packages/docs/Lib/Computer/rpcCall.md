# rpcCall

_Calls a Bitcoin RPC method with the given parameters._

## Type

```ts
;(method: string, params: string) => Promise<any>
```

### Parameters

#### `method`

An string encoding the name of the rpc function to be called.

#### `params`

An string with the argument list of the rpc function call to be called, separated by spaces.

### Return Value

A JSON object with the result of the rpc method call.

## Example

:::code source="../../../lib/test/lib/computer/rpc-call.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/rpc-call.test.ts" target=_blank>Sources</a>
