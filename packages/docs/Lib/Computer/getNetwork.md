# getNetwork

_Returns the network._

## Type

```ts
;() => 'mainnet' | 'testnet' | 'regtest'
```

### Return value

Returns a string encoding the network.

## Example

```ts
const network = 'mainnet'
const computer = new Computer({ network })
expect(computer.getNetwork()).eq(network)
```
