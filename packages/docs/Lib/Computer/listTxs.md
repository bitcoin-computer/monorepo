# listTxs

_Lists sent and received transactions for an address._

## Type

```ts
listTxs(address?: string): Promise<{
  sentTxs: Array<{ txId: string; inputsSatoshis: bigint; outputsSatoshis: bigint; satoshis: bigint }>
  receivedTxs: Array<{ txId: string; inputsSatoshis: bigint; outputsSatoshis: bigint; satoshis: bigint }>
}>
```

### Parameters

#### `address` (optional)

Bitcoin address to list. Defaults to the wallet address of this `Computer` instance.

### Return Value

Objects describing transactions that sent or received value for the address (via the node wallet APIs).

## Example

```ts
const { sentTxs, receivedTxs } = await computer.listTxs()
const forAddr = await computer.listTxs(computer.getAddress())
```
