---
order: -30
icon: arrow-switch
---

# Swaps

## Swap Using a Static Function

The recommended way to build a swap is to use a static function that takes two arguments and exchanges their owners. This method preserves ordinal ranges, so it is safe to use this smart objects that contain ordinals.

### Smart Contracts

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
The code below shows the `NFT` class. While this example uses NFTs as arguments, the same function can be used to swap any pair of smart objects that have a `transfer` function. 

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

### Minting the NFTs

Alice and Bob mint NFTs using the `computer.new` function.

```ts
const a = await alice.new(NFT, ['A', 'AAA'])
const b = await alice.new(NFT, ['B', 'BBB'])
```

### Building the Swap Transaction

A swap transaction has two inputs and two outputs. The inputs spend the NFTs to be swapped. The two outputs of the transaction are the NFTs after the swap with their owners exchanged. 

Alice passes an expression containing both the code of the `StaticSwap` class and the expression `StaticSwap.exec(a, b)` to the [`encode`](./API/encode.md) function. The second argument is an environment that determines that the smart objects `a` and `b` are stored at revisions `a._rev` and `b._rev`. 

```ts
const { tx } = await alice.encode({
  exp: `${StaticSwap} StaticSwap.exec(a, b)`,
  env: { a: a._rev, b: b._rev },
})
```

The `encode` function will automatically sign all inputs of the transaction that can be signed with the private key of the computer object on which the function is called. In this case, this is the input as revision `a._rev`.

### Executing the Swap

Then Bob signs the input `b._rev` and broadcasts the transaction. When the transaction is included in the blockchain the swap is executed and the owners of the two NFTs are reversed.

```ts
await bob.sign(tx)
await bob.broadcast(tx)
```

### Full Example

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

#### Reducing Fees

The disadvantage of the code above is that the swap class is written into the blockchain on every swap. This wasts block space and is expensive. A more efficient approach is to deploy the `Swap` function as a module first and then refer to the module from the transactions executing the swap. To make this easier, we provide a helper class `SwapHelper` for swaps and `TBC721` for NFTs that can be used as follows:

```ts
// Alice creates helper objects
const tbc721A = new TBC721(alice)
const swapHelperA = new StaticSwapHelper(alice)

// Alice deploys the smart contracts
await tbc721A.deploy()
await swapHelperA.deploy()

// Alice mints an NFT
nftA = await tbc721A.mint('a', 'AAA')

// Bob creates helper objects from the module specifiers
const tbc721B = new TBC721(bob, tbc721A.mod)
const swapHelperB = new StaticSwapHelper(bob, swapHelperA.mod)

// Bob mints an NFT to pay for Alice's's NFT
nftB = await tbc721B.mint('b', 'BBB')

// Bob creates a swap transaction
const { tx } = await swapHelperB.createSwapTx(nftA, nftB)

// Alice checks the swap transaction
await swapHelperA.checkSwapTx(tx, alice.getPublicKey(), bob.getPublicKey())

// Alice signs an broadcasts the transaction to execute the swap
await alice.sign(tx)
await alice.broadcast(tx)
```

## Swap Using a Method

Another possibility is to add a swap function directly to an `NFT`. The use is similar to above.

```ts
class Swappable extends Contract {
  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }

  swap(that: NFT) {
    const [thisOwner] = this._owners
    const [thatOwner] = that._owners
    this.transfer(thatOwner)
    that.transfer(thisOwner)
  }
}
```

### Swap Using a Constructor

We don't recommend this method because it creates an extra output for the swap itself.

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


## Code

Have a look at the code on  [Github](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme) for details.
