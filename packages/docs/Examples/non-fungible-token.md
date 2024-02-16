---
order: 0
icon: image
---

# Non Fungible Token (NFT)

## Smart Contract

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

## Usage

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