# fund

_Funds a Bitcoin transaction._

## Type

```ts
(
  tx: NakamotoJS.Transaction,
  opts?: {
    include?: string[]
    exclude?: string[]
  }
): Promise<void>
```

### Parameters

#### `tx`

A [NakamotoJS transaction](../../NakamotoJs/) object or a [Bitcoin Computer Transaction](../Transaction/) object (Bitcoin Computer’s `Transaction` extends NakamotoJS).

#### `opts`

Optional UTXO selection. When `include` is set, those UTXOs are preferred as funding inputs.

{.compact}

| Key | Description | Default |
| ------- | ----------- | ------- |
| include | UTXOs to prefer as inputs | `[]` |
| exclude | UTXOs to avoid | `[]` |

Fee rate is controlled via [`setFee`](./setFee.md) / [`getFee`](./getFee.md) (`satPerByte`), not via `fund` options.

UTXOs are encoded as `<transaction-id>:<output-number>`.

### Return Value

If the wallet does not have sufficient funds, an error is thrown.

## Example

:::code source="../../../lib/test/lib/computer/fund.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/fund.test.ts" target=_blank>Source</a>
