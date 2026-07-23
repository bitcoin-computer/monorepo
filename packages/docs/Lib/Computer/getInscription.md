# getInscription

_Static helper: extracts Bitcoin Computer module inscription data from a raw transaction witness._

## Type

```ts
static getInscription(
  rawTx: string,
  index: number,
): { contentType: string; body: string }
```

### Parameters

#### `rawTx`

Serialized transaction hex.

#### `index`

Input index whose witness holds the taproot script-path reveal.

### Return Value

`contentType` and `body` (module source) for a valid `BC` protocol envelope. Empty strings if the input has no witness. Throws if the witness is not a valid BC module inscription.

## Description

Used for taproot module deploys (`moduleStorageType: 'taproot'`). Multisig modules use data-output `{ ept }` instead; see [`deploy`](./deploy.md) and [`Transaction.onChainMetaData`](../Transaction/index.md#onchainmetadata).

Protocol id is **`BC`** (not ordinals `ord`). Content type is typically `text/javascript`.

## Example

```ts
const { contentType, body } = Computer.getInscription(rawTxHex, 0)
```

## See also

- [deploy](./deploy.md) / [load](./load.md)
- [getModule](./getModule.md)
