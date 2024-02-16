---
order: -30
icon: arrow-switch
---

# Swap

## Smart Contract

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

## Usage

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