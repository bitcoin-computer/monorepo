# getPrivateKey

_Returns a string encoded private key._

## Type

```ts
;() => string
```

### Return value

Returns a string encoded BIP32 private key.

## Example

```ts
const computer = new Computer()
expect(typeof computer.getPrivateKey()).eq('string')
```
