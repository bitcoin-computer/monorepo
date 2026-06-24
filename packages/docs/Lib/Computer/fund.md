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

A [NakamotoJS transaction](../../NakamotoJs/) object or a [Bitcoin Computer Transaction](../Transaction/) object (that the object from Bitcoin Computer extends the object from NakamotoJS).

#### `opts`

An optional object can be passed as parameter to `include` or `exclude` certain UTXOs. When using `include`, the transaction will be funded with the UTXOs specified as the first inputs.

{.compact}

| Key     | Description      | Default Value |
| ------- | ---------------- | ------------- |
| include | UTXOs to include | `[]`          |
| exclude | UTXOs to exclude | `[]`          |

UTXOs are encoded as `<transaction-id>:<output-number>`.

### Return Value

If the wallet does not have sufficient funds, an error is thrown.

## Example

:::code source="../../../lib/test/lib/computer/fund.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/fund.test.ts" target=_blank>Source</a>
