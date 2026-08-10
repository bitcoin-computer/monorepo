# latest

_Returns the latest revision of an on chain object. Note that the latest revision of an object can be either unspent or spent._

## Type

```ts
  latest(rev: string): Promise<string>
```

### Parameters

#### `rev`

A revision encoded as a string of the form `<transaction-id>:<output-number>`.

### Return Value

Returns the latest revision of the same on chain object - that is, its id.

## Description

If `latest` is called with a revision for which no output exists, it throws an error `Rev not found`. If the output exists but contains no object, the same error is thrown. If the output contains an object, `latest` will return the latest revision of an object as indicated by the arrows in the figure below.

### Not available inside smart contracts

`latest` is **not** exposed on InnerComputer (the in-contract `computer` global). The live tip can change under chain extension, so it is unsuitable for deterministic contract evaluation. Inside contracts, use confirmed history ([`first`](./first.md) / [`prev`](./prev.md) / [`getAncestors`](./getAncestors.md)) or terminal checks via [`last`](./last.md) after a confirmed spend. See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

[![](../../static/latest.png)](https://wallet.bitcoincomputer.io)

## Example

:::code source="../../../lib/test/lib/computer/latest.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/latest.test.ts" target=_blank>Source</a>
