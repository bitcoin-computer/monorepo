# getOTXOs

_Returns **Bitcoin Computer Objects** for the given query parameters._

## Type

```ts
async getOTXOs(q: GetTXOsQuery & { verbosity?: 0 }): Promise<string[]>
async getOTXOs(q: GetTXOsQuery & { verbosity: 1 }): Promise<DbOutput[]>
async getOTXOs(q: GetTXOsQuery): Promise<string[] | DbOutput[]>
```

## Description

The `getOTXOs` function is a **syntactic sugar** built on top of [`getTXOs`](./getTXOs.md).  
It automatically sets the parameter `isObject: true` to return only **Bitcoin Computer objects** (outputs that encode a smart object).

Objects are identified by the presence of specific patterns in their locking script.

## Parameters

It accepts the same parameters as [`getTXOs`](./getTXOs.md), except that `isObject` is always fixed to `true`.

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
