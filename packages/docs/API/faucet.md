# faucet

The `faucet` function funds a computer object. It is only available when the computer object is connected to a node in regtest mode.

### Type
```ts
(amount: number, address = this.getAddress()) => Promise<_Unspent>
```

### Syntax
```js
const utxo = await computer.broadcast(amount)
const utxo = await computer.broadcast(amount, address)
```

### Parameters

#### amount
An amount of Satoshi

#### address
An string encoded address to be funded

### Return value

The utxo created to fund the address.

### Examples
```ts
const computer = new Computer()
await computer.faucet(0.001e8)
```