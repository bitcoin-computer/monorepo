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

In addition lightning network researchers have worked on the problem that users need to be online in order to securely receive a payment. Watchtowers are third party services that monitor end users channels for suspicious activity and react accordingly. This allows users to be offline when receiving a payment, however it introduces a trusted third party. [More info](https://lightning.network/) 
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

### Sidechains

A sidechain is a separate blockchain linked to Bitcoin through a two-way peg. This allows the sidechain to have its own consensus mechanism, potentially increasing transaction throughput, enabling smart contracts, or enhancing privacy compared to Bitcoin.

A two-way peg typically operates as follows: A user sends their Bitcoin to a dedicated address (a.k.a. lockbox) and those tokens are locked on Bitcoin. The sidechain receives the locking information on Bitcoin and creates the corresponding value of tokens. Then, those tokens can be used by a sidechain user. Later, the user can transfer tokens back to Bitcoin, and the corresponding assets on the sidechain will be either locked or destroyed. An equivalent number of tokens will accordingly be unlocked on Bitcoin from the lockbox.

Two-way pegs can be centralized, federation based, or SPV-based. In centralized two-way pegs a trusted third party controls the Bitcoin and is responsible for locking and unlocking the Bitcoin. Federated two-way pegs are the improved version of centralized two-way pegs, in which a set of notaries control the lockbox, instead of the single entity. A common implementation is to use multisignature schemes, in which a quorum of participants signs a transaction. Simplified Payment Verification (SPV) makes it possible to verify the inclusion of a transaction in a blockchain without verifying the entire blockchain. A typical SPV two-way peg scheme would works as follows: The Bitcoin are sent to an address that can only be spent if an SPV proof is provided that the corresponding tokens have been burnt on the sidechain. 

Both centralized and federation based sidechains have the big disadvantage of introducing trusted third parties, defeating the purpose of a blockchain solution. SPV based solutions have the advantage of being trustless, however users have to wait for wait for lengthy confirmation periods. The second problem with sidechains is that the consensus mechanism of the sidechain is typically less secure than Bitcoin's, making it more vulnerable to attacks.

#### Examples

==- Liquid
Liquid Network is a federated two-way pegged sidechain, relying on the concept of strong federation. Originally, strong federations were designed to solve problems of latency, privacy, reliability, and fungibility. A strong federation consists of two independent entities: block signers and watchmen. Block signers maintain the consensus and advance the sidechain, while watchmen realize the cross-chain transactions by signing transactions on the mainchain. Liquid utilizes a multisignature scheme to sign each block transferred between mainchain and sidechains.

The federation consists of large exchanges, financial institutions, and Bitcoin-focused companies. While the identities of the federation members are not public, the system relies on the trust that at least two-thirds of the federation is acting honestly to ensure security. The federation also maintains the consensus of the sidechain by signing blocks in a round-robin fashion.

The sidechain Liquid is based on the Bitcoin codebase, however it has a 10x higher throughput due its block time of just one minute. Liquid supports the creation of on chain assets as well as enhanced privacy through confidential transactions. [More info](https://docs.liquid.net/docs/technical-overview).

==- Rootstock
RootStock (RSK) is a general-purpose smart contract platform where sidechains are pegged to the Bitcoin mainchain. RSK utilizes merged mining to provide incentives to miners who behave actively on the RSK platform. Meanwhile, RSK relies on a combination of a federated two-way peg and an SPV scheme. For the asset transfer, a token of “SmartBitcoins (SBTC)” is used to transfer, e.g., from the Bitcoin blockchain to the RSK sidechain. SBTC is essentially a Bitcoin natively on the RSK platform, and this platform can transfer coins back to the Bitcoin network within a specified duration. Each transfer requires a multi-signature to finish the transferring process, where the multi-signature is controlled by the RSK federation. Federation members use hardware security modules to protect their private keys and enforce transaction validation. [More info](https://rootstock.io/static/a79b27d4889409602174df4710102056/RS-whitepaper.pdf)
===

### Rollups

Like sidechains, rollups involve a secondary blockchain that is pegged to Bitcoin and transaction execution is moved to the secondary blockchain. However, unlike sidechains, the data from these transactions is not stored on a separate blockchain but is published on the main chain. 

Rollups execute batches of transactions outside the main blockchain, convert them into one single piece of data and submit it to the main blockchain. Rollups rely on smart contracts, hence they are mainly used in blockchain schemes that allow more flexibility in smart contracts such as Ethereum.

To use a rollup, users must transact with the rollup smart contract on the main chain, meaning they deposit funds through this contract. After the deposit, these funds can be used in layer-2 transactions. To perform a rollup transaction, a user sends a transaction to a distinguished user called an aggregator, which then selects a batch of rollup transactions, creates a layer-1 transaction and publishes it. The layer 1 transaction contains a compressed form of all relevant data from the transactions in the batch, together with the previous and new state root. Then, the rollup’s smart contract on the main chain assures the previous state root matches its current state root, and if so it switches the state root to the new state root. When users wish to redeem their deposit, they transact with the rollup’s smart contract and receive funds equal to the amount of their updated balance.

We next discuss the two major types of rollups: Optimistic rollups and Zero-knowledge rollups.

#### Optimistic Rollups

The main idea behind optimistic rollups is to assume transactions are valid. Optimistic rollups have two main entities participating: aggregators and verifiers. Once an aggregator publishes a transaction, there is a period of time when each node acting as a verifier can monitor data published by the aggregator. If the verifier disagrees with the published data, she can challenge the transaction. To discourage aggregators and verifiers from acting maliciously, both the aggregator and verifier need to stake a bond. If the verifier can provide a fraud proof, the aggregator is fined. Otherwise, the verifier gets fined. A verifier that can provide a fraud proof earns half of the aggregator’s bond while the other half is burned. This is done to prevent a scenario where the aggregator acts maliciously, an honest verifier challenges the transaction, and the aggregator (using a different address) challenges the transaction, too, executes before the honest verifier and thus manages to gain her bond back. We note that only one honest verifier is needed to guarantee that the aggregator did not act maliciously.

#### Zero-knowledge Rollups

While optimistic rollups use fraud proofs for security, Zero-Knowledge (ZK) rollups, and validity rollups more generally, use validity proofs. Instead of allowing the aggregator
to publish a transaction and then question it, in ZK rollups, the aggregator must prove the post-state root is the correct result of the batch execution using a validity proof.

Similarly to optimistic rollups, ZK rollups work with second layer nodes (i.e., aggregators) that aggregate transactions received on the layer two network. Upon reception of the transactions, the aggregator executes them. Then, it publishes to the main chain the new state root, the com- pressed data of the transactions, and a proof of validity. This proof of validity ensures the computation made to execute the transactions was correct (i.e., coherent inputs and outputs). This publication of data is done through function calls to a layer one smart contract. Such a contract verifies that the ZK proof is correct. If it is, then everything is recorded on the blockchain. If it is not, the transaction batch is rejected. In contrast to optimistic rollups, ZK rollups do not require second layer verifiers and there is no dispute resolution. This means transactions achieve finality rapidly; there is no extended period of time where verifiers can trigger a dispute phase.

The two most commonly used ZK proofs used for rollups are: 
* ZK-SNARKs (short for Zero-Knowledge Succinct Non-interactive Arguments of Knowledge). Zero-knowledge means that the input data needed for the computation does not have to be shared with the verifier for it to be convincing; succinct means that the size of the proof and the time needed to verify it grow slower than the time and size of the computation itself; non-interactive means that no back and forth interactions have to take place between the prover and the verifier.  Indeed, a prover is able to convince a verifier with a single message that a valid computation (i.e. executed with coherent inputs and outputs) has been made. Furthermore, this is achieved without the verifier having to make all of the computations themselves. However, ZK-SNARKs require a trusted setup for the initialization of a proof system, which implies a trusted third party.
* ZK-STARKs (short for Zero-Knowledge Scalable Transparent Arguments of Knowledge) require no trusted setup, yet produce much larger proofs and require more time for generation and verification

#### Optimistic vs ZK Rollups

Building a validity proof requires heavy computations; hence, ZK rollups’ offchain fees are higher than optimistic rollups. Additionally, a ZK rollup layer-1 transaction has a much higher fixed fee since it requires a validity proof verification hence gas fees are higher.

Though, since optimistic rollups have a period where verifiers have an opportunity to publish a fraud proof, the users need to wait (usually a week) until their deposits can be withdrawn, while in ZK-rollups, deposits can be withdrawn immediately.

Adoption of rollup technology is still low. On Bitcoin to the best of our knowledge, at the time of writing (Jul 2024), no rollup solution was operational on mainnet Bitcoin. On Ethereum, users have locked in about 3% of all Ethereum in rollups, with optimistic rollups accounting for about 3/4 of this amount.



#### Examples

==- BitVM
BitVM can be considered an optimistic rollups since transactions are assumed valid initially, and only disputed ones require proof on the main chain. It relies on a two-party system involving a "prover" and a "verifier." The prover executes the computation off-chain, while the verifier checks its validity using a challenge-response protocol. The prover commits a large program to a Taproot address, creating a commitment to the entire program. Both parties pre-sign a set of transactions that enable the challenge-response protocol. If the verifier disputes the prover's results, they can trigger a challenge transaction that forces the prover to reveal the necessary data to prove the computation's correctness. If the prover makes a false claim, the verifier can prove it on-chain, leading to penalties for the prover and ensuring the system's integrity.
 [More info](https://bitvm.org/)
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
* https://github.com/john-light/validity-rollups/blob/main/validity_rollups_on_bitcoin.md

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
[12] [Exploring Blockchains Interoperability: A Systematic Survey](https://www.researchgate.net/profile/Qin-Wang-84/publication/370286913_Evaluation_of_Contemporary_Smart_Contract_Analysis_Tools/links/64f9e2ec4c72a2514e5b9f14/Evaluation-of-Contemporary-Smart-Contract-Analysis-Tools.pdf)




