# send

Sends a payment.

### Syntax
```js
const txId = await computer.send(satoshis, address)
```

### Type
```ts
(amount: number, address: string) => Promise<string>
```

### Parameters

#### amount
A number representing the amount of satoshis to be sent.

#### address
An string encoding the receiver address.

### Return value
If successful, it returns an string encoding the transaction id of the payment.

### Examples
```ts
const satoshis = 100000
const address = '1FFsHfDBEh57BB1nkeuKAk25H44U7mmMXd'
const txId = await computer.send(satoshis, address)
```