# deploy

The `deploy` function stores an ES6 module on the blockchain and returns an identifier for that module. This identifier can be passed into the functions [`computer.new`](./new.md), [`computer.encode`](./encode.md), [`computer.encodeNew`](./encodeNew.md), and [`computer.encodeCall`](./encodeCall.md) to make the exports of the module available there.

The advantage of deploying your code is that it can save transaction fees: A large piece of code can be deployed once and then used to create or update many smart objects.

!!!
Please note that modules are not encrypted, even if objects that use them have the `_readers` property set.
!!!

There are two different modes to store a module on the blockchain: `taproot` or `multisig` mode. The default mode is `taproot`. The mode can be changed by passing the option `moduleStorageType` into the constructor of the `Computer` class. In Taproot mode, the module is stored in a Taproot script. This is cheeper and it enables you to store larger Javascript programs in a module. The multisig mode stores the module in multisig scripts. This is more expensive but compatible with chains that do not support Taproot.

### Type

```ts
;(module: string) => Promise<string>
```

### Syntax

```js
const rev = await computer.deploy(exp)
```

### Parameters

{.compact}
| Parameter | Description |
|--------------|---------------------------------------------------------------|
| module | A string encoding an ES6 module.|

### Return value

A string encoding the location where the module is stored. The format is \<transaction id\>:\<output number\>.

### Examples

```ts
const revA = await computer.deploy(`export class A extends Contract {}`)

const revB = await computer.deploy(`
  import { A } from '${revA}'
  export class B extends A {}
`)

const transition = { exp: `new B()`, mod: revB }
const tx = await computer.encode(transition)
```

!!!secondary
Previously this function was called `export` but this name is deprecated since version 0.16.0.
!!!
