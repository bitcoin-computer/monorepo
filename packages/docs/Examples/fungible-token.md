---
order: -10
icon: circle
---

# Fungible Token

## Smart Contract

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

## Usage

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

## Code

You can find the code [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/TBC20#readme).

