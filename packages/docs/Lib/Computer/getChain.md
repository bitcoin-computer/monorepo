# getChain

_Returns the chain._

## Type

```ts
;() => 'LTC' | 'BTC' | 'PEPE' | 'BCH' | 'DOGE'
```

\* `BCH` and `DOGE` support coming soon

### Return value

Returns a string encoding the chain.

## Example

```ts
const chain = 'BTC'
const computer = new Computer({ chain })
expect(computer.getChain()).eq(chain)
```
