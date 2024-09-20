---
order: -40
icon: flame
---

# Sale

We explain how to sell a smart object to an unknown buyer atomically and trustlessly. Whereas both objects are known in advance in a [swap](./swap.md), the output containing the payment that Buyer will use in the sale is unknown when Seller is building the swap transaction. Seller builds a partial transaction consisting of only one input for the asset and one output for the payment received. Buyer can later add an input for the payment and an output for the asset after the sale.

!!!
These examples use several advanced features (sighash types, mocking, and controlling the order of inputs and outputs, ordinal safe programming) that are not sufficiently documented elsewhere. If you would like to use these features we suggest to ask about their safe use [here](https://t.me/thebitcoincomputer).
!!!

## Smart Object Sale

We first explain a simpler version that works for the Bitcoin Computer but not for ordinals. The [next](#ordinals-sale) section explains a version that can be used with ordinals.

Seller needs to build a partial transaction containing an input spending the asset and an output for receiving the payment. The [sighash type](https://developer.bitcoin.org/devguide/transactions.html#signature-hash-types) `SIGHASH_SINGLE | SIGHASH_ANYONECANPAY` allows Seller to sign only the first input and output. 

Buyer wants to obtain the smart object in the first input so Buyer is incentivized to build the transaction according to the protocol. If he broadcasts transaction that is invalid in the Bitcoin Computer protocol, Buyer destroys the smart object but pays the Seller.

### Smart Contracts

We call this transaction described above the "crossover" transaction because the asset passes from the first input to the second output and the payment passes from the second input to the first output. In order to build it with the Bitcoin Computer, one needs to know that the order of inputs is determined by the order of objects in the environment and the order of outputs is determined by the order of objects in the value returned from the expression.

Seller uses an environment `{ n: ..., p: ... }`, indicating that the first input will spend the NFT `n` and the second input will spend the payment `p`. Seller will use the expression `${Sale} Sale.exec(n, p)`. As the `exec` function of the `Sale` contract returns an array `[p, n]` the first output wil represent `p` and the second output will represent `n`. This is exactly the "crossover" transaction described above.

```ts
export class Sale extends Contract {
  static exec(n: NFT, p: Payment) {
    const [ownerN] = n._owners
    const [ownerP] = p._owners
    n.transfer(ownerP)
    p.transfer(ownerN)
    return [p, n]
  }
}
```

The first argument to the `exec` function is an nft of the following class.

```ts
export class NFT extends Contract {
  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
```

The second argument is created by Buyer to pay for the nft.

```ts
class Payment extends Contract {
  constructor(_amount: number) {
    super({ _amount })
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setAmount(a: number) {
    this._amount = a
  }
}
```

In the following sections, we explain the process of seller minting an NFT and creating a sales transaction as well as a buyer going through a purchase.

### Minting an NFT

To mint an nft, Seller can use the `computer.new` function.

```ts
const nft = await seller.new(NFT, ['name', 'symbol'])
```

### Building the Sales Transaction

The challenge in creating the sales transaction arises from the fact that the output containing the payment is not yet created at the time of building the transaction. This is a problem because, in order to evaluate an expression on the Bitcoin Computer, either a smart object or a revision of an existing smart object is required for all parameters of the call.

To handle such scenarios the Bitcoin Computer provides a feature called mocking. A mock is a class that has the properties `_id`, `_rev`, `_root`, `_amount`, and `_owners`, and sets them to strings of the form `mock:<transaction-id>:<output-number>`. A mock does not have to extend from `Contract`. Each mocked object must have a distinct transaction id and output number.

The following code shows the class to create the payment mock as well as Seller creating a new instance with the standard Javascript `new` keyword.

```ts
class PaymentMock {
  constructor(amount: number) {
    this._id = `mock:${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`
    this._rev = `mock:${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`
    this._root = `mock:${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`
    this._amount = amount
    this._owners = [<some public key>]
  }

  transfer(to: string) {
    this._owners = [to]
  }

  setAmount(a: number) {
    this._amount = a
  }
}

const mock = new PaymentMock(1e8)
```

Now Seller is ready to create and sign the partial sale transaction using as shown below. There is a lot going on, so we will break down the arguments below.

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

The expression contains the source code of the `Sale` class and an expression that calls the static `exec` function.

```ts
  exp: `${Sale} Sale.exec(nft, payment)`,
```

The next two lines contain the instructions for the mocking system. Seller can use the `mock` object that was created earlier as shown in the code below. The revision of the mock is passed in as the payment revision to the environment; and an object is passed to the `mocks` key that maps the name `payment` to the `mock` object. If an object is mocked up, the Bitcoin Computer will build a transaction without checking that mocked up objects exist on the blockchain and will assume that the value is as in the object passed into `mocks`. Later buyer will update the input that spends the revision of the payment mock with the revision and output number of an actual payment.

```ts
  env: { nft: nft._rev, payment: mock._rev },
  mocks: { payment: mock },
```

To enable Buyer to modify Seller's transaction later, Seller signs the first input with the [sighash type](https://developer.bitcoin.org/devguide/transactions.html#signature-hash-types) `SIGHASH_SINGLE | SIGHASH_ANYONECANPAY`. This means that Seller's signature remains valid even when arbitrary inputs and outputs are added to the transaction as long as the input and the output that Seller has signed have the same index. This guarantees that any transaction that contains the input that spends Sellers NFT will also contain the output that pays Seller. This is how Seller is guaranteed to always get paid. Essentially, the Seller is stating: "you can spend the output containing the NFT as long as you include the output that pays me".

```ts
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 0,
```

Finally, Seller set's `funding` to false to prevent the transaction from being funded by the `encode` function as Seller wants Buyer to cover the transaction fees.

```ts
  fund: false,
```

Seller can publish the sales transaction to the general public. An interested buyer can create a payment object and complete and broadcast the sale transaction to purchase the nft. This is described in the next section.

### Buying the NFT

First, Buyer creates a smart object that can be used in the sale.

```ts
const payment = await buyer.new(Payment, [1e8])
const [paymentTxId, paymentIndex] = payment._rev.split(':')
```

Next, Buyer updates the second input of the transaction that currently spends the payment swap.

```ts
tx.updateInput(1, { txId: paymentTxId, index: parseInt(paymentIndex, 10) })
```

Then Buyer updates the second output to contain Buyer's public key. This ensures that Buyer will be new owner of the nft. 

```ts
tx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey()})
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
  // eslint-disable-next-line no-bitwise
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 0,
  fund: false,
})

// Buyer creates a payment object with the asking price
const payment = await buyer.new(Payment, [1e8])
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

### Reducing Fees

The example before is wasteful because the source code of the `Sale` class is written into the blockchain on every sale. To avoid this, we recommend to [deploy](../API/deploy.md) the `Sale` class and refer to the module when executing a sale.

We provide a class `NftHelper` that helps with deploying the smart contract as a module, minting the nfts with a reference to the deployed module, transferring NFTs, and returning the balance and owner of an NFT.

```ts
interface ITBC721 {
  deploy(): Promise<string>
  mint(name: string, symbol: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownersOf(tokenId: string): Promise<string[]>
  transfer(tokenId: string, to: string)
}
```

The code below shows how the same flow as above can be implemented using the `NftHelper` class.

```ts
// Create and fund wallets
const alice = new Computer(RLTC)
const bob = new Computer(RLTC)
await alice.faucet(1e8)
await bob.faucet(1e8)

// Alice creates helper objects
const nftHelper = new NftHelper(alice)
const saleHelperA = new SaleHelper(alice)

// Alice deploys the smart contracts
await nftHelper.deploy()
await saleHelperA.deploy()

// Alice mints an NFT
const nftA = await nftHelper.mint('a', 'AAA')

// Alice creates a payment mock
const mock = new PaymentMock(nftPrice)

// Alice creates a swap transaction
const { tx: saleTx } = await saleHelperA.createSaleTx(nftA, mock)

// Bob checks the swap transaction
SaleHelper.checkSaleTx()

// Bob creates the payment and finalizes the transaction
const payment = await bob.new(Payment, [nftPrice])
const finalTx = SaleHelper.finalizeSaleTx(saleTx, payment, bob.toScriptPubKey())

// Bob signs an broadcasts the transaction to execute the swap
await bob.fund(finalTx)
await bob.sign(finalTx)
await bob.broadcast(finalTx)
```

## Ordinal Sale

The `Sale` smart contract is not safe to use with ordinals because the smart objects have different ordinal ranges before and after the call. To preserve the ordinal ranges the expression must not use the `_amount` keyword and must not return an object or an array containing an object.

Building a sale contract for ordinals is more complicated than for smart objects. A very clever construction was proposed by Rodarmor [here](https://github.com/ordinals/ord/issues/802) and later [refined](https://github.com/ordinals/ord/issues/802#issuecomment-1498030294). Our smart contract below implements this exact idea. 


### Smart Contracts

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
tx.updateOutput(1, { scriptPubKey: buyer.toScriptPubKey()})

// Buyer funds, signs, and broadcasts to execute the sale
await buyer.fund(tx)
await buyer.sign(tx)
await buyer.broadcast(tx)
```

### Reducing Fees

Just like in the case of selling smart object sales, one can save transaction fees by using the module system through a helper class as shown below.

```ts
// Create and fund wallets
const alice = new Computer(RLTC)
const bob = new Computer(RLTC)
await alice.faucet(1e8)
await bob.faucet(1e8)

// Alice creates helper objects
const nftHelper = new NftHelper(alice)
const saleHelperA = new OrdSaleHelper(alice)

// Alice deploys the smart contracts
await nftHelper.deploy()
await saleHelperA.deploy()

// Alice mints an NFT
const nftA = await nftHelper.mint('a', 'AAA')

// Alice creates a payment mock
const paymentMock = new PaymentMock(nftPrice)
const b1Mock = new ValuableMock()
const b2Mock = new ValuableMock()

// Alice creates a swap transaction
const { tx: saleTx } = await saleHelperA.createSaleTx(b1Mock, b2Mock, nftA, paymentMock)

// Bob checks the swap transaction
OrdSaleHelper.checkSaleTx()

// Bob creates the payment and finalizes the transaction
const payment = await bob.new(Payment, [nftPrice])
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
