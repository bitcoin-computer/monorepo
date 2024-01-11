# getUtxos

Returns an array of unspent transaction outputs (UTXOs). Each UTXO is encoded as a string of the form \<transaction id\>:\<output number\>

### Syntax
```js
await computer.getUtxos()
```

### Type
```ts
() => Promise<string[]>
```

### Return value

Returns an array of unspent transaction outputs (UTXOs).
