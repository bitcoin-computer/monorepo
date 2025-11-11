# getOUTXOs

_Returns output identifiers of outputs containing *unspent smart objects** for the given query parameters._

## Type

```ts
async getOUTXOs(q: GetTXOsQuery & { verbosity?: 0 }): Promise<string[]>
async getOUTXOs(q: GetTXOsQuery & { verbosity: 1 }): Promise<DbOutput[]>
async getOUTXOs(q: GetTXOsQuery): Promise<string[] | DbOutput[]>
```

## Description

The `getOUTXOs` function is *syntactic sugar* for the [`getTXOs`](./getTXOs.md) with `isObject` set to `true` and `isSpent` set to `false`. The name is short for get-object-unspent-transaction-outputs, it return only output identifiers of output that encode unpent smart objects.

This function is commonly used to query for the latest revisions of smart objects.

## Parameters

It accepts the same parameters as [`getTXOs`](./getTXOs.md), except that `isObject` and `isSpent` are always set.

{.compact}
| Key | Description |
| ------------- | -------------------------------------------- |
| All keys from `getTXOs` | Same behavior as in `getTXOs` |
| isObject | Always `true` |
| isSpent | Always `false` |

## Return Value

An array of either revision strings or rows from the Output table, depending on the verbosity level.

## Example

```ts
// Return all unspent smart objects owned by a public key
const unspentObjects = await computer.getUOTXOs({ publicKey, verbosity: 1 })
```

[See also → getTXOs](./getTXOs.md)
