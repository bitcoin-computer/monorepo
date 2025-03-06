# getPublicKey

_Returns a string encoding a public key._

## Type

```ts
;() => string
```

### Return value

A string encoding BIP32 public key.

## Example

```ts
const computer = new Computer()
expect(typeof computer.getPublicKey()).eq('string')
```
