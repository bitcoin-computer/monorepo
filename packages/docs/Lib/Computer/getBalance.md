# getBalance

_Returns the balance in satoshi._

## Type

```ts
;() => Promise<{ balance: number; confirmed: number; unconfirmed: number }>
```

### Return Value

The current balance in Satoshi.

## Description

Returns the confirmed balance in Satoshi, the unconfirmed balance, and the total balance in satoshi.

## Example

```ts
const computer = new Computer()
expect(await computer.getBalance()).matchPattern({
  confirmed: (c) => typeof c === 'number',
  unconfirmed: (u) => typeof u === 'number',
  balance: (b) => typeof b === 'number',
})
```
