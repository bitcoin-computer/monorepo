---
order: -37
icon: diff
---

# Comparison

We compare the Bitcoin Computer to other smart contract systems. We classify smart contract systems into "layer 1" and "layer 2", the distinction being that a layer 1 system communicate all data via the Bitcoin blockchain, whereas a layer 2 system makes use of some other storage device.

!!!
This section is under Construction
!!!

## Layer 2

### State Channels and Networks

<!-- Payment channels and networks do not enable smart contract on Bitcoin, however they use smart contracts to increase the throughput of Bitcoin. -->

State (and payment) channels and networks were first introduced to lower fees and increase throughput. However, as they have recently they have been used to build smart contract systems, we briefly cover them here.

State channels allow two users to exchange transactions off-chain of which only the last one needs to be broadcast. This makes it possible to update a payment an unlimited number of times while only having to pay a fixed number number of transaction fees. In most designs, users need to broadcast one transaction to open a channel and one transaction to close the channel and commit to the last payment.

To extend this design to an arbitrary number of users, state networks have been designed. Smart contracts called Hashed Timelock Contract (HTLCs) can be used to chain state channels, without requiring the intermediate nodes to obtain custody of the payment. This enables efficient hub and spoke architectures where a central hub can forward payments between users.

#### Examples

==- Lightning Network
The lightning network extends the hub and spoke model to a decentralized network of payment channels. The key challenge is to solve the routing problem: in order to send a payment between two users a path of channels needs to be determined where each channel has sufficient liquidity to forward the payment. Critics of the lightning network would argue that this problem is similar to the problem that scaling blockchains via payment channels seeks to solve to begin with. [More info](https://lightning.network/) 
==- Ark
Todo. [More info](https://ark-protocol.org/)
==- RGB
Todo. [More info](https://docs.rgb.info/)
===

### Side Chains

A sidechain is an independent blockchain that is tied to Bitcoin via a two-way-peg. The consensus of the side chain can differ from the consensus mechanism of Bitcoin, thereby potentially enhancing it's throughput, smart contract capabilities, or privacy.

To use the side chain a user can send Bitcoin to an address that is controlled by a federation. Once the Bitcoin is confirmed, the user is allowed to create an equivalent amount of tokens on the side chain. These token then can be used to access the enhanced functionality of the side chain. The user can use the peg-out mechanism to convert the coins on the sidechain back to tokens in the main chain.

#### Security Considerations

Side chains are less secure than Bitcoin for two reasons. The consensus mechanism of the side chain is typically less secure than the consensus of Bitcoin. This enable attackers to exploit the side chain consensus. On the other hand the 

#### Examples

==- Liquid
* The federation consists of a fixed group of members that is defined at launch. The identities of its members is not public, however it is stated that they are large exchanges, financial institutions, and Bitcoin-focused companies. 
* Developed by Blockstream
* The peg is enforced by means of ordinary multisignature transactions. It does require a consortium to exist, and for participants of the system to trust that at least 2/3 of the federation is acting honestly.
* The federation members also maintain the consensus of the side chain by signing blocks in a round robin fashion.
* The Liquid side chain is based on the Bitcoin code base. However, it's throughput is 10x higher than Bitcoin's throughput as the block time was reduced to 1 minute.
* Liquid allows for users to create and transfer other assets using a feature called Issued Assets. 
* One of the main features of Liquid is its default use of Confidential Transactions. Confidential Transactions on Liquid allows any two parties to transact without anyone else being able to view the asset and amount transacted, not even the Liquid Federation members and functionaries. [More info](https://docs.liquid.net/docs/technical-overview).
==- Rootstock
Todo. [More info](https://rootstock.io/static/a79b27d4889409602174df4710102056/RS-whitepaper.pdf)
==- Stacks
Todo. [More info](https://docs.stacks.co/)
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




