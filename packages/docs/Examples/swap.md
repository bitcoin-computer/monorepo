---
order: -30
icon: arrow-switch
---

# Swaps

This page discusses different ways of building swaps.

## Swap using a Constructor

The simplest way to build a swap is to use a class whose constructor exchanges the owners of it's arguments.

### Smart Contract

```ts
export class Swap extends Contract {
  constructor(a: NFT, b: NFT) {
    super()
    const [ownerA] = a._owners
    const [ownerB] = b._owners
    a.transfer(ownerB)
    b.transfer(ownerA)
  }
}
```

While this example uses NFTs, the same function can be used to swap any pair of smart objects that have a transfer function.


### Usage

The code snippet below shows how to create two nfts and swap them using the smart contract above.

```ts
// Create and fund the wallets
const alice = new Computer()
const bob = new Computer()
await alice.faucet(0.01e8)
await bob.faucet(0.01e8)

// Alice and Bob create one NFT each
const nftA = await alice.new(NFT, ['a', 'AAA'])
const nftB = await bob.new(NFT, ['b', 'BBB'])

// Alice builds a partially signed swap transaction
const { tx } = await alice.encode({
  exp: `${Swap} new Swap(nftA, nftB)`,
  env: { nftA: nftA._rev, nftB: nftB._rev },
})

// Bob signs and broadcasts the swap transaction
await bob.sign(tx)
await bob.broadcast(tx)
```

The [`encode`](./API/encode.md) function is used to evaluate the `swap` function. The first arguments to the `encode` function is an expression containing both the code of the `Swap` class and the expression `Swap.exec(nftA, nftB)`. The second argument is an environment that determines that the smart objects corresponding to the names `nftA` and `nftB` are stored at revisions `nftA._rev` and `nftB._rev`. 

The return value is a transaction with two inputs and two outputs. Each input spends the outputs `nftA._rev` and `nftB._rev` representing the two NFTs that are arguments to the function. The two outputs represent the new state of the NFTs after the function call where the owners are swapped.

The `encode` function will automatically sign all inputs of the transaction that can be signed with the private key of the computer object on which the function is called. In this case, this is the input as revision `nftA._rev`.

Subsequently Bob signs the input `nftB._rev` and broadcasts the transaction, thereby executing the swap. After the transaction has been broadcast, the owners of the two NFTs are reversed.

#### Reducing Fees

The disadvantage of the code above is that the swap function is written into the blockchain on every swap. This wasts block space and is expensive. A more efficient approach is to deploy the `Swap` function as a module first and then refer to the module from the transactions executing the swap. To make this easier, we provide a helper class `SwapHelper`. It can be used as follows:

```ts
// Create and fund the wallets
const alice = new Computer()
const bob = new Computer()
await alice.faucet(0.01e8)
await bob.faucet(0.01e8)

// Alice creates helper objects
const tbc721A = new TBC721(alice)
const swapHelperA = new SwapHelper(alice)

// Alice deploys the smart contracts
await tbc721A.deploy()
await swapHelperA.deploy()

// Alice mints an NFT
nftA = await tbc721A.mint('a', 'AAA')

// Bob creates helper objects from the module specifiers
const tbc721B = new TBC721(bob, tbc721A.mod)
const swapHelperB = new SwapHelper(bob, swapHelperA.mod)

// Bob mints an NFT to pay for Alice's's NFT
nftB = await tbc721B.mint('b', 'BBB')

// Bob creates a swap transaction
const { tx } = await swapHelperB.createSwapTx(nftA, nftB)

// Alice checks the swap transaction
swapHelperA.checkSwapTx(tx, bob.getPublicKey(), alice.getPublicKey())

// Alice signs an broadcasts the transaction to execute the swap
await alice.sign(tx)
await alice.broadcast(tx)
```


## Swap using a Static Function

The basic swap described above has the disadvantage that it creates a smart object for the swap that is not useful after the swap was executed. When this smart object is created a UTXO is also created. As this UTXO has to be payed for by the user, it would be better to avoid creating the superfluous object in the first place.

### Smart Contract

This is possible by using a static function as shown below. When the `exec` function is executed, a transaction is created that updates the two smart object in the arguments without creating an extra object.


```ts
export class StaticSwap extends Contract {
  static exec(a: NFT, b: NFT) {
    const [ownerA] = a._owners
    const [ownerB] = b._owners
    a.transfer(ownerB)
    b.transfer(ownerA)
  }
}
```

### Usage

The usage is almost identical to the usage of the basic swap. See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme) for details.

## Swap using a Method

It is also possible to add a swap function to an NFT contract as shown below. Like the example of a static swap this avoids creating an useless smart object. 

### Smart Contract

```ts
class Swappable extends Contract {
  name: string
  symbol: string
  _id: string
  _rev: string
  _root: string
  _owners: string[]

  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }

  swap(b: NFT) {
    const [ownerA] = this._owners
    const [ownerB] = b._owners
    this.transfer(ownerB)
    b.transfer(ownerA)
  }
}
```


## Code

You can find the source code and the tests [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme).