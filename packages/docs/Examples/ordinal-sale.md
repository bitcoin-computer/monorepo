---
order: -45
icon: number
---

# Ordinal Sale

The [`Sale`](./sale.md) smart contract is not safe to use with ordinals because the smart objects have different ordinal ranges before and after the call. To preserve the ordinal ranges the expression must not use the `_amount` keyword and must not return an object or an array containing an object.

Building a sale contract for ordinals is more complicated than for smart objects. A very clever construction was proposed [here](https://github.com/ordinals/ord/issues/802) and later [refined](https://github.com/ordinals/ord/issues/802#issuecomment-1498030294). Our smart contract below implements this exact idea.

!!!success
This code preserves ordinal ranges and is safe to use this in smart objects that contain ordinals.
!!!

## Smart Contract

The `exec` function of the `OrdSale` class swaps the owners just like in the `Sale` class. However it then proceeds to double the amount of `b1` and return `[b1, t, p, b2]`.

```ts
class OrdSale extends Contract {
  static exec(b1: Payment, b2: Payment, n: NFT, p: Payment) {
    const [ownerT] = n._owners
    const [ownerP] = p._owners
    n.transfer(ownerP)
    p.transfer(ownerT)

    b1.setAmount(b1._amount + b2._amount)
    return [b1, n, p, b2]
  }
}
```

When the `exec` function is evaluated, a transaction of the following form is built:

```
Inputs: b1, b2, t, p
Outputs: b1, t, p, b2
```

The amount of `b1` after the call is the sum of the amounts of `b1` and `b2` before combined. The smart object `b1` therefore absorbs the entire ordinals range of `b2`. The objects `n` and `p` do not change their amounts during the call, these objects preserve their ordinal ranges.

We now explain the whole process of minting an NFT, listing it for sale, and processing a purchase. We skip the step for minting as it was described above.

## Usage

### Building the Sales Transaction

In order to build the sale transaction, Seller first needs to create the objects `b1`, `b2`, and `p`:

```ts
const paymentMock = new PaymentMock(7860)
const b1Mock = new PaymentMock()
const b2Mock = new PaymentMock()
```

Next Seller can build the sales transaction by executing the following code:

```ts
const { tx } = await seller.encode({
  exp: `${OrdSale} OrdSale.exec(b1, b2, nft, payment)`,
  env: { b1: b1Mock._rev, b2: b2Mock._rev, nft: nft._rev, payment: paymentMock._rev },
  mocks: { b1: b1Mock, b2: b2Mock, payment: paymentMock },
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 2,
  fund: false,
})
```

Conceptually this is very similar to the use of `encode` above. Note however, that Seller signs the third input output pair this time. This is because the NFT is spent by the third input and the payment that Seller wants to obtain is in the third output.

### Buying the Ordinal NFT

This process is similar to the case of a smart object sale above. See the example blow.

### Full Example

```ts
import { Computer } from '@bitcoin-computer/lib'

// Create and fund wallets
const seller = new Computer(RLTC)
const buyer = new Computer(RLTC)
await seller.faucet(1e8)
await buyer.faucet(2e8)

// Seller mints an NFT
const nft = await seller.new(NFT, ['name', 'symbol'])

// Seller creates partially signed swap as a sale offer
const paymentMock = new PaymentMock(7860)
const b1Mock = new PaymentMock()
const b2Mock = new PaymentMock()

const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction
const { tx } = await seller.encode({
  exp: `${OrdSale} OrdSale.exec(b1, b2, nft, payment)`,
  env: { b1: b1Mock._rev, b2: b2Mock._rev, nft: nft._rev, payment: paymentMock._rev },
  mocks: { b1: b1Mock, b2: b2Mock, payment: paymentMock },
  // eslint-disable-next-line no-bitwise
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 2,
  fund: false,
})

// Buyer creates a payment object with the asking price
const payment = await buyer.new(Payment, [1e8])
const [paymentTxId, paymentIndex] = payment._rev.split(':')

// Buyer set's the payment object as the second input of the swap tx
tx.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })

// Buyer updates the second output of the swap tx to receive the NFT
tx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey() })

// Buyer funds, signs, and broadcasts to execute the sale
await buyer.fund(tx)
await buyer.sign(tx)
await buyer.broadcast(tx)
```

## Code

You can find the code [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme).
