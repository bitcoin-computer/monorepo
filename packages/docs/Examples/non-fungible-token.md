---
order: 0
icon: image
---

# Non Fungible Token

## Smart Contract

A smart contract for an NFT is a class with two properties and one function to update the `_owners` property.

```ts
import { Contract } from '@bitcoin-computer/lib'

export class NFT extends Contract {
  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
```

## Usage

To create an on-chain object of class `NFT`, you can use the [`new`](./API/new.md) function of the `Computer` class. The [`faucet`](./API/faucet.md) function funds the `sender` object on `regtest`. The `sender.new` function mints a new NFT and the `transfer` function send the NFT to another user.

```ts
import { Computer } from '@bitcoin-computer/lib'
import { NFT } from './nft.js'

// Create the wallets
const sender = new Computer()
const receiver = new Computer()

// Fund the senders wallet
await sender.faucet(0.001e8)

// Create a new NFT
const nft = await sender.new(NFT, ['name', 'symbol'])

// Send the NFT
await nft.transfer(receiver.getPublicKey())
```

The transaction that is broadcast when `sender.new` is called contains the expression below.

```js
class NFT extends Contract {
  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
new NFT('name', 'symbol')
```

### The Module System

If many NFTs are created, it is wasteful to store the same JavaScript class in the blockchain multiple times. In this case, it is possible to use the module system to store the smart contract one time and refer to it multiple times.

```ts
import { Computer } from '@bitcoin-computer/lib'

// Create and fund wallet
const sender = new Computer()
await sender.faucet(0.001e8)

// Deploy smart contract
const mod = await sender.deploy(`export ${NFT}`)

// Mint nfts
const nft1 = await sender.new(NFT, ['name1', 'symbol'], mod)
const nft2 = await sender.new(NFT, ['name1', 'symbol'], mod)
...
```

In this case, each transaction encoding the minting of an NFT contains the module specifier (a transaction id and an output number) and the following expression.

```js
new NFT('name1', 'symbol')
```

## Code

You can find a slightly more elaborate implementation [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/TBC721#readme).
