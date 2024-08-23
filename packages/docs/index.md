---
layout: page
---

![](/static/bitcoin-computer@1x.png)

# Introduction

The Bitcoin Computer (TBC) is a Turing-complete smart contract system for Bitcoin and Litecoin, designed for creating decentralized applications. With TBC, you can create tokens, exchanges, games, social networks, and more.

**Free Computation.** A key feature of TBC is that execution costs do not depend on the computational complexity of the smart contract itself. Unlike other systems where costs escalate with computational intensity, TBC maintains a fixed cost for an unlimited number of computational steps.

**JavaScript and TypeScript Support.** Smart contracts on TBC are built using JavaScript or TypeScript classes, ensuring fluid integration with web applications. This compatibility leverages the robust JavaScript ecosystem, simplifying development and enhancing functionality.

**How it works.** To deploy a smart contract on TBC, simply inscribe a JavaScript class. You can then instantiate your smart contract by inscribing a constructor call, creating a “smart object”. Updates to this object are managed through subsequent inscribed function calls, enabling dynamic interactions within your application.


**Data Ownership.** In TBC, each smart object resides within a UTXO (Unspent Transaction Output). The owner of the UTXO is the only entity authorized to modify the object’s state, reflecting a natural approach to data ownership that mirrors the security associated with Bitcoin transactions.

**Historical States.** Every transaction on TBC records an update, allowing for the recovery of every historical state of a smart object. This history includes details on who made updates and when, providing a comprehensive audit trail for each object.

**Encryption and Off Chain Storage.** By default, every user can read the states of smart objects on TBC. However, the platform includes built-in support for end-to-end encryption and off-chain data storage. These features facilitate the development of applications that adhere to consumer protection regulations such as the CCPA and GDPR, ensuring both security and compliance.

**Pure Bitcoin.** Finally, TBC relies only on Bitcoin. It does not require a side-chain or an extra token. This makes it possible to build applications that are as trustless as Bitcoin.

**Contact.** TBC is being developed by BCDB Inc. If you have any questions, please let us know in our [Telegram group](https://t.me/thebitcoincomputer), on [Twitter](https://twitter.com/TheBitcoinToken), or by email at clemens@bitcoincomputer.io.
