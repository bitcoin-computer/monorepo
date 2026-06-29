# getUTXOs

_Returns **Unspent Transaction Outputs (UTXOs)** for the given query parameters._

## Type

```ts
async getUTXOs(q: TXOQuery & { verbosity?: 0 }): Promise<string[]>
async getUTXOs(q: TXOQuery & { verbosity: 1 }): Promise<DbOutput[]>
async getUTXOs(q: TXOQuery): Promise<string[] | TXORecord[]>
```

## Description

The `getUTXOs` function is _syntactic sugar_ for [`getTXOs`](./getTXOs.md) function where `isSpent` is set to `false`. It return only unspent outputs that may or may not contain smart objects.

## Parameters

It accepts the same parameters as [`getTXOs`](./getTXOs.md), except that `isSpent` is always fixed to `false`.

{.compact}
| Key | Description |
| ------------- | -------------------------------------------- |
| All keys from `getTXOs` | Same behavior as in `getTXOs` |
| isSpent | Always `false` |

## Return Value

An array of either revision strings or rows from the Output table, depending on the verbosity level. It is important to highlight that the returned outputs are UTXOs that can encode smart objects, based on the query parameters provided.

## Example

```ts
// Return all unspent TXOs for a given address
const utxos = await computer.getUTXOs({ address, verbosity: 1 })
```

[See also → getTXOs](./getTXOs.md)
