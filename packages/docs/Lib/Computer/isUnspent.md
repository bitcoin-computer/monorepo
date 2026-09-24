# isUnspent

_Returns whether a revision is still an unspent output on the chain (via RPC `gettxout`)._

## Type

```ts
isUnspent(rev: string): Promise<boolean>
```

### Parameters

#### `rev`

Revision of the form `<txid>:<vout>`.

### Return Value

`true` if the output is still unspent according to the chain RPC; otherwise `false`.

## Description

Uses Bitcoin RPC through the node (`gettxout`). This is chain UTXO set status, not merely presence of a row in the node’s indexer.
