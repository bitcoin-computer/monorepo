# getOTXOs

_Returns **Bitcoin Computer Objects** for the given query parameters._

## Type

```ts
async getOTXOs(q: TXOQuery & { verbosity?: 0 }): Promise<string[]>
async getOTXOs(q: TXOQuery & { verbosity: 1 }): Promise<TXORecord[]>
async getOTXOs(q: TXOQuery): Promise<string[] | TXORecord[]>
```

## Description

The `getOTXOs` function is syntactic sugar for [`getTXOs`](./getTXOs.md) with `isObject: true`. The name stands for **get object transaction outputs**: outputs that encode smart objects (spent or unspent).

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
