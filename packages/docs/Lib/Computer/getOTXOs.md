# getOTXOs

_Returns **Bitcoin Computer Objects** for the given query parameters._

## Type

```ts
async getOTXOs(q: GetTXOsQuery & { verbosity?: 0 }): Promise<string[]>
async getOTXOs(q: GetTXOsQuery & { verbosity: 1 }): Promise<DbOutput[]>
async getOTXOs(q: GetTXOsQuery): Promise<string[] | DbOutput[]>
```

## Description

The `getOTXOs` function is *syntactic sugar* for the [`getTXOs`](./getTXOs.md) with `isObject` set to `true`. The name is short for get-object-transaction-outputs, it return only output identifiers of output that encode *smart objects*.

## Parameters

It accepts the same parameters as [`getTXOs`](./getTXOs.md), except that `isObject` is always set to `true`.

{.compact}
| Key | Description |
| ------------- | -------------------------------------------- |
| All keys from `getTXOs` | Same behavior as in `getTXOs` |
| isObject | Always `true` |

## Return Value

An array of either revision strings or rows from the Output table, depending on the verbosity level.

## Example

```ts
// Return all on-chain objects owned by a public key
const objects = await computer.getOTXOs({ publicKey, verbosity: 1 })
```

[See also → getTXOs](./getTXOs.md)
