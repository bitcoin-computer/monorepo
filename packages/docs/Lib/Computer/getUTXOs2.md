# getUTXOs

_Returns **Unspent Transaction Outputs (UTXOs)** for the given query parameters._

## Type

```ts
async getUTXOs(q: GetTXOsQuery & { verbosity?: 0 }): Promise<string[]>
async getUTXOs(q: GetTXOsQuery & { verbosity: 1 }): Promise<DbOutput[]>
async getUTXOs(q: GetTXOsQuery): Promise<string[] | DbOutput[]>
```

## Description

The `getUTXOs` function is a **syntactic sugar** built on top of [`getTXOs`](./getTXOs.md).  
It automatically sets the parameter `isSpent: false` to return only **unspent** outputs.

It can be used to query Bitcoin UTXOs or Bitcoin Computer objects that have not been spent yet.

## Parameters

It accepts the same parameters as [`getTXOs`](./getTXOs.md), except that `isSpent` is always fixed to `false`.

{.compact}
| Key | Description |
| ------------- | -------------------------------------------- |
| All keys from `getTXOs` | Same behavior as in `getTXOs` |
| isSpent | Always `false` |

## Return Value

An array of either revision strings or rows from the Output table, depending on the verbosity level. It is important to highlight that the returned outputs are Bitcoin UTXOs that can encode Bitcoin Computer objects, based on the query parameters provided. If `isObject` is not specified, the returned UTXOs may include both regular Bitcoin outputs or outputs that encode Bitcoin Computer objects.

## Example

```ts
// Return all unspent TXOs for a given address
const utxos = await computer.getUTXOs({ address, verbosity: 1 })
```

[See also → getTXOs](./getTXOs.md)
