---
order: -30
icon: arrow-switch
---

# Swaps

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

An expression containing both the code of the `Swap` class and the expression `Swap.exec(nftA, nftB)` is passed to the [`encode`](./API/encode.md) function. The second argument is an environment that determines that the smart objects corresponding to the names `nftA` and `nftB` are stored at revisions `nftA._rev` and `nftB._rev`. 

The return value is a transaction `tx` with two inputs and two outputs. The inputs spend the outputs `nftA._rev` and `nftB._rev` representing the two NFTs that are arguments to the function. The two outputs represent the new state of the NFTs after the function call.

The `encode` function will automatically sign all inputs of the transaction that can be signed with the private key of the computer object on which the function is called. In this case, this is the input as revision `nftA._rev`.

Subsequently Bob signs the input `nftB._rev` and broadcasts the transaction. When the transaction is included in the blockchain the swap is executed and the owners of the two NFTs are reversed.

#### Reducing Fees

The disadvantage of the code above is that the swap class is written into the blockchain on every swap. This wasts block space and is expensive. A more efficient approach is to deploy the `Swap` function as a module first and then refer to the module from the transactions executing the swap. To make this easier, we provide a helper class `SwapHelper` for swaps and `TBC721` for NFTs that can be used as follows:

```ts
// Alice creates helper objects
const tbc721A = new TBC721(alice)
const swapHelperA = new SwapHelper(alice)

// Alice deploys the smart contracts as modules
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

The basic swap described above has the disadvantage that it creates a smart object for the swap that is not useful after the swap was executed and that has to be paid for. To avoid creating the superfluous object in the first place a static function can be used as described next.

### Smart Contract

When the static `exec` is executed, a transaction is created that updates the two smart object in the arguments without creating an extra object. When the transaction is included in the blockchain the owners of the arguments are exchanged.


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

The usage is almost identical to the usage of the basic swap. The biggest difference is the expression encoded as shown below. See [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme) for details.

```ts
const tx = await computer.encode({
  exp: `${StaticSwap} StaticSwap.exec(a, b)`,
  env: { a: a._rev, b: b._rev },
})
```

## Swap using a Method

It is also possible to add a swap function to an NFT contract as shown below. Like the example of a static swap this avoids creating an useless smart object. 

### Smart Contract

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

### Usage

The usage is similar to above, see [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme) for details.
