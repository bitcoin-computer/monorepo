# getUTXOs

_Returns **unspent transaction outputs (UTXOs)** for the given query parameters._

## Type

```ts
async getUTXOs(q: TXOQuery & { verbosity?: 0 }): Promise<string[]>
async getUTXOs(q: TXOQuery & { verbosity: 1 }): Promise<TXORecord[]>
async getUTXOs(q: TXOQuery): Promise<string[] | TXORecord[]>
```

## Description

The `getUTXOs` function is syntactic sugar for [`getTXOs`](./getTXOs.md) with `isSpent: false`. It returns unspent outputs that may or may not encode smart objects.

## Parameters

Same as [`getTXOs`](./getTXOs.md), except:

{.compact}
| Key | Description |
| ------------- | -------------------------------------------- |
| isSpent | Always `false` |

## Return Value

An array of revision strings (`verbosity: 0`) or `TXORecord` rows (`verbosity: 1`).

## Example

```ts
// All unspent TXOs for an address
const utxos = await computer.getUTXOs({ address, verbosity: 1 })
```

[See also → getTXOs](./getTXOs.md)
