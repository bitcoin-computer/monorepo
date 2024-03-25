---
order: -40
icon: flame
---

# Sales

In the case of a swap, both smart objects have to be known before the swap transaction can be built. In this section we show how a single smart object can be offered for sale at a specified price.

## Smart Object Sale

### Smart Contract

We will be reusing the `Swap` smart contract from the Section on [Swaps](./swap.md#swap-using-a-static-function). 

### Helper Classes

Buyer will use the smart contract below to create a smart object holding the satoshis to pay for the NFT.

```ts
class Payment extends Contract {
  constructor(owner: string, _amount: number) {
    super({ _owners: [owner], _amount })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
```

Seller will use this helper class to mock up the input that will later be used to spend Buyers's payment object.

```ts
const randomPublicKey = '023e21361b53bb2e625cc1f41d18b35ae882e88d8d107df1c3711fa8bc54db8fed'
const mockedRev = 'mock:0000000000000000000000000000000000000000000000000000000000000000:0'

class PaymentMock {
  constructor(owner: string, amount: number) {
    this._id = mockedRev
    this._rev = mockedRev
    this._root = mockedRev
    this._owners = [owner]
    this._amount = amount
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
```

### Usage

Todo: add description here.

```ts
// Create and fund wallet
const seller = new Computer(RLTC)
const buyer = new Computer(RLTC)
await seller.faucet(1e8)
await buyer.faucet(2e8)

// Seller mints an NFT
const nft = await seller.new(NFT, ['name', 'symbol'])

// Seller creates partially signed swap as a sale offer
const mock = new PaymentMock(seller.getPublicKey(), 7860)
const { SIGHASH_SINGLE, SIGHASH_ANYONECANPAY } = Transaction
const { tx } = await seller.encode({
  exp: `${Sale} Sale.exec(nft, payment)`,
  env: { nft: nft._rev, payment: mock._rev },
  mocks: { payment: mock },
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 0,
  fund: false,
})

// Buyer creates a payment object with the asking price
const payment = await buyer.new(Payment, [buyer.getPublicKey(), 1e8])
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

#### Reducing Fees

The example before is wasteful if many sales are executed because the source code of the `Sale` class is written into the blockchain on every sale. To avoid this waste of blockspace and fees, it is possible to use our module system to inscribe the `Sale` smart contract once as a module so that is can be referred to every time a swap is executed. The usage of the helper classes is shown below.

```ts
// Create and fund wallets
const alice = new Computer(RLTC)
const bob = new Computer(RLTC)
await alice.faucet(1e8)
await bob.faucet(1e8)

// Alice creates helper objects
const tbc721A = new TBC721(alice)
const saleHelperA = new SaleHelper(alice)

// Alice deploys the smart contracts
await tbc721A.deploy()
await saleHelperA.deploy()

// Alice mints an NFT
const nftA = await tbc721A.mint('a', 'AAA')

// Alice creates a payment mock
const mock = new PaymentMock(alice.getPublicKey(), nftPrice)

// Alice creates a swap transaction
const { tx: saleTx } = await saleHelperA.createSaleTx(nftA, mock)

// Bob checks the swap transaction
SaleHelper.checkSaleTx()

// Bob creates the payment and finalizes the transaction
const payment = await bob.new(Payment, [bob.getPublicKey(), nftPrice])
const finalTx = SaleHelper.finalizeSaleTx(saleTx, payment, bob.toScriptPubKey())

// Bob signs an broadcasts the transaction to execute the swap
await bob.fund(finalTx)
await bob.sign(finalTx)
await bob.broadcast(finalTx)
```

## Ordinals Sale

The `Sale` smart contract does not preserver ordinal ranges. That is, the ordinal range of the NFT before the sale will not be the same as the ordinal range after the swap.

### Smart Contract 

```ts
export class Sale extends Contract {
  static exec(b1: Valuable, b2: Valuable, t: NFT, p: NFT) {
    const [ownerT] = t._owners
    const [ownerP] = p._owners
    t.transfer(ownerP)
    p.transfer(ownerT)
    b1.setAmount(b1._amount + b2._amount)
    return [b1, t, p, b2]
  }
}
```

### Usage

```ts
// Create and fund wallets
const seller = new Computer(RLTC)
const buyer = new Computer(RLTC)
await seller.faucet(1e8)
await buyer.faucet(2e8)

// Seller mints an NFT
const nft = await seller.new(NFT, ['name', 'symbol'])

// Seller creates partially signed swap as a sale offer
const paymentMock = new PaymentMock(seller.getPublicKey(), 7860)
const b1Mock = new ValuableMock()
const b2Mock = new ValuableMock()

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
const payment = await buyer.new(Payment, [buyer.getPublicKey(), 1e8])
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

#### Reducing Fees

```ts
// Create and fund wallets
const alice = new Computer(RLTC)
const bob = new Computer(RLTC)
await alice.faucet(1e8)
await bob.faucet(1e8)

// Alice creates helper objects
const tbc721A = new TBC721(alice)
const saleHelperA = new OrdSaleHelper(alice)

// Alice deploys the smart contracts
await tbc721A.deploy()
await saleHelperA.deploy()

// Alice mints an NFT
const nftA = await tbc721A.mint('a', 'AAA')

// Alice creates a payment mock
const paymentMock = new PaymentMock(alice.getPublicKey(), nftPrice)
const b1Mock = new ValuableMock()
const b2Mock = new ValuableMock()

// Alice creates a swap transaction
const { tx: saleTx } = await saleHelperA.createSaleTx(b1Mock, b2Mock, nftA, paymentMock)

// Bob checks the swap transaction
OrdSaleHelper.checkSaleTx()

// Bob creates the payment and finalizes the transaction
const payment = await bob.new(Payment, [bob.getPublicKey(), nftPrice])
const b1 = await bob.new(Valuable, [])
const b2 = await bob.new(Valuable, [])
const finalTx = OrdSaleHelper.finalizeSaleTx(saleTx, b1, b2, payment, bob.toScriptPubKey())

// Bob signs an broadcasts the transaction to execute the swap
await bob.fund(finalTx)
await bob.sign(finalTx)
await bob.broadcast(finalTx)
```

## Code

You can find the code [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme).
