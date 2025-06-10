---
order: -50
visibility: hidden
---

# Ordinals

!!!
Ordinal support is still experimental.
!!!

[Ordinals](https://github.com/casey/ord/blob/master/bip.mediawiki) is a scheme for assigning names to satoshis. These names can be linked to digital assets to make them transferrable.

There is an important special case where the two protocol coincide: Recall that an output is a "memory update" if its index is smaller than the number of inputs of the transaction. We call a memory update _conservative_ if it stores the same amount of satoshis as the output that it spends. Conservative updates preserve ordinal ranges.

A Bitcoin Computer smart contract that does not use the `_satoshis` keyword only produces conservative updates. Therefore a smart objects defined by such smart contracts preserve ordinal ranges.

## Example

For example consider an NFT contract:

```js
class NFT extends Contract {
  constructor() {
    super({ data: img })
  }

  send(to) {
    this._owners = [to]
  }
}
```

If you create an NFT it will be stored in an output and that output is identified by the revision of the smart object. Say that output contains ordinals 5-10 (we are assuming some `OrdinalsApi` that can return the ordinals stores in a specified output).

```js
const nft = await computer.new(NFT)
const oldOrdinals = await OrdinalsApi.getOrdsFromOutput(nft._rev)
expect(oldOrdinals).to.deep.eq([5, 6, 7, 8, 9, 10])
```

If we send the NFT it will get a new revision assigned. The important thing is that the new revision will have exactly the same ordinal range.

```js
await nft.send(...)
const newOrdinals = await OrdinalsApi.getOrdsFromOutput(nft._rev)
expect(newOrdinals).to.deep.eq([5, 6, 7, 8, 9, 10])
```

Therefore you can build smart contracts like swaps that cannot be built with ordinals alone. You can store ordinals inside a smart object, pass them around in smart contracts and safely recover them, for example after they have been exchanged.

!!!
It is important to note that ordinal ranges are only preserved in smart contracts that do not use the `_satoshis` keyword.
!!!
