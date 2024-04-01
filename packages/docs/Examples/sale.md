---
order: -40
icon: flame
---

# Sales

!!!
These examples use several advanced features (sighash types, mocking, and controlling the order of inputs and outputs, ordinal safe programming) that are not sufficiently documented elsewhere. If you would like to use these features we suggest to ask about their safe use [here](https://t.me/thebitcoincomputer).
!!!

In a swap, the smart objects to be swapped are known before the swap transaction is built. In this section we show how a single smart object can be offered for sale at a specified price. Unlike in the case of a swap where both objects are known in advance, the output that will be provided by the buyer later is not known when the swap transaction is built. The Bitcoin Computer provides a feature called mocking that Seller can use to mock up the payment object that Buyer will create later.

## Smart Object Sale

We first explain how to execute the sale of a smart object. The smart contract is quite simple but does not preserving the ordinal ranges of the smart object being sold. It is therefore not safe to use with ordinals. The [next](#ordinals-sale) section explains a slightly more complicated swap that can be used with ordinals.

The idea is to build a "crossover" transaction with two inputs and two outputs where the first inputs spends the NFT `n`, the second output spends a payment smart object `p`, the first output represents `p` after the swap and the second output represents `n` after the swap. 

Seller signs the first input and output with the sighash type `SIGHASH_SINGLE | SIGHASH_ANYONECANPAY` so that any other user can modify the second input and output or add arbitrary inputs and outputs as longs as the input-output pair signed by Seller have the same index. As the input-output pair is signed, Seller is guaranteed that if a transaction containing the pair is included in the blockchain then Seller will get paid. 

Buyer on the other hand wants to obtain the NFT in the first input so Buyer is incentivized to build the transaction according to the protocol. If the Buyer misbehaves, the worst thing that can happen is that Buyer destroys the NFT and pays the Seller.

### Smart Contracts

The first challenge is to build a "crossover" transaction where we have to control the order of inputs and outputs. This is possible with the Bitcoin Computer because the order of inputs is determined by the order of objects in the environment and the order of outputs is determined by the order of objects in the value returned from the expression.

Seller calls `encode` with an environment `{ n: ..., p: ... }`, indicating that the first inputs will spend `n` and the second inputs will spend `p`. Seller will use the expression `${Sale} Sale.exec(n, p)`. As the `exec` function of the `Sale` contract returns an array `[p, n]` the first output wil represent `p` and the second output will represent `n`. This is exactly the "crossover" transaction described above.

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
  constructor(owner: string, _amount: number) {
    super({ _owners: [owner], _amount })
  }

  transfer(to: string) {
    this._owners = [to]
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

The challenge with building the sales transaction is that the output that contains the payment is not yet known when the transaction is built. This is a problem because to evaluate an expression on the Bitcoin Computer either a smart object or the revision of an existing smart object is needed for all parameters of the call.

For this situation the Bitcoin Computer provides a feature called mocking. A mock is a class that has the properties `_id`, `_rev`, `_root`, `_amount`, and `_owners`, and sets them to strings of the form `mock:<transaction-id>:<output-number>`. A mock does not have to extend from `Contract`. Each mocked object must have a distinct transaction id and output number.

The following code shows the class to create the payment mock as well as Seller creating a new instance with the standard Javascript `new` keyword.

```ts
class PaymentMock {
  constructor(owner: string, amount: number) {
    this._id = `mock:${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`
    this._rev = `mock:${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`
    this._root = `mock:${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`
    this._owners = [owner]
    this._amount = amount
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

const mock = new PaymentMock(seller.getPublicKey(), 7860)
```

Now Seller is ready to create and sign the sale transaction using `computer.encode` as shown below. There is a lot going on, so we will break down the arguments below.

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

The expression contains the source code of the `Sale` class and an expression that calls the static `exec` function. Note that every time a sale transaction is created, the source code of the `Sale` class is written into the blockchain again. A more efficient approach is to deploy the `Sale` class as a module first. This is described [here](#reducing-fees).

```ts
  exp: `${Sale} Sale.exec(nft, payment)`,
```

The next two lines contain the instructions for the mocking system. Seller can use the `mock` object that was created earlier as shown in the code below. The revision of the mock is passed in as the payment revision to the environment; and an object is passed to the `mocks` key that maps the name `payment` to the `mock` object. If an object is mocked up, the Bitcoin Computer will build a transaction without checking that mocked up objects exist on the blockchain and will assume that the value is as in the object passed into `mocks`. Later buyer will update the input that spends the revision of the payment mock with the revision and output number of an actual payment.

```ts
  env: { nft: nft._rev, payment: mock._rev },
  mocks: { payment: mock },
```

To enable Buyer to modify Seller's transaction later, Seller signs the first input with the [sighash type](https://developer.bitcoin.org/devguide/transactions.html#signature-hash-types) `SIGHASH_SINGLE | SIGHASH_ANYONECANPAY`. This means that Seller's signature remains valid even when arbitrary inputs and outputs are added to the transaction. In particular, another user could change or remove the Bitcoin Computer specific meta data that is located in output 3.

Essentially the Seller is saying: you can spend the output containing the nft as long as you keep the locking script and the amount of the first output the same. Seller can confidentially publish such a partially signed transaction as he wants to sell the nft spent by the fist inputs for the amount indicated in the first output and both are signed.

```ts
  sighashType: SIGHASH_SINGLE | SIGHASH_ANYONECANPAY,
  inputIndex: 0,
```

Finally, Seller set's `funding` to false to prevent the transaction from being funded by the `encode` function as he wants the Buyer to cover the transaction fees.

```ts
  fund: false,
```

Seller can publish the sales transaction to interested buyers. An interested buyer can create a payment object and broadcast the sale transaction to purchase the nft. This is described in the next section.

### Buying the NFT

First Buyer creates a smart object that can be used in the sale.

```ts
const payment = await buyer.new(Payment, [buyer.getPublicKey(), 1e8])
const [paymentTxId, paymentIndex] = payment._rev.split(':')
```

Next Buyer updates the second input of the transaction that currently spends the payment swap. This is possible without invalidating Sellers signature as the special signhash type was used.

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
const mock = new PaymentMock(seller.getPublicKey(), 7860)

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
const payment = await buyer.new(Payment, [buyer.getPublicKey(), 1e8])
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

### Using a Module to Reduce the Fee

The example before is wasteful if many sales are executed because the source code of the `Sale` class is written into the blockchain on every sale. To avoid this, it is possible to deploy the `Sale` class and refer to this module from every sale executed.

We provide a class `TBC721` that helps with deploying the smart contract as a module, minting the nfts with a reference to the deployed module, transferring NFTs, and returning the balance and owner of an NFT.

```ts
interface ITBC721 {
  deploy(): Promise<string>
  mint(name: string, symbol: string): Promise<NFT>
  balanceOf(publicKey: string): Promise<number>
  ownersOf(tokenId: string): Promise<string[]>
  transfer(tokenId: string, to: string)
}
```

To code below shows how the same flow as above can be implemented using the `TBC721` class.

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

The `Sale` smart contract is not safe to use with ordinals because the smart objects have different ordinal ranges before and after the call. That's because the order of inputs is determined by the order the objects in the environment and the order of outputs is determined by their occurrence in the return value.

To preserve the ordinal ranges the expression must not use the `_amount` keyword and must not return an object or an array containing an object.

Building a sale contract for ordinals is more complicated than for smart objects. A very clever construction was proposed by Rodarmor [here](https://github.com/ordinals/ord/issues/802) and later [refined](https://github.com/ordinals/ord/issues/802#issuecomment-1498030294). Our smart contract below implements this exact idea. 


### Smart Contract

The `exec` function of the `OrdSale` class swaps the owners just like in the `Sale` class. However it then proceeds to double the amount of `b1` and return `[b1, t, p, b2]`.

```ts
class OrdSale extends Contract {
  static exec(b1: Valuable, b2: Valuable, n: NFT, p: Payment) {
    const [ownerT] = n._owners
    const [ownerP] = p._owners
    n.transfer(ownerP)
    p.transfer(ownerT)

    b1.setAmount(b1._amount + b2._amount)
    return [b1, n, p, b2]
  }
}
```

 Note that our smart contract is not safe for ordinals according to the above rule. We will see that it does preserve the ordinal ranges of `b1`, `n`, and `p` but not of `b2`.

 ### Building the Sales Transaction

Seller will broadcast the sale transaction with an environment in which the variables occur in the order `b1, b2, t, p`. As the order in the environment determine the inputs, and the order in the return value determine the outputs, the transaction that is built has the following form:

```
Inputs: b1, b2, t, p
Outputs: b1, t, p, b2
```

The amount of `b1` after the call is the sum of the amounts of `b1` and `b2` before combined. The smart object `b1` therefor absorbs the entire ordinals range of `b2`. Hence the NFT `n` containing the ordinal will be at the second output and the payment will be at the third. The object `b2` will be at the fourth output but it's ordinal range will not be as before the call.

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
