---
order: -30
icon: arrow-switch
---

# Token Swap

In this section we explain how to exchange to on-chain objects atomically. This means that either both assets change their owner or none of them.

A token swap is similar to an atomic swap, the difference being that atomic swaps usually refer to the exchange of cryptocurrency on two different chains, whereas token swaps exchange tokens on the same chain.

!!!
We note that the definition of a token swap differs wildly from the legal definition of a swap. While a token swap is the immediate exchange of two on-chain objects, a swap in the legal sense involves an option to buy or sell an asset in the future.
!!!

!!!success
This code preserves ordinal ranges and is safe to use this in smart objects that contain ordinals.
!!!

## Smart Contract

You can build a swap as a static function that takes two arguments and exchanges their owners.

```ts
export class NFT extends Contract {
  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}

export class Swap extends Contract {
  static exec(a: NFT, b: NFT) {
    const [ownerA] = a._owners
    const [ownerB] = b._owners

    a.transfer(ownerB)
    b.transfer(ownerA)
  }
}
```

## Usage

### Minting the NFTs

Alice and Bob mint NFTs using the `computer.new` function.

```ts
const a = await alice.new(NFT, ['A', 'AAA'])
const b = await bob.new(NFT, ['B', 'BBB'])
```

### Building the Swap Transaction

Alice can create a swap transaction as shown below. Such a transaction has two inputs and two outputs. The inputs spend the NFTs to be swapped. The outputs are the NFTs after the swap with their owners exchanged.

```ts
const { tx } = await alice.encode({
  exp: `${StaticSwap} Swap.exec(a, b)`,
  env: { a: a._rev, b: b._rev },
})
```

The `encode` function signs all inputs that can be signed with the private key of the object on which the function is called. In this case, this is the input that spends revision `a._rev`.

### Checking the Transaction

When Bob receives the transaction, he can decode it and inspect the state that would emerge on chain if he were to sign and broadcast the transaction.

```js
const { encode, decode } = bob.computer
const { exp, env } = await decode(tx)
const { effect } = await encode({ exp, env })

// The effect object contains objects a and b that precisely represent
// the state on chain after the transaction were broadcast
const { a, b } = effect.env

// Bob can check if the transaction creates the expected result
const notOk =
  exp !== 'new Swap(a, b)' || a._owners.toString() !== pubKeyB || b._owners.toString() !== pubKeyA
if (notOk) throw new Error()
```

### Executing the Swap

If Bob is happy with the transaction, he can execute the swap by signing and broadcasting the transaction.

```ts
await bob.sign(tx)
await bob.broadcast(tx)
```

### Full Example

The code snippet below shows how to create two nfts and swap them using the smart contract above.

```ts
import { Computer } from '@bitcoin-computer/lib'

// Create and fund Alice's wallet
const alice = new Computer()
await alice.faucet(0.01e8)

// Alice and Bob create one NFT each
const nftA = await alice.new(NFT, ['a', 'AAA'])
const nftB = await bob.new(NFT, ['b', 'BBB'])

// Alice builds a partially signed swap transaction
const { tx } = await alice.encode({
  exp: `${Swap} new Swap(nftA, nftB)`,
  env: { nftA: nftA._rev, nftB: nftB._rev },
})

// At this point Alice would send the partially signed
// transaction to Bob, who checks it
const bob = new Computer()
await bob.faucet(0.01e8)

const { encode, decode } = bob.computer
const { exp, env } = await decode(tx)
const { effect } = await encode({ exp, env })
const { a, b } = effect.env
const notOk =
  exp !== 'new Swap(a, b)' || a._owners.toString() !== pubKeyB || b._owners.toString() !== pubKeyA
if (notOk) throw new Error()

// Bob signs and broadcasts the transaction to execute the swap
await bob.sign(tx)
await bob.broadcast(tx)
```

## Code

Have a look at the code on [Github](https://github.com/bitcoin-computer/monorepo/tree/main/packages/swap#readme) for details.
