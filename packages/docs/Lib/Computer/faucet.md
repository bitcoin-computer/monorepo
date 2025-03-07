# faucet

_Funds an address on regtest for testing._

## Type

```ts
;(amount: number, address?: string) => Promise<UTXO>
```

### Parameters

#### `amount`

An amount of Satoshi, indicates the amount that should be credited

#### `address`

If set, indicated the address to be funded. If undefined the wallet of the current `Computer` object will be funded.

### Return Value

The utxo containing the funds.

## Description

Funds a `Computer` object on regtest. A second parameter can provide an address to fund, otherwise the calling object is funded. If the object is not configured to regtest an error is thrown.

## Examples

The first example shows how to fund the current `Computer` object.

```ts
const c = new Computer()

// Fund client side wallet
const utxo = await c.faucet(1e8)
expect(utxo).to.matchPattern({
  txId: (txId) => typeof txId === 'string',
  vout: (vout) => typeof vout === 'number',
  height: -1,
  satoshis: 1e8,
})

// Check balance
const { balance } = await c.getBalance()
expect(balance).eq(1e8)
```

The second example shows how another object can be funded.

```ts
const c1 = new Computer({ chain, network, url })
const c2 = new Computer({ chain, network, url })
await c1.faucet(1e8, c2.getAddress())
const { balance: b1 } = await c1.getBalance()
const { balance: b2 } = await c2.getBalance()
expect(b1).eq(0)
expect(b2).eq(1e8)
```

The last example shows that an error is thrown if the `Computer` object is not configured to regtest.

```ts
const c = new Computer({ network: 'testnet' })
await expect(c.faucet(1e8)).to.be.rejected
```
