---
order: -30
icon: arrow-switch
---

# Token Swap

A token swap is the direct and immediate exchange of ownership of two tokens on the same chain. The swaps described below are atomic in the sense that either both assets change their owner or none of them. This enables trustless exchange, as the situation where the other party does not pay cannot arise.

A token swap is similar to an atomic swap, the difference being that atomic swaps usually refer to the exchange of cryptocurrency on two different chains, whereas token swaps exchange tokens on the same chain.

!!!
We note that the definition of a token swap differs wildly from the legal definition of a swap. While a token swap is the immediate exchange of two tokens, a swap in the legal sense involves an option to buy or sell an asset in the future.
!!!

## Swap Using a Static Function

You can build a swap as a static function that takes two arguments and exchanges their owners. This method preserves ordinal ranges, so it is safe to use this smart objects that contain ordinals.

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

A swap transaction has two inputs and two outputs. The inputs spend the NFTs to be swapped. The outputs are the NFTs after the swap with their owners exchanged. 

Alice passes an expression containing both the code of the `StaticSwap` class and the expression `StaticSwap.exec(a, b)` to the [`encode`](./API/encode.md) function. The second argument is an environment that determines that the values to be used for `a` and `b` are stored at revisions `a._rev` and `b._rev`. 

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

The disadvantage of the code above is that the swap class is written into the blockchain on every swap. This wasts block space and is expensive. A more efficient approach is to deploy the `Swap` function as a module first and then refer to the module from the transactions executing the swap. To make this easier, we provide a helper class [`SwapHelper`](https://github.com/bitcoin-computer/monorepo/blob/main/packages/swap/src/swap.ts) for swaps and `TBC721` for NFTs that can be used as follows:

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

## Code

Have a look at the code on  [Github](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme) for details.
