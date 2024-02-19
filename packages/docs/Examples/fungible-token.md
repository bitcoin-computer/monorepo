---
order: -60
---

# Fungible Token

We explore how ERC20 style fungible token contracts can be built on Bitcoin. The ``TBC20`` class implements the interface described in [EIP20](https://eips.ethereum.org/EIPS/eip-20).

We use two classes: a ``TokenBag`` encapsulates the minimal amount of data that needs to be stored on the blockchain. A token bag can be thought of as the equivalent to unspent transaction output (utxo) in the token world: while a utxo stores a number of satoshi, a token bag stores a number of tokens. The ``ERC20`` class helps manage multiple token bags, in the same way that a wallet deals with multiple unspent outputs.

## Token Bag

The constructor of the ``TokenBag`` class initializes a new token bag with a number of tokens and an initial owner. It also sets a ``name`` and a ``symbol`` for the token bag.

The ``transfer`` function checks if there are sufficiently many tokens to send the amount. It throws an error if insufficient funds are detected. Otherwise, it decrements the number of tokens in the current bag by ``amount`` and creates a new smart object of type ``TokenBag`` that is owned by the recipient and stores the ``amount`` many tokens.

```js
export class TokenBag {
  tokens: number
  name: string
  symbol: string
  _owners: string[]

  constructor(to: string, supply: number, name = '', symbol = '') {
    this._owners = [to]
    this.tokens = supply
    this.name = name
    this.symbol = symbol
  }

  transfer(to: string, amount: number): TokenBag {
    if (this.tokens < amount) throw new Error()
    this.tokens -= amount
    return new TokenBag(to, amount, this.name, this.symbol)
  }
}
```

We note that calls to the ``transfer`` function do not change the overall number of tokens: when a new token bag with a number of tokens is created, that same number of tokens is removed from another object (the object on which the ``transfer`` function is called).

This is because all function calls on the Bitcoin Computer are [atomic](https://en.m.wikipedia.org/wiki/Atomicity_(database_systems)) in the sense that either all instructions in a function are evaluated or none of them.

## Adding Approval

Approval is a mechanism in of the [ERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol) contract where a user called ``spender`` is granted the right to spend certain number of tokens of the original owner.

We add two properties ``approvals`` and ``originalOwner`` to the ``TokenBag`` class and two methods ``approve`` and ``disapprove`` to grant and revoke approval. For now, these methods work on an all or nothing bases for all tokens in the bag.

```js #12-13,16-22,24-30
export class TokenBag {
  tokens: number
  name: string
  symbol: string
  _owners: string[]

  constructor(to: string, supply: number, name = '', symbol = '') {
    this._owners = [to]
    this.tokens = supply
    this.name = name
    this.symbol = symbol
    this.approvals = []
    this.originalOwner = to
  }

  approve(spender: PublicKey) {
    if(this.originalOwners.includes(spender))
      throw new Error('Cannot approve original owner.')

    this.approvals.push(spender)
    this._owners.push(spender)
  }

  disapprove(spender: PublicKey, amount: number) {
    if(this.originalOwners.includes(spender))
      throw new Error('Cannot disapprove original owner.')

    this._owners = this._owners.filter(owner => owner !== spender)
    this.approvals = this.approvals.filter(owner => owner !== spender)
  }

  transfer(to: string, amount: number): TokenBag {
    if (this.tokens < amount) throw new Error()
    this.tokens -= amount
    return new TokenBag(to, amount, this.name, this.symbol)
  }
}
```

## TBC20

In general, each user will own several token bags, in the same way that users generally own multiple unspent outputs. The ``TBC20`` class adds functionality for sending tokens from multiple bags and for computing their balance across multiple bags. This is similar to the functionality of a traditional Bitcoin [wallet](wallet.md).

```js
import { Computer } from 'bitcoin-computer-lib'
import { TokenBag } from './token-bag'

export class TBC20 {
  name: string
  symbol: string
  computer: Computer
  mintId: string

  constructor(name: string, symbol: string, computer: Computer, mintId?: string) {
    this.name = name
    this.symbol = symbol
    this.computer = computer
    this.mintId = mintId
  }

  async mint(publicKey: string, amount: number) {
    const args = [publicKey, amount, this.name, this.symbol]
    const tokenBag = await this.computer.new(TokenBag, args)
    return this.mintId = tokenBag._root
  }

  async totalSupply(): Promise<number> {
    if(!this.mintId) throw new Error('Please set a mint id.')
    const rootBag = await this.computer.sync(this.mintId)
    return rootBag.tokens
  }

  async getBags(publicKey): Promise<TokenBag[]> {
    if (!this.mintId) throw new Error('Please set a mint id.')
    const query = { publicKey, contract: TokenBag }
    const revs = await this.computer.queryRevs(query)
    const bags = await Promise.all(revs.map(
      async rev => this.computer.sync(rev)
    ))
    return bags.flatMap(
      bag => bag._root === this.mintId ? [bag] : []
    )
  }

  async balanceOf(publicKey: string): Promise<number> {
    const bags = await this.getBags(publicKey)
    return bags.reduce((prev, curr) => prev + curr.tokens, 0)
  }

  async transfer(to: string, amount: number) {
    const owner = this.computer.db.wallet.getPublicKey().toString()
    const bags = await this.getBags(owner)
    while (amount > 0) {
      const [bag] = bags.splice(0, 1)
      const available = Math.min(amount, bag.tokens)
      await bag.transfer(to, available)
      amount -= bag.tokens
    }
    if (amount > 0)
      throw ('Could not send entire amount')
  }
}
```

There is plenty of room for improvement with this class: one issue is that when a payment is made from multiple bags, all payments are sent in separate transactions. In addition, the running time can be vastly improved through the use of caching. Both issues can be solved at the smart contract level and do not require any changes to the Bitcoin Computer.

!!!
Check out a working version of the [TBC20](https://github.com/bitcoin-computer/monorepo/tree/main/packages/TBC20) contract and a [TBC20-app](https://github.com/bitcoin-computer/monorepo/tree/main/packages/TBC721-app).
!!!
