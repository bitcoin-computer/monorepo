# load

Imports a ES6 module from a module specifier.

### Syntax
```js
const { A } = await computer.load(rev, computer.wallet)
```

### Type
```ts
(rev: string, wallet: Wallet) => Promise<new (...args: any) => any>;
```

### Parameters

#### rev
A string encoding a javascript class that extends from ``Contract``.

#### wallet
A wallet object.

### Return value
A ES6 module.

### Examples
```ts
class A extends Contract {}
const module = `export ${A}`
const rev = await computer.export(module)
const { A: AA } = await computer.import(rev)

expect(AA).to.equal(A)
```