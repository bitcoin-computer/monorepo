# first

_Returns the first revision of a given revision._

## Type

```ts
  first(rev: string): Promise<string>
```

### Parameters

#### `rev`

A revision encoded as a string of the form `<transaction-id>:<output-number>`.

### Return Value

Returns the first revision of the same on chain object, that is, its id.

## Description

If `first` is called with a revision for which no output exists, it throws an error `Rev not found`. If the output exists but contains no object, the same error is thrown. If the output contains an object, `first` will return the first revision of an object as indicated by the arrows in the figure below.

[![](../../static/first.png)](https://wallet.bitcoincomputer.io)

## Example

:::code source="../../../lib/test/lib/computer/first.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/first.test.ts" target=_blank>Source</a>
