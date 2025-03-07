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

## Examples

`getBlockchainInfo` returns information about the status of the blockchain.

```ts
const { result } = await computer.rpcCall('getBlockchainInfo', '')
expect(result.blocks).a('number')
expect(result.bestblockhash).a('string')
```

`getRawTransaction` returns information about the transaction.

```ts
const c = await computer.new(C, [])
const txId = c._id.slice(0, 64)
const { result } = await computer.rpcCall('getRawTransaction', `${txId} 1`)
expect(result.txid).eq(txId)
expect(result.hex).a('string')
```

`getTxOut` returns information about an output.

```ts
const c = await computer.new(C, [])
const [txId, outNum] = c._id.split(':')
const { result } = await computer.rpcCall('getTxOut', `${txId} ${outNum} true`)
expect(result.scriptPubKey.asm).eq(`1 ${computer.getPublicKey()} 1 OP_CHECKMULTISIG`)
```

`generateToAddress` mines a block to a specific address (only available on regtest).

```ts
const { balance: balanceBefore } = await computer.getBalance()
await computer.rpcCall('generateToAddress', `1 ${computer.getAddress()}`)
const { balance: balanceAfter } = await computer.getBalance()
expect(balanceAfter - balanceBefore).to.be.closeTo(50e8, 1e4)
```
