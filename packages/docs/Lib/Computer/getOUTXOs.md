# getOUTXOs

_Returns **unspent smart-object** outputs for the given query parameters._

## Type

```ts
async getOUTXOs(q: TXOQuery & { verbosity?: 0 }): Promise<string[]>
async getOUTXOs(q: TXOQuery & { verbosity: 1 }): Promise<TXORecord[]>
async getOUTXOs(q: TXOQuery): Promise<string[] | TXORecord[]>
```

## Description

The `getOUTXOs` function is syntactic sugar for [`getTXOs`](./getTXOs.md) with `isObject: true` and `isSpent: false`. The name stands for **get object unspent transaction outputs**: only unspent outputs that encode smart objects.

This is the preferred replacement for the deprecated [`query`](./query.md) method when listing live object revisions (for example by `publicKey` or `mod`).

To list **module deploys** (source text), use [`getModules`](./getModules.md), not `getOUTXOs`.

## Parameters

Same as [`getTXOs`](./getTXOs.md), except:

{.compact}
| Key | Description |
| ------------- | -------------------------------------------- |
| isObject | Always `true` |
| isSpent | Always `false` |

## Return Value

An array of revision strings (`verbosity: 0`) or `TXORecord` rows (`verbosity: 1`).

## Example

```ts
// Unspent smart objects for a public key
const revs = await computer.getOUTXOs({ publicKey })
const rows = await computer.getOUTXOs({ publicKey, verbosity: 1 })

// Objects created with a given module
const tokenRevs = await computer.getOUTXOs({ mod: modSpecifier })
```

[See also → getTXOs](./getTXOs.md)
