# getPassphrase

_Returns the passphrase._

## Type

```ts
;() => string
```

### Return Value

The passphrase.

## Description

The passphrase can be set in the `Computer` constructor. It defaults to an empty string.

## Examples

The passphrase defaults to the empty string

```ts
const computer = new Computer()
expect(computer.getPassphrase()).eq('')
```

You can set a passphrase by passing it into the constructor.

```ts
const computer = new Computer({ passphrase: 'passphrase' })
expect(computer.getPassphrase()).eq('passphrase')
```
