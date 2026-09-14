# rpc

_Calls a Bitcoin RPC method with the given parameters via the Bitcoin Computer node._

## Type

```ts
;(method: string, params: string) => Promise<any>
```

### Parameters

#### `method: string`

Name of the Bitcoin RPC method to invoke (e.g. `"getblockheader"`, `"getrawtransaction"`, `"sendtoaddress"`).

#### `params: string`

A **space-separated string** containing the arguments for the RPC call.

- For methods with optional trailing parameters, you may omit them.
- Use an empty string `""` when calling methods that take no arguments.
- Example: `"txid123 1"` or just `"txid123"` (when the second parameter is optional).

### Return Value

Returns a Promise that resolves to **bitcoind's `result`** for the method (not the `{ result, error, id }` JSON-RPC envelope). The node unwraps that envelope before responding.

The shape depends on the method, for example:

- `getblockchaininfo` → `{ blocks, bestblockhash, ... }`
- `getrawtransaction` with verbosity `1` → `{ txid, hex, vin, vout, ... }`
- `getblockhash` → a hash string

## Examples

```ts
// Call with no parameters
const mempoolInfo = await computer.rpc('getmempoolinfo', '')

// Call getblockheader with only the required hash (optional 'verbose' omitted)
const header = await computer.rpc('getblockheader', blockHash)

// Call getrawtransaction with verbosity
const tx = await computer.rpc('getrawtransaction', `${txId} 1`)
```

## Notes

- The underlying node now supports omitting optional parameters for methods like
  `getrawtransaction`, `getblock`, and `getblockheader`.
- Only whitelisted methods (controlled by `BCN_ALLOWED_RPC_METHODS` on the node) can be called.
- For common lookups, prefer the typed helpers: [`txIdToBlockTime`](./txIdToBlockTime.md), [`txIdToBlockHeight`](./txIdToBlockHeight.md), [`txIdToBlockHash`](./txIdToBlockHash.md), [`getBlockHash`](./getBlockHash.md), [`getBlockHeight`](./getBlockHeight.md), [`getRawTransaction`](./getRawTransaction.md), [`getRawBlock`](./getRawBlock.md), and [`getBlockHeader`](./getBlockHeader.md).

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/rpc-call.test.ts" target=_blank>Source</a>
