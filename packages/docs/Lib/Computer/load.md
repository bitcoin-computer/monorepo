# load

_Loads a module from the blockchain._

### Type

```ts
;(rev: string) => Promise<ModuleExportsNamespace>
```

### Parameters

#### `rev`

A module specifier encoded as a string of the form `<transaction-id>:<output-number>`.

### Return Value

A JavaScript module.

### Example

```ts
class C extends Contract {}
const computer = new Computer({ chain, network, url })
await computer.faucet(1e8)

// Deploy module
const rev = await computer.deploy(`export ${C}`)

// Load module
const { C: Loaded } = await computer.load(rev)

// The deployed module is always equal to Loaded Module
// when white spaces are removed
const trim = (Class) => Class.toString().replace(/\s+/g, '')
expect(trim(Loaded)).eq(trim(C))
```
