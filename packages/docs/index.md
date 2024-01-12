---
layout: page
---

![](/static/bitcoin-computer@1x.png)
# Introduction

The Bitcoin Computer (TBC) is a Turing-complete smart contract system for Bitcoin and Litecoin. It allows you to build decentralized applications, such as tokens, exchanges, games, social networks, and more.

It's most important feature is that the execution cost is independent of the computational complexity of the algorithm. For most other smart contract systems the cost of execution increases with each computational step. Instead the cost on TBC is fixed regardless of the number of computational steps.

Smart contracts are Javascript or Typescript classes. This makes it easy to get started, and makes it easy to integrate smart contracts into web applications.

High level it works as follows: You inscribe a Javascript class to deploy a smart contract. Then you can inscribe a constructor call to create a smart object and a function call to update a smart object. 

Conceptually a smart object is stored in a UTXO and only the owner of the UTXO can update its state. This captures a natural notion of data ownership that is as secure as ownership of Bitcoin.

As every update to a smart object is recorded in a separate transaction, every historical state of a smart object can be recovered, together with information about who updated it and when.

By default every user can read all states of all smart object. However, TBC also has support for encryption built. In addition TBC has support for storing data off-chain. These two properties make it easy to build applications that comply with consumer protection laws such as CCPA and GDPR.

Finally, TBC relies purely on Bitcoin. It does not require a side-chain or an extra token. It is built in a way such that users execute smart contracts client side, not operators server side.

## Contact

TBC is being developped by BCDB Inc. If you have any questions, please let us know in our <a href="https://t.me/thebitcoincomputer">Telegram group</a>, on <a href="https://twitter.com/TheBitcoinToken">Twitter</a>, or by email clemens@bitcoincomputer.io.
