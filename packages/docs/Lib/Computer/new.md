# new

_Creates an on-chain object._

## Type

```ts
;<T extends new (...args: any) => any>(
  constructor: T,
  args?: ConstructorParameters<T>,
  mod?: string,
) =>
  Promise<
    InstanceType<T> & {
      _id: string
      _rev: string
      _root: string
      _satoshis: bigint
      _owners: string[]
      _readers?: string[]
      _url?: string
    }
  >
```

### Parameters

#### `constructor`

A named JavaScript class `T`.

#### `args`

Arguments to the constructor of the class `T`.

#### `mod`

Optionally, a string of the for `<transaction-id>:<output-number>` that references a module.

### Return Value

If `T` or one of its sub-objects does not extend from `Contract` an error is thrown. Otherwise it returns an on-chain object of class `T`. The objectk has all the properties specified in `T` and in addition the properties `_id`, `_rev`, `_root`, `_owners`, and `_satoshis`. If the constructor defined properties `_url` or `_readers` they must have the types as indicated above.

## Description

The `new` function can create on-chain objects. The creation of a smart object is recorded in a transaction on the blockchain (see [here](../../how-it-works.md) for more details on how it works). Once an on-chain object is created its properties can only be updated through function calls. Every time a function is called, a transaction is broadcast that records the function call on the blockchain. For this reason it is necessary to `await` on all function calls on an on-chain object. Multiple users can [`sync`](./sync.md) to the same smart object to get consensus over its state.

!!!success Success
On-chain objects can be freely combines: you can pass an on-chain object as a parameter into a constructor or function call.
!!!

## Example

:::code source="../../../lib/test/lib/computer/new.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/new.test.ts" target=_blank>Source</a>
