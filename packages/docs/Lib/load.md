# load

Imports a ES6 module from a module specifier encoded as a string \<transaction id\>:\<output number\>.

### Type

```ts
;(rev: string) => Promise<ModuleExportsNamespace>
```

### Syntax

```js
await computer.load(rev)
```

### Parameters

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| rev | A string encoding a module specifier.|

### Return value

A ES6 module.

### Examples

```ts
class A extends Contract {}
const rev = await computer.deploy(`export ${A}`)
const { A: AA } = await computer.load(rev)
expect(AA).to.equal(A)
```
