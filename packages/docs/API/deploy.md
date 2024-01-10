# deploy

The ``deploy`` function broadcasts a transaction containing an ES6 module. Modules can also import other modules that have been deployed to the blockchain previously (see example below).

Deploying your code has the advantage that many objects can import the same module. This saves transaction fees, as large pieces of code can be deployed once and then used to create or update many smart objects.

Please note that modules are currently not encrypted, even if objects that use them have the ``_readers`` property set.

Previously this function was called ``export`` but this name is deprecated since version 0.16.0.

### Syntax
```js
const rev = await computer.deploy(exp)
```

### Type
```ts
(module: string) => Promise<string>
```

### Parameters

#### exp
A string encoding a javascript class that extends from ``Contract``.

### Return value

The return value is a string encoding the location where the object is stored. 

### Examples
```ts
const revA = await computer.deploy(
  `export class A extends Contract {}`
)

const revB = await computer.deploy(`
  import { A } from '${revA}'
  export class B extends A {}
`)

const transition = { exp: `new B()`, mod: revB }
const tx = await computer.encode(transition)
```