---
layout: page
---

![](/static/bitcoin-computer@1x.png)

# Introduction

The Bitcoin Computer is a Turing-complete metaprotocol for UTXO-Based Blockchains, designed for creating decentralized applications in Bitcoin, Litecoin and compatible blockchains like Dogecoin and Pepecoin (Bitcoin Cash coming soon). You can create tokens, exchanges, games, social networks, and more.

**Free Computation.** A key feature of the Bitcoin Computer is that execution costs do not depend on the computational complexity of the smart contract itself. Unlike other systems where costs escalate with computational intensity, the Bitcoin Computer maintains a fixed cost for an unlimited number of computational steps.

**JavaScript and TypeScript Support.** Smart contracts are built using JavaScript or TypeScript classes, ensuring fluid integration with web applications. This compatibility leverages the robust JavaScript ecosystem, simplifying development and enhancing functionality.

**How it works.** To deploy a smart contract, simply inscribe a JavaScript class. You can then instantiate your smart contract by inscribing a constructor call, creating a “smart object”. Updates to this object are managed through subsequent inscribed function calls, enabling dynamic interactions within your application.

**Data Ownership.** Each smart object resides within a UTXO (Unspent Transaction Output). The owner of the UTXO is the only entity authorized to modify the object’s state, reflecting a natural approach to data ownership that mirrors the security associated with Bitcoin transactions.

**Historical States.** Every transaction on the Bitcoin Computer records an update, allowing for the recovery of every historical state of a smart object. This history includes details on who made updates and when, providing a comprehensive audit trail for each object.

**Encryption and Off Chain Storage.** By default, every user can read the states of smart objects on the Bitcoin Computer. However, the platform includes built-in support for end-to-end encryption and off-chain data storage. These features facilitate the development of applications that adhere to consumer protection regulations such as the CCPA and GDPR, ensuring both security and compliance.

**Pure Bitcoin.** Finally, this framework relies only on Bitcoin. It does not require a side-chain or an extra token. This makes it possible to build applications that are as trustless as Bitcoin.

**Contact.** The Bitcoin Computer is being developed by BCDB Inc. If you have any questions, please let us know in our [Telegram group](https://t.me/thebitcoincomputer), on [Twitter](https://twitter.com/TheBitcoinToken), or by email at clemens@bitcoincomputer.io.
