---
order: -40
icon: flame
---

# Sale

In the previous example both smart objects as well as their owners had to be known before the swap transaction could be built. In this section we show how a sale offer can be built by a seller with needing to know the buyer in advance.

## Smart Contract

We will be reusing the `Swap` smart contract from above, but we also need a new smart contract `Payment` below. Buyer will use this contract to create a smart object holding the satoshis to pay for the NFT

```ts
class Payment extends Contract {
  _owners: string[]

  constructor(owner: string) {
    super({ _owners: [owner] })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
```

## Helper Class

Alice will use this helper class to mock up the input that will later be used to spend Bob's payment object.

```ts
const randomPublicKey = '023e21361b53bb2e625cc1f41d18b35ae882e88d8d107df1c3711fa8bc54db8fed'
const mockedRev = 'mock:0000000000000000000000000000000000000000000000000000000000000000:0'

class PaymentMock {
  _amount: number
  _owners: string[]

  constructor() {
    this._id = mockedRev
    this._rev = mockedRev
    this._root = mockedRev
    this._owners = [randomPublicKey]
    this._amount = 7860
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
```

## Usage

Todo: add description here.

```ts
// Create and fund wallet
const seller = new Computer()
const buyer = new Computer()
await seller.faucet(0.1e8)
await buyer.faucet(0.1e8)

// Seller mints an NFT
const nft = await seller.new(NFT, [seller.getPublicKey(), 'NFT'])

// Seller creates partially signed swap as a sale offer
const mock = new PaymentMock()
const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = BTransaction
const { tx } = await seller.encode({
  exp: `${Swap} Swap.exec(nft, payment)`,
  env: { nft: nft._rev, payment: mock._rev },
  mocks: { payment: mock },
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 0,
  fund: false,
})

// Buyer creates a payment object with the asking price
const payment = await buyer.new(Payment, [buyer.getPublicKey()])
const [paymentTxId, paymentIndex] = payment._rev.split(':')

// Buyer set's the payment object as the second input of the swap tx
tx.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })

// Buyer updates the second output of the swap tx to receive the NFT
tx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey()})

// Buyer funds, signs, and broadcasts to execute the sale
await buyer.fund(tx)
await buyer.sign(tx)
await buyer.broadcast(tx)
```