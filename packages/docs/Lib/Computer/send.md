# send

_Sends a payment._

## Type

```ts
;(amount: number, address: string) => Promise<string>
```

### Parameters

#### `amount`

A number representing the amount of satoshis to be sent.

#### `address`

An string encoding the receiver address.

### Return Value

If successful, it returns the id of the transaction broadcast.

## Example

```ts
const satoshis = 100000
const address = '1FFsHfDBEh57BB1nkeuKAk25H44U7mmMXd'
const txId = await computer.send(satoshis, address)
```
