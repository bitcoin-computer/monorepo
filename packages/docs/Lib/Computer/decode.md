# decode

_Parses a Bitcoin transaction and returns its metadata if it is a Bitcoin Computer transaction._

## Type

```ts
;(tx: NakamotoJS.Transaction) =>
  Promise<{
    exp: string
    env?: { [s: string]: string }
    mod?: string
  }>
```

### Parameters

#### `tx`

A NakamotoJS [transaction](https://github.com/bitcoin-computer/monorepo/blob/main/packages/nakamotojs/ts_src/transaction.ts).

### Return value

An object containing the following properties:

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| exp | The JavaScript expression of the transaction |
| env | A mapping from variable names to revisions |
| mod | A module specifier |

## Description

The function `decode` is the inverse of `encode` when the latter is called with `exp`, `env`, and `mod`.

## Example

```ts
class C extends Contract {}
const computer = new Computer()
const transition = {
  exp: `${C} new ${C.name}()`,
  env: {},
  mod: '',
}
const { tx } = await computer.encode(transition)
const decoded = await computer.decode(tx)

expect(decoded).to.deep.equal(transition)
```
