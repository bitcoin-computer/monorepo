# send

Sends a payment.

### Type

```ts
;(amount: number, address: string) => Promise<string>
```

### Syntax

```js
await computer.send(satoshis, address)
```

### Parameters

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| amount | A number representing the amount of satoshis to be sent.|
| address | An string encoding the receiver address.|

### Return value

If successful, it returns the id of the transaction broadcast.

### Examples

```ts
const satoshis = 100000
const address = '1FFsHfDBEh57BB1nkeuKAk25H44U7mmMXd'
const txId = await computer.send(satoshis, address)
```
