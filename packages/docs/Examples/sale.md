---
order: -40
icon: flame
---

# Sale

We explain how to sell a smart object to an unknown buyer atomically. Whereas both objects are known in advance in a [swap](./swap.md), the output containing the payment that Buyer will use in the sale is unknown when Seller is building the swap transaction. Seller builds a partial transaction consisting of only one input for the asset and one output for the payment to be received. Buyer can later add an input for the payment and an output for the asset after the sale.

!!!
These examples use several advanced features (sighash types, mocking, and controlling the order of inputs and outputs, ordinal safe programming) that are not sufficiently documented elsewhere. If you would like to use these features we suggest to ask about their safe use [here](https://t.me/thebitcoincomputer).
!!!

!!!warning Warning
This code is not safe to use with ordinals. A slightly more complicated version that works for ordinals is described [here](./ordinal-sale.md).
!!!

## Smart Contract

Seller builds a partial transaction containing an input spending the asset and an output for receiving the payment. The [sighash type](https://developer.bitcoin.org/devguide/transactions.html#signature-hash-types) `SIGHASH_SINGLE | SIGHASH_ANYONECANPAY` allows Seller to sign only the first input and output.

Buyer wants to obtain the smart object in the first input so Buyer is incentivized to build the transaction according to the protocol. If he broadcasts a transaction that is invalid in the Bitcoin Computer protocol, Buyer destroys the smart object but still pays the Seller.

We call this transaction described above the "crossover" transaction because the asset passes from the first input to the second output and the payment passes from the second input to the first output. In order to build it with the Bitcoin Computer, one needs to take into account that the order of inputs is determined by the order of objects in the environment and the order of outputs is determined by the order of objects in the value returned from the expression.

Seller uses an environment `{ nft: ..., payment: ... }`, indicating that the first input will spend `nft` and the second input will spend `payment`. As the `exec` function returns an array `[payment, nft]` the first output represents the payment and the second output represent the nft. This is exactly the "crossover" transaction described above.

```javascript
export class NFT extends Contract {
  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

export class Payment extends Contract {
  constructor(_amount: bigint) {
    super({ _amount })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

export class Sale extends Contract {
  static exec(nft: NFT, payment: Payment) {
    const [ownerN] = nft._owners
    const [ownerP] = payment._owners

    nft.transfer(ownerP)
    payment.transfer(ownerN)

    return [payment, nft]
  }
}
```

## Usage

### Mocking the Payment Object

The challenge in creating the sales transaction arises from the fact that the output containing the payment is not yet created at the time of building the transaction. To handle such scenarios the Bitcoin Computer provides a feature called mocking. A mock is a class that has the properties `_id`, `_rev`, `_root`, `_amount`, and `_owners`, and sets them to strings of the form `mock-<transaction-id>:<output-number>`. A mock does not have to extend from `Contract`. Each mocked object must have a distinct transaction id and output number.

The following code shows the class to create the payment mock as well as Seller creating a new instance with the standard JavaScript `new` keyword.

```ts
const mockedRev = `mock-${'0'.repeat(64)}:0`

class PaymentMock {
  constructor(amount: bigint) {
    this._id = mockedRev
    this._rev = mockedRev
    this._root = mockedRev
    this._amount = amount
    this._owners = [<some public key>]
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

const mock = new PaymentMock(100000000n)
```

### Building the Sales Transaction

Seller can create and sign the partial sale transaction using the code below.

```ts
const { tx } = await seller.encode({
  exp: `${Sale} Sale.exec(n, p)`,
  env: { n: nft._rev, p: mock._rev },
  mocks: { payment: mock },
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 0,
  fund: false,
})
```

The expression contains the `Sale` class and an expression that calls the static `exec` function.

```ts
  exp: `${Sale} Sale.exec(nft, payment)`,
```

The next two lines contain the instructions for the mocking system. Seller can use the `mock` object that was created earlier as shown below. The revision of the mock is passed in as the payment revision to the environment; and an object is passed to the `mocks` key that maps the name `payment` to the `mock` object. If an object is mocked up, the Bitcoin Computer will build a transaction assuming that the output spent is associated with the value provided by the mock. Later buyer will update the input that spends the revision of the payment mock with the revision and output number of an actual payment.

```ts
  env: { nft: nft._rev, payment: mock._rev },
  mocks: { payment: mock },
```

To enable Buyer to modify Seller's transaction later, Seller signs the first input with the [sighash type](https://developer.bitcoin.org/devguide/transactions.html#signature-hash-types) `SIGHASH_SINGLE | SIGHASH_ANYONECANPAY`. This means that Seller's signature remains valid even when arbitrary inputs and outputs are added to the transaction as long as the input and the output that Seller has signed have the same index. This guarantees that any transaction that contains the input that spends Sellers NFT will also contain the output that pays Seller. This guarantees that Seller gets paid. Intuitively speaking, the Seller is stating: "you can spend the output containing the NFT as long as you include the output that pays me the correct amount".

```ts
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 0,
```

Finally, Seller set's `funding` to false so that Buyer covers the transaction fees.

```ts
  fund: false,
```

Seller can publish the sales transaction without any risk. An interested buyer can create a payment object and complete and broadcast the sale transaction to purchase the nft. This is described in the next section.

### Buying the NFT

First, Buyer creates a smart object to pay for the nft.

```ts
const payment = await buyer.new(Payment, [100000000n])
const [paymentTxId, paymentIndex] = payment._rev.split(':')
```

Next, Buyer updates the second input of the transaction that currently points to the revision of the payment mock.

```ts
const output = {
  txId: paymentTxId,
  index: parseInt(paymentIndex, 10),
}
tx.updateInput(1, output)
```

Then Buyer updates the second output to contain Buyer's public key. This ensures that Buyer will be new owner of the nft.

```ts
tx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey() })
```

Finally Buyer funds, signs, and broadcasts to execute the sale.

```ts
await buyer.fund(tx)
await buyer.sign(tx)
await buyer.broadcast(tx)
```

### Full Example

The code below shows the whole process of minting an nft, listing it for sale, and a purchase. Working code can be found [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme)

```ts
import { Computer } from '@bitcoin-computer/lib'

// Create and fund wallets
const seller = new Computer({ url })
const buyer = new Computer({ url })
await seller.faucet(1e8)
await buyer.faucet(2e8)

// Seller mints an NFT
const nft = await seller.new(NFT, ['name', 'symbol'])

// Seller creates a mock for the eventual payment
const mock = new PaymentMock(7860)

// Seller creates partially signed swap as a sale offer
const { tx: saleTx } = await seller.encode({
  exp: `${Sale} Sale.exec(nft, payment)`,
  env: { nft: nft._rev, payment: mock._rev },
  mocks: { payment: mock },
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 0,
  fund: false,
})

// Buyer creates a payment object with the asking price
const payment = await buyer.new(Payment, [100000000n])
const [paymentTxId, paymentIndex] = payment._rev.split(':')

// Buyer set's the payment object as the second input of the swap tx
saleTx.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })

// Buyer updates the second output of the swap tx to receive the NFT
saleTx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey() })

// Buyer funds, signs, and broadcasts to execute the sale
await buyer.fund(saleTx)
await buyer.sign(saleTx)
await buyer.broadcast(saleTx)
```

## Code

You can find the code [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme).
