---
order: -37
icon: diff
---

!!!
This section is under Construction
!!!

# Comparison

We compare the Bitcoin Computer to other smart contract systems for Bitcoin. We will call a system "Layer 1" if it stores all data on Bitcoin and "Layer 2" otherwise. We begin by reviewing Layer 2 systems, specifically state channels like the lightning network, interoperable blockchains like Stacks, sidechains like RSK, and finally Rollups like BitVM. In the second section we review Layer 1 systems like Ordinals, Runes and the Bitcoin Computer.

## Layer 2

### State Channels and Networks

State channels, originally designed to reduce fees and transaction times on blockchains, have recently found applications in building smart contract systems. These channels allow two parties to conduct transactions off-chain. Only the final agreed-upon state needs to be recorded on the blockchain. This enables an unlimited number of updates within a channel for a fixed cost (typically the opening and closing transactions).

While state channels work well between two users, they do not scale efficiently for large groups because creating channels between all users becomes uneconomical. To address this, channel networks have been developed. These networks use smart contracts called Hashed Timelock Contracts (HTLCs) to create chains of payment channels that securely forward payments, ensuring that intermediate nodes cannot steal the funds as long as users are online. This enables efficient hub-and-spoke architectures where a central hub forwards payments between users. One downside of this approach is that the hub is a central point of failure.

#### Examples

==- Lightning Network
The Lightning Network extends the hub-and-spoke model to a decentralized network of payment channels. The key challenge is solving the routing problem: to send a payment between two users, a path of channels must be determined where each channel has sufficient liquidity to forward the payment. To determine such a path, users must know the balances of each channel. If a user's knowledge of channel balances is outdated, the payment might fail. 

In addition lightning network researchers have worked on the problem that users need to be online in order to securely receive a payment. Watchtowers are thrid party services that monitor end users channels for spicious activity and react accordingly. This allows users to be offline when receiving a payment, however it introduces a trusted third party. [More info](https://lightning.network/) 
==- Ark
The ARK protocol is a layer-two solution designed for off-chain Bitcoin transactions, aiming to provide a low-cost, setup-free payment system. ARK relies on trusted intermediaries called ARK Service Providers (ASPs) to manage shared UTXOs. In ARK, transactions are conducted using virtual UTXOs (VTXOs), which are off-chain transaction outputs that can be converted into on-chain UTXOs when needed. Payments within ARK are coordinated by an ASP through periodic "rounds," where users exchange their VTXOs for new ones off-chain. Additionally, ARK offers out-of-round (OOR) payments for faster, direct transactions between parties. [More info](https://ark-protocol.org/)
==- RGB
The RGB protocol is a layer 2 protocol that enables smart contracts. It uses client-side validation but keeps all meta data outside of bitcoin transactions. RGB uses Bitcoin's transaction outputs as "single-use seals", ensuring that only the owner can modify the contract state. RGB uses specially-designed functional registry-based RISC virtual machine AluVM, which is Turing-equivalent (that is nearly computationally universal, bound by number of operation steps, measured by gas consumption in Ethereum-like systems, and by accumulated computational complexity measure in case of AluVM). RGB has a strong privacy-preserving emphasize, using modified form of Blockstream’s confidential transaction technology. [More info](https://docs.rgb.info/)
===

### Interoperable Blockchains

An interoperable blockchain is a separate blockchain that connects to Bitcoin in various ways, for example by being able to read and write data to Bitcoin from a smart contract in the other chain. In some cases, Bitcoin is used in the consensus of the interoperable blockchain.

#### Examples

==- Stacks
Stacks enables smart contracts and decentralized applications to use Bitcoin as an asset in a trust-minimized way and settle transactions on the Bitcoin blockchain. It has its own native asset called STX. The Stacks layer relies on STX and on BTC for its novel consensus mechanism, called Proof of Transfer (PoX). Stacks PoX miners spend (already mined) BTC and are rewarded in STX. PoX miners bid by spending BTC, and they have a bid-weighted random probability of becoming a leader. Leader election happens on the Bitcoin chain and new blocks are written on the Stacks layer. Anyone can be a Stacks miner, as long as they are willing to spend BTC. Also, any STX holder can lock their STX (called “stacking”) to participate in PoX consensus, and earn Bitcoin rewards for doing useful work for the system. The nature of PoX consensus is such that the price ratio between BTC and STX is continually recorded and available on-chain, serving as an on-chain Bitcoin price oracle. Stacks's smart contract language is a non-Turing complete language called Clarity. Developers can build any application using BTC as their asset/money and settling their transactions on the Bitcoin blockchain. [More info](https://docs.stacks.co/)
==- Internet Computer
Todo. [More info](https://internetcomputer.org/docs/current/developer-docs/getting-started/overview-of-icp)
===

### Side Chains

A sidechain is a separate blockchain linked to Bitcoin through a two-way peg. This allows the sidechain to have its own consensus mechanism, potentially increasing transaction throughput, enabling smart contracts, or enhancing privacy compared to Bitcoin's limitations.

To interact with the sidechain, users send Bitcoin to a federation-controlled address. Once confirmed, an equivalent amount of tokens is created on the sidechain for the user. These tokens grant access to the sidechain's functionalities. Users can then convert their sidechain tokens back to Bitcoin on the main chain using a peg-out mechanism.

However, sidechains are generally considered less secure than Bitcoin for two reasons. First, the consensus mechanism of the sidechain is typically less secure than Bitcoin's, making it more vulnerable to attacks. More importantly, the federation holds user assets on the main chain, introducing reliance on a trusted third party and a central point of failure.

#### Examples

==- Liquid
The Liquid sidechain, developed by Blockstream, connects to Bitcoin via a two-way peg. The peg is enforced through multisignature transactions and is maintained by a federation of large exchanges, financial institutions, and Bitcoin-focused companies. While the identities of the federation members are not public, the system relies on the trust that at least two-thirds of the federation is acting honestly to ensure security. The federation also maintains the consensus of the sidechain by signing blocks in a round-robin fashion.

Liquid is based on the Bitcoin codebase, however it has a 10x higher throughput due its block time of just one minute. Liquid supports the creation of on chain assets as well as enhanced privacy through confidential transactions. [More info](https://docs.liquid.net/docs/technical-overview).

==- Rootstock
RSK (Rootstock) is a smart contract platform that operates as a Bitcoin sidechain, aiming to bring Ethereum-compatible smart contract functionality to Bitcoin. RSK uses a two-way peg to link to Bitcoin, allowing BTC to be transferred to the RSK side chain where it is converted to "Smart Bitcoin" (RBTC). This RBTC is used to pay for transaction fees and execute smart contracts on the RSK platform. The RSK sidechain itself is based on the EVM

RSK employs a federated consensus model involving a group of pre-selected notaries who manage the peg and secure the network. It also integrates merge-mining, enabling Bitcoin miners to simultaneously mine both Bitcoin and RSK. [More info](https://rootstock.io/static/a79b27d4889409602174df4710102056/RS-whitepaper.pdf)
===

### Rollups

Rollups execute batches of transactions outside the main blockchain, convert them into one single piece of data and submit it to the main blockchain. [1]

#### Optimistic Rollups

*Optimistic rollups* assume transactions are valid. For a period of time, each user has the opportunity to challenge the transaction and, in such a case, must present a fraud proof. [1]

Optimistic rollups have two main entities participating: aggregators and verifiers. Once an aggregator publishes a transaction, there is a period of time when each node acting as a verifier can monitor data published by the aggregator. If the verifier disagrees with the published data, she can challenge the transaction. To discourage aggregators and verifiers from acting maliciously, both the aggregator and verifier need to stake a bond. If the verifier can provide a fraud proof, the aggregator is fined. Otherwise, the verifier gets fined. [...] Only one honest verifier is needed to guarantee that the aggregator did not act maliciously.[1]

#### Zero-knowledge Rollups

*Zero-knowledge rollups* do not assume fair play, and together with transaction data, the aggregator provides a validity proof. [1]

While optimistic rollups use fraud proofs for security, Zero-Knowledge (ZK) rollups use validity proofs. Instead of allowing the aggregator to publish a transaction and then question it, in ZK rollups, the aggregator must prove the post-state root is the correct result of the batch execution using a validity proof. 

#### Optimistic vs ZK Rollups

 Building
a validity proof requires heavy computations; hence, ZK rollups’ offchain fees are higher than optimistic rollups. Additionally, a ZK rollup layer-1 transaction has a much higher fixed fee since it requires a validity proof verification hence gas fees are higher. [1]

Though, since optimistic rollups have a period where verifiers have an opportunity to publish a fraud proof, the users need to wait (usually a week) until their deposits can be withdrawn, while in ZK-rollups, deposits can be withdrawn immediately. [1]

#### Examples

==- BitVM
Todo. [More info](https://bitvm.org/)
==- Citrea
Todo. [More info](https://docs.citrea.xyz/)
==- Alpen
Todo. [More info](https://www.alpenlabs.io/)
===

## Layer 1

Layer 1 smart contract systems generally label transactions with expressions. Users can evaluate these expressions and associate values with the outputs of the transactions. These protocols have the advantage that they inherit all the good properties of the underlying blockchain.

Therefore layer 1 smart contracts are mostly distinguished by the set of programs they can express. 

!!!
The Bitcoin Computer is to the best of our knowledge the only layer 1 smart contract system for Bitcoin that can express all computable programs.
!!!

#### Examples

==- EPOBC
[More info](https://github.com/chromaway/ngcccbase/wiki/EPOBC_simple)
==- CounterParty
[More info](https://docs.counterparty.io/docs/basics/what-is-counterparty/)
==- BRC20
[More info](https://domo-2.gitbook.io/brc-20-experiment)
==- Ordinals & Runes
[More info](https://docs.ordinals.com/)
==- Bitcoin Computer
[More info](https://docs.bitcoincomputer.io/)
===

## References
* https://www.bitcoinlayers.org/
* https://www.bitcoinrollups.io/
* https://www.hiro.so/blog/building-on-bitcoin-project-comparison
* https://www.hiro.so/

## Articles
[1] [SoK: Applications of Sketches and Rollups in Blockchain Networks](https://drive.google.com/file/d/1dJ2OsAc4QvIWzxR1JFFmMfMVYIrnXOWW/view), Arad Kotzer, Daniel Gandelman and Ori Rottenstreich; Technion, Florida State University<br />
[2] [Blockchain Scaling Using Rollups: A Comprehensive Survey](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9862815), Louis Tremblay Thibault, Tom Sarry, and Abdelhakim Senhaji Hafid; Montreal<br />
[3] [SoK: unraveling Bitcoin smart contracts](https://eprint.iacr.org/2018/192.pdf), Nicola Atzei, Massimo Bartoletti, Tiziana Cimoli, Stefano Lande, Roberto Zunino; Cagliari, Trento<br />
[4] [Beyond Bitcoin: A Review Study on the Diverse Future of Cryptocurrency](https://www.researchgate.net/publication/373825700_Beyond_Bitcoin_A_Review_Study_on_the_Diverse_Future_of_Cryptocurrency), Mohammed Faez Hasan, University of Kerbala<br />
[5] [BitML: A Calculus for Bitcoin Smart Contracts](https://eprint.iacr.org/2018/122.pdf), Massimo Bartoletti, Roberto Zunino; Cagliari, Trento<br />
[6] [An Overview of Smart Contract and Use cases in Blockchain Technology](https://www.researchgate.net/profile/Bhabendu-Mohanta/publication/328581609_An_Overview_of_Smart_Contract_and_Use_Cases_in_Blockchain_Technology/links/5bf398a592851c6b27cbfeac/An-Overview-of-Smart-Contract-and-Use-Cases-in-Blockchain-Technology.pdf), Bhabendu Kumar Mohanta, Soumyashree S Panda, Debasish Jena; IIIT Bhubaneswar<br />
[7] [Layer 2 Blockchain Scaling: a Survey](https://arxiv.org/pdf/2107.10881), Cosimo Sguanci, Roberto Spatafora, Andrea Mario Vergani; Polytechnico Milano<br />
[8] [A Rollup Comparison Framework](https://arxiv.org/pdf/2404.16150), Jan Gorzny, Martin Derka; Zircuit<br />
[9] [SoK: Decentralized Finance (DeFi)](https://dl.acm.org/doi/pdf/10.1145/3558535.3559780)<br />
[10] [SoK: Communication Across Distributed Ledgers](https://eprint.iacr.org/2019/1128.pdf)<br />
[11] [Colored Coins whitepaper](https://www.etoro.com/wp-content/uploads/2022/03/Colored-Coins-white-paper-Digital-Assets.pdf), Yoni Assia, Vitalik Buterin, liorhakiLior, Meni Rosenfeld, Rotem Lev<br />




