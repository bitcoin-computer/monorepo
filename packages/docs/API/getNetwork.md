# getNetwork

Returns the network.

### Syntax
```js
const network = computer.getNetwork()
```

### Type
```ts
() => string
```

### Return value

Returns a string encoding the network.

### Examples
```ts
const network = computer.getNetwork()
expect(network === 'regtest')
```