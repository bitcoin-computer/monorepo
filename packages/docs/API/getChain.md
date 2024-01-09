# getChain

Returns the chain.

### Syntax
```js
const chain = computer.getChain()
```

### Type
```ts
() => string
```

### Return value

Returns a string encoding the chain.

### Examples
```ts
const chain = computer.getChain()
expect(chain === 'LTC')
```