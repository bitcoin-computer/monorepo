# delete

_Spends (destroys) the given smart-object revisions by building, funding, signing, and broadcasting a spend transaction._

## Type

```ts
delete(inRevs: string[]): Promise<string>
```

### Parameters

#### `inRevs`

Array of revisions (`<txid>:<vout>`) to spend as inputs.

### Return Value

Transaction id of the broadcast spend transaction.

## Description

Builds an update that spends the listed revisions, funds and signs it with the wallet, then broadcasts. Use when you intentionally want to remove those object UTXOs from the chain set.

## Example

```ts
const txId = await computer.delete([object._rev])
```
