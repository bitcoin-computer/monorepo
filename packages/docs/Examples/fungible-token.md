---
order: -10
icon: circle
---

# Fungible Token

## Smart Contract

A fungible token is stored and transferred in a similar way to how satoshis are stored and transferred in Bitcoin. Its current state is stored in a set of UTXOs. When tokens are transferred a utxo is spent and two new UTXOs are created: one containing the amount sent and one containing the change.

The `transfer` function checks if the current on-chain object contains a sufficient number of tokens and throws an error if not. If sufficient, the supply of the current on-chain object is reduced by the amount to be sent. A new on-chain object, owned by the recipient and containing the sent amount, is created and returned.

```typescript
import { Contract } from '@bitcoin-computer/lib'

class Token extends Contract {
  amount: number
  symbol: string
  _owners: string[]

  constructor(to: string, amount: number, symbol: string) {
    super({ _owners: [to], amount, symbol })
  }

  transfer(recipient: string, amount: number) {
    if (this.amount < amount) throw new Error()

    this.amount -= amount
    return new Token(recipient, amount, this.symbol)
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
const token = await sender.new(Token, [sender.getPublicKey(), 10, 'SYM'])

// Send 2 tokens to receiver
const sentToken = await token.transfer(receiver.getPublicKey(), 2)

// SentToken will have supply of 2 and token will have a supply of 8
expect(token.amount).eq(8)
expect(sentToken.amount).eq(2)
```

## Code

You can find the code [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/TBC20#readme).
