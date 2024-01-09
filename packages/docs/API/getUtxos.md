# getUtxos

Returns an array of unspent transaction outputs (UTXOs).

### Syntax
```js
const utxos = await computer.getUtxos()
```

### Type
```ts
() => Promise<BitcoinLib.Transaction.UnspentOutput[]>
```

### Return value

Returns an array of unspent transaction outputs (UTXOs).

### Examples
```ts
const utxos = await computer.getUtxos()
```