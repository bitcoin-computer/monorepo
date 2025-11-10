# getUOTXOs

_Returns **Unspent Bitcoin Computer Objects** for the given query parameters._

## Type

```ts
async getUOTXOs(q: GetTXOsQuery & { verbosity?: 0 }): Promise<string[]>
async getUOTXOs(q: GetTXOsQuery & { verbosity: 1 }): Promise<DbOutput[]>
async getUOTXOs(q: GetTXOsQuery): Promise<string[] | DbOutput[]>
```

## Description

The `getUOTXOs` function is a **syntactic sugar** built on top of [`getTXOs`](./getTXOs.md).  
It automatically sets the parameters `isObject: true` and `isSpent: false`, returning only **unspent Bitcoin Computer objects**.

This function is commonly used to query the set of smart objects owned by a specific public key that are still spendable.

## Parameters

It accepts the same parameters as [`getTXOs`](./getTXOs.md), except that `isObject` and `isSpent` are always fixed.

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
