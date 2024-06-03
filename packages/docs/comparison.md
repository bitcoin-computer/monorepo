---
order: -37
icon: diff
visibility: hidden
---

# Comparison

## Layer 2

In layer-2 solutions, transactions are performed
out of the blockchain (layer-1) and can ultimately settle
back efficiently to the blockchain.

### Side Chains
* [Rootstock](https://dev.rootstock.io/)
* [Stacks](https://docs.stacks.co/)
* [Internet Computer](https://internetcomputer.org/docs/current/home)

### Payment Channel Networks
* [Ark](https://ark-protocol.org/)
* [RGB](https://docs.rgb.info/)

### Rollups

*Rollups* execute batches of transactions outside the main blockchain,
convert them into one single piece of data and submit it to the
main blockchain. [1]

#### Optimistic Rollups

*Optimistic rollups* assume transactions
are valid. For a period of time, each user has the opportunity
to challenge the transaction and, in such a case, must present a
fraud proof. [1]

Optimistic rollups have two main
entities participating: aggregators and verifiers. Once an
aggregator publishes a transaction, there is a period of
time when each node acting as a verifier can monitor data
published by the aggregator. If the verifier disagrees with
the published data, she can challenge the transaction. To
discourage aggregators and verifiers from acting maliciously,
both the aggregator and verifier need to stake a bond. If the
verifier can provide a fraud proof, the aggregator is fined.
Otherwise, the verifier gets fined. [...] Only one honest verifier is needed to guarantee that the
aggregator did not act maliciously.[1]

#### Zero-knowledge Rollups

*Zero-knowledge rollups* do not assume fair play, and together with transaction
data, the aggregator provides a validity proof. [1]

While optimistic rollups use fraud proofs
for security, Zero-Knowledge (ZK) rollups use validity
proofs. Instead of allowing the aggregator
to publish a transaction and then question it, in ZK
rollups, the aggregator must prove the post-state root is
the correct result of the batch execution using a validity
proof. 

#### Optimistic vs ZK Rollups

 Building
a validity proof requires heavy computations; hence, ZK
rollups’ offchain fees are higher than optimistic rollups. Additionally, a ZK rollup layer-1 transaction has a much
higher fixed fee since it requires a validity proof verification
hence gas fees are higher. [1]

Though, since optimistic rollups
have a period where verifiers have an opportunity to publish a
fraud proof, the users need to wait (usually a week) until their
deposits can be withdrawn, while in ZK-rollups, deposits can
be withdrawn immediately. [1]

* [BitVM](https://bitvm.org/) (is this L2?)
* [SatoshiVM](https://docs.satoshivm.io/)
* [BOB](https://docs.gobob.xyz/)
* [Citrea](https://docs.citrea.xyz/)
* [Alpen](https://www.alpenlabs.io/)
* [Merlin](https://docs.merlinchain.io/merlin-docs)
* [Dovi](https://dovil2.com/)

## Layer 1

### Miner Validated
* [Bitcoin Script]()

### Client Validated
* [EPOBC](https://github.com/chromaway/ngcccbase/wiki/EPOBC_simple)
* [CounterParty](https://docs.counterparty.io/docs/basics/what-is-counterparty/)
* [Ordinals](https://docs.ordinals.com/)
* [BRC20](https://domo-2.gitbook.io/brc-20-experiment)
* [Runes](https://docs.ordinals.com/runes.html)
* [Bitcoin Computer](https://docs.bitcoincomputer.io/)


## References

* https://www.bitcoinlayers.org/
* https://www.bitcoinrollups.io/
* https://www.hiro.so/blog/building-on-bitcoin-project-comparison
* https://www.hiro.so/

## Videos

[BitVM: Smarter Bitcoin Contracts - Robin Linus (zerosync)](https://www.youtube.com/live/VIg7BjX_lJw)

## Articles
[1] [SoK: Applications of Sketches and Rollups in Blockchain Networks](https://drive.google.com/file/d/1dJ2OsAc4QvIWzxR1JFFmMfMVYIrnXOWW/view), Arad Kotzer, Daniel Gandelman and Ori Rottenstreich; Technion, Florida State University
* [Blockchain Scaling Using Rollups: A Comprehensive Survey](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=9862815), LOUIS TREMBLAY THIBAULT, TOM SARRY, AND ABDELHAKIM SENHAJI HAFID; Montreal
* [SoK: unraveling Bitcoin smart contracts](https://eprint.iacr.org/2018/192.pdf), Nicola Atzei, Massimo Bartoletti, Tiziana Cimoli, Stefano Lande; Cagliari, Trento
Roberto Zunino
* [Beyond Bitcoin: A Review Study on the Diverse Future of Cryptocurrency](https://www.researchgate.net/publication/373825700_Beyond_Bitcoin_A_Review_Study_on_the_Diverse_Future_of_Cryptocurrency), Mohammed Faez Hasan, University of Kerbala
* [BitML: A Calculus for Bitcoin Smart Contracts](https://eprint.iacr.org/2018/122.pdf), Massimo Bartoletti, Roberto Zunino; Cagliari, Trento
* [An Overview of Smart Contract and Use cases in Blockchain Technology](https://www.researchgate.net/profile/Bhabendu-Mohanta/publication/328581609_An_Overview_of_Smart_Contract_and_Use_Cases_in_Blockchain_Technology/links/5bf398a592851c6b27cbfeac/An-Overview-of-Smart-Contract-and-Use-Cases-in-Blockchain-Technology.pdf), Bhabendu Kumar Mohanta, Soumyashree S Panda, Debasish Jena; IIIT Bhubaneswar
* [Layer 2 Blockchain Scaling: a Survey](https://arxiv.org/pdf/2107.10881), Cosimo Sguanci, Roberto Spatafora, Andrea Mario Vergani; Polytechnico Milano
* [A Rollup Comparison Framework](https://arxiv.org/pdf/2404.16150), Jan Gorzny, Martin Derka; Zircuit
* [SoK: Decentralized Finance (DeFi)](https://dl.acm.org/doi/pdf/10.1145/3558535.3559780)
* [SoK: Communication Across Distributed Ledgers](https://eprint.iacr.org/2019/1128.pdf)
* [Colored Coins whitepaper](https://www.etoro.com/wp-content/uploads/2022/03/Colored-Coins-white-paper-Digital-Assets.pdf), Yoni Assia, Vitalik Buterin, liorhakiLior, Meni Rosenfeld, Rotem Lev
* [BitSNARK & Grail - Bitcoin Rails for Unlimited Smart Contracts & Scalability](https://assets-global.website-files.com/661e3b1622f7c56970b07a4c/662a7a89ce097389c876db57_BitSNARK__Grail.pdf)
* [BitVMX: A CPU for Universal Computation on Bitcoin](https://bitvmx.org/files/bitvmx-whitepaper.pdf)



