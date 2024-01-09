# broadcast

Broadcasts a Bitcoin transaction to the Bitcoin mining network.

### Type
```ts
(tx: BitcoinLib.Transaction) => Promise<string>
```

### Syntax
```js
const txId = await computer.broadcast(tx)
```

### Parameters

#### tx
A Bitcoin transaction object.


### Return value

If broadcast is successful, it returns an string encoding the transaction id. Otherwise, an error is thrown.

### Examples
```ts
class C extends Contract {}
const transition = { exp: `${C} new C()` }
const { tx } = await computer.encode(transition)
const txId = await computer.broadcast(tx)
```