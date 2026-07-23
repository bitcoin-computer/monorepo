# getAncestors

_Returns the ancestor transaction history for a revision or transaction id._

## Type

```ts
getAncestors(location: string, verbosity?: number): Promise<string[] | Map<string, string>>
```

### Parameters

#### `location`

A transaction id or a revision (`<txid>:<vout>`). Ancestors are resolved for the transaction id.

#### `verbosity` (optional)

- omitted / not `1` — array of ancestor transaction ids
- `1` — `Map<txId, hex>` of those transactions

### Return Value

Ancestor transaction ids (default), or a map of id → raw hex when `verbosity === 1`.

### Syntax

```js
computer.getAncestors(rev)
computer.getAncestors(rev, 1)
```

## Example

:::code source="../../../lib/test/lib/computer/get-ancestors.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-ancestors.test.ts" target=_blank>Source</a>
