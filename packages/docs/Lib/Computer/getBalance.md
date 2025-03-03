# getBalance

Returns an object with the current balance in Satoshi, the confirmed balance in Satoshi (at least 1 confirmation), and the unconfirmed balance in Satoshi.

### Type
```ts
() => Promise<{balance: number, confirmed: number, unconfirmed: number}>
```

### Syntax
```js
await computer.getBalance()
```

### Return value

Returns the current balance in Satoshi.
