# rpcCall

Calls a Bitcoin RPC method with the given parameters.

### Type
```ts
(method: string, params: string) => Promise<any>
```

### Syntax
```js
await computer.rpcCall(method,params)
```

### Parameters

#### method
An string encoding the name of the rpc function to be called.

#### params
An string with the argument list of the rpc function call to be called, separated by spaces.

### Return value

A JSON object with the result of the rpc method call.

### Examples
```ts
await computer.rpcCall('getBlockchainInfo', '')
```