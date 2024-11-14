---
order: 0
icon: image
---

# Non Fungible Token

## Smart Contract

Our example class for a non-fungible token only has two properties `name` and `symbol`. It has one function `transfer` that updates the `_owners` property.

```ts
class NFT extends Contract {
  constructor(name = '', symbol = '') {
    super({ name, symbol })
  }

  transfer(to: string) {
    this._owners = [to]
  }
}
```

## Usage

To create a non-fungible token you can call the [`new`](./API/new.md) function as shown below. The [`faucet`](./API/faucet.md) function funds the `sender` object when the `sender` object is configured to `regtest`. The `sender.new` function mints a new NFT and the `transfer` function send the NFT to another user.

```ts
// Create the sender wallet
const sender = new Computer()

// Fund the senders wallet
await sender.faucet(0.001e8)

// Create a new NFT
const nft = await sender.new(NFT, ['name', 'symbol'])

// Send the NFT
await nft.transfer(new Computer().getPublicKey())
```

If more than one NFT are broadcast one can save transaction fees by broadcasting a module containing the NFT smart contract first. The class `TCB721` is a helper class for that purpose.

```ts
// Create wallet
const sender = new Computer(RLTC)

// Fund wallet
await sender.faucet(0.001e8)

// Create helper object
const tokenHelper = new TokenHelper(sender)

// Deploy smart contract
await tokenHelper.deploy()

// Mint nft
nft = await tokenHelper.mint('name', 'symbol')

// Transfer NFT
await tokenHelper.transfer(nft._id, new Computer().getPublicKey())
```

## Code

You can find the code [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/TBC721#readme).
