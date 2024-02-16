---
order: -22
---

# Examples

We explain how applications like tokens and swaps can be built with the Bitcoin Computer.

## Non Fungible Tokens (NFT)

### Smart Contract

A non-fungible token has two properties [`_owners`](./how-it-works.md#keyword-properties-control-the-transaction-being-built) and `img`. It has one function `transfer` that updates the `_owners` property.

```ts
class NFT extends Contract {
  img: string
  _owners: string[]

  constructor(publicKey: string, img: string) {
    super({ _owners: [publicKey], img })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
```

### Usage

To create a non-fungible token you can call the [`new`](./API/new.md) function as shown below. The [`faucet`](./API/faucet.md) function is used to fund the `sender` object when connected to a [Bitcoin Computer Node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme) in regtest mode.

```ts
// Create wallets
const sender = new Computer()
const receiver = new Computer()

// Fund the senders wallet
await sender.faucet(0.001e8)

// Create a new NFT
const nft = await sender.new(NFT, [sender.getPublicKey(), 'Test'])

// Send the NFT
await nft.transfer(receiver.getPublicKey())
```

## Fungible Tokens

### Smart Contract

A fungible token has three properties, a `supply` indicating the number of tokens stored in the current smart object, a property `totalSupply` that that stores the number of tokens that were created during the mint, and an `_owners` property set to the current owner of the smart object.

The `transfer` function takes two arguments, an `amount` to be sent and the public key of the recipient. This function first checks if the current smart object contains sufficient supply and throws an error if it does not. If the supply is sufficient the supply of the current smart object is reduced by the amount to be sent. A new smart object is created that is owned by recipient and that contains the amount to be sent. This object is returned from the function call to create a new smart object.

```ts
class Token extends Contract {
  supply: number
  totalSupply: number
  _owners: string[]

  constructor(to: string, supply: number, totalSupply: number) {
    super({ supply, totalSupply,  _owners: [to] })
  }

  transfer(amount: number, recipient: string) {
    if (this.supply < amount) throw new Error()
    this.supply -= amount
    return new Token(recipient, amount, this.totalSupply)
  }
}
```

### Usage

The usage is as in the case of a non-fungible token.

```ts
// Create wallets
const sender = new Computer()
const receiver = new Computer()

// Fund sender wallet
await sender.faucet(0.001e8)

// Mint new fungible token with total supply of 10
const token = await sender.new(Token, [sender.getPublicKey(), 10, 10])

// Send 2 tokens to receiver, sentToken will have supply of 2 and
// token will have a supply of 8.
const sentToken = await token.transfer(2, receiver.getPublicKey())
```

## Encrypted Chat

### Smart Contract

A chat is just a smart object with a property `messages` of type `string[]`. Like all smart objects it has an `_owners` property set to the current data owner. The [`_readers`](./how-it-works.md#keyword-properties-control-the-transaction-being-built) property can be used to restrict read access. 

```ts
class Chat extends Contract {
  messages: string[]
  _owners: string[]
  _readers: string[]

  constructor(publicKeys: string[]) {
    super({
      messages: [],
      _owners: publicKeys,
      _readers: publicKeys
    })
  }

  post(message) {
    this.messages.push(message)
  }

  remove(publicKey: string) {
    this._readers = this._readers.filter(o => o !== publicKey)
    this._owners_ = this._owners_.filter(o => o !== publicKey)
  }
}
```

### Usage

A new chat can be created using the [`new`](./API/new.md) function. Note that Bob can initially post to the chat and read it's state as Bob's public key was added to the `_owners` array and `_readers` array by Alice upon creation of the chat. 

Later, Alice called the `remove` function removing Bob's public key from these arrays. After this point Bob cannot read or write anymore.

Eve was never part of the `_readers` array so she cannot read the content of the chat, nor write to it.

```ts
// Create and fund wallets
const alice = new Computer()
const bob = new Computer()
const eve = new Computer()
await alice.faucet(0.01e8)
await bob.faucet(0.01e8)

// Alice creates a chat with Bob and posts a message
const publicKeys = [alice.getPublicKey(), bob.getPublicKey()].sort()
const alicesChat = await alice.new(Chat, [publicKeys])

// Alice can post to the chat
await alicesChat.post('Hi')

// Bob can read the current state of the chat and post a message
const bobsChat = await bob.sync(alicesChat._rev) as Chat
await bobsChat.post('Yo')
expect(bobsChat.messages).deep.eq(['Hi', 'Yo'])

// Eve was not invited and can neither read nor write
try {
  // This line throws an error
  await eve.sync(alicesChat._rev)
  expect(true).eq(false)
} catch(err) {
  expect(err.message).not.undefined
}

// Alice removes Bob's public key from the _readers array
await alicesChat.remove(bob.getPublicKey())

// Now Bob cannot read the latest state of the chat anymore
try {
  // This line throws an error
  await bob.sync(alicesChat._rev)
  expect(true).eq(false)
} catch(err) {
  expect(err.message).not.undefined
}
```

## Swap

### Smart Contract

A swap is a class with a single static function that takes two smart objects as inputs and returns the same objects as outputs. The body of the function exchanges the owners of the object.

While this example uses NFTs, the same function can be used to swap any pair of smart objects.

```ts
class Swap extends Contract {
  static exec(nftA: NFT, nftB: NFT) {
    const [ownerA] = nftA._owners
    const [ownerB] = nftB._owners
    nftA.transfer(ownerB)
    nftB.transfer(ownerA)
    return [nftB, nftA]
  }
}
```

### Usage

The [`encode`](./API/encode.md) function is used to evaluate the `swap` function. The first arguments to the `encode` function is an expression containing both the code of the `Swap` class and the expression `Swap.exec(nftA, nftB)`. The second argument is an environment that determines that the smart objects corresponding to the names `nftA` and `nftB` are stored ar reviwions `nftA._rev` and `nftB._rev`. 

The `encode` function returns a transaction with two inputs and two outputs. Each input spends the outputs (`nftA._rev` and `nftB._rev`) representing the two NFTs that are arguments to the function. The two outputs represent the new state of the NFTs after the function call.

The `encode` function will automatically sign all inputs of the transaction that can be signed with the private key of the computer object on which the function is called. In this case, this is the input as revision `nftA._rev`.

Subsequently Bob signs the input `nftB._rev` and broadcasts the transaction, thereby executing the swap. After the transaction has been broadcast, the owners of the two NFTs are reversed.

```ts
// Create and fund the wallets
const alice = new Computer()
const bob = new Computer()
await alice.faucet(0.01e8)
await bob.faucet(0.001e8)

// Alice and Bob create one NFT each
const nftA = await alice.new(NFT, [alice.getPublicKey(), 'nftA'])
const nftB = await bob.new(NFT, [bob.getPublicKey(), 'nftB'])

// Alice builds a partially signed swap transaction
const { tx } = await alice.encode({
  exp: `${Swap} Swap.exec(nftA, nftB)`,
  env: { nftA: nftA._rev, nftB: nftB._rev },
})

// Bob signs and broadcasts the swap transaction
await bob.sign(tx)
await bob.broadcast(tx)
```

## Sell

In the previous example both smart objects as well as their owners had to be known before the swap transaction could be built. In this section we show how a sale offer can be built by a seller with needing to know the buyer in advance.

### Smart Contract

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

### Helper Class

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

### Usage

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
