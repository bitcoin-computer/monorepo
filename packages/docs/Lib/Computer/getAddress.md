# getAddress

_Returns the Bitcoin address._

## Type

```ts
;() => string
```

### Return Value

A string encoded Bitcoin address.

### Syntax

```js
computer.getAddress()
```

## Examples

By default the address is pay-to-pubkey-hash (p2pkh).

```ts
const p2pkhRegex = /^[1LmnM][a-km-zA-HJ-NP-Z1-9]{25,35}$/
const p2pkhComputer = new Computer()
expect(p2pkhRegex.test(p2pkhComputer.getAddress())).eq(true)
```

You can configure the `Computer` object to use pay-to-witness-pubkey-hash (p2wpkh) by setting the `addressType` in the constructor.

```ts
const p2wpkhRegex = /^(?:bc|tb|ltc|tltc|rltc)1q[a-z0-9]{38}$/
const p2wpkhComputer = new Computer({ addressType: 'p2wpkh' })
expect(p2wpkhRegex.test(p2wpkhComputer.getAddress())).eq(true)
```

You can also use pay-to-taproot (p2tr).

```ts
const p2trRegex = /^(?:bc|tb|ltc|tltc|rltc)1p[a-z0-9]{58}$/
const p2trComputer = new Computer({ addressType: 'p2tr' })
expect(p2trRegex.test(p2trComputer.getAddress())).eq(true)
```
