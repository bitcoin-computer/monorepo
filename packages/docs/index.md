---
layout: page
---

![](/static/bitcoin-computer@1x.png)
# Introduction

The Bitcoin Computer (TBC) is a Turing-complete smart contract system for Bitcoin and Litecoin. You can build decentralized applications, such as tokens, exchanges, games, social networks, and more.

**Free Computation.** The most important feature of TBC is that the execution cost is independent of the computational complexity of the smart contract. For most other smart contract systems, the execution cost increases with each computational step. Instead, the cost on TBC is fixed for an unlimited number of computational steps.

**Javascript.** Smart contracts are JavaScript or TypeScript classes. This makes it seamless to integrate smart contracts into web applications and makes development easy due to the existing Javascript ecosystem.

**How it works.** You can inscribe a JavaScript class to deploy a smart contract. Then, you can inscribe a constructor call to create a smart object and a function call to update a smart object.

**Data Ownership.** Conceptually, a smart object is stored in a UTXO, and only the owner of the UTXO can update its state. This captures a natural notion of data ownership that is as secure as ownership of Bitcoin.

**Historical States.** As every update to a smart object is recorded in a separate transaction, every historical state of a smart object can be recovered, together with information about who updated it and when.

**Encryption and Off Chain Storage.** By default, every user can read all states of all smart objects. However, TBC also has support for encryption and storing data off-chain built in. These properties make it easy to build applications that comply with consumer protection laws such as CCPA and GDPR.

**Pure Bitcoin.** Finally, TBC relies only on Bitcoin. It does not require a side-chain or an extra token. This makes it possible to build applications that are as stable as Bitcoin.

**Contact.** TBC is being developed by BCDB Inc. If you have any questions, please let us know in our [Telegram group](https://t.me/thebitcoincomputer), on [Twitter](https://twitter.com/TheBitcoinToken), or by email at clemens@bitcoincomputer.io.
