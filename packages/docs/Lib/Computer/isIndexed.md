# isIndexed

_Checks whether the Bitcoin Computer Node has committed Output rows for a transaction._

## Type

```ts
isIndexed(
  location: string,
): Promise<{ indexed: boolean; hasOutputs: boolean; hasInputs: boolean }>
```

### Parameters

#### `location`

A transaction id or revision (`<txid>:<vout>`). The check uses the transaction id.

### Return Value

{.compact}
| Field | Description |
| ----------- | -------------------------------------------------------- |
| indexed | `true` when at least one Output row exists for the tx |
| hasOutputs | Whether any Output rows exist for the tx |
| hasInputs | Whether any Input rows exist for the tx |

## Description

Use this for a one-shot readiness check. For waiting after a write, prefer [`waitForIndexed`](./waitForIndexed.md).

## Example

```ts
const status = await computer.isIndexed(txId)
if (!status.indexed) {
  await computer.waitForIndexed(txId)
}
```
