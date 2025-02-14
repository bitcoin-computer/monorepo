# faucet

The `faucet` function funds a computer object. It is only available when the computer object is connected to a node in regtest mode. The faucet function creates a utxo to fund the address. The utxo is created with the amount of satoshis specified in the first parameter. The address to be funded can be specified in the second parameter. If the address is not specified, the address of the computer object is used. The transaction is broadcasted to the network, and a block is mined immediately to confirm the transaction.

### Type

```ts
;(amount: number, address = this.getAddress()) => Promise<_Unspent>
```

### Syntax

```js
const utxo = await computer.broadcast(amount)
const utxo = await computer.broadcast(amount, address)
```

### Parameters

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| amount | An amount of Satoshi |
| address | An string encoded address to be funded |

### Return value

The utxo created to fund the address.

### Examples

```ts
const computer = new Computer()
await computer.faucet(0.001e8)
```
