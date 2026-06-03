# Legal Notice

**Summary**: This software is free to use and modify under the [MIT License](./LICENSE.md) for its source code. The patented technology is currently available for use under open terms at no additional charge. Any on-chain value transfer when using direct on-chain storage methods consists solely of the minimal technical dust required by the chosen Bitcoin primitives (for on-chain data storage in the transaction output) plus compensation for the associated UTXO hygiene service. You are responsible for complying with all applicable laws and bear full liability for your use of the software. This software is a technical tool enabling users to write expressions, metadata, and objects directly into transactions on public blockchains; BCDB Inc. provides no custody, platform service, or financial services of any kind.

## Patent and Payment Notice

This software includes technology protected by U.S. Patent Nos. 11,188,911 and 11,694,197 (and related family members). These patents cover a protocol and method for implementing object-oriented smart contracts on UTXO-based blockchains by storing expressions and computation history in transactions and associating evaluated values with outputs.

The patented technology is currently free under open terms. When a user chooses a direct on-chain storage method (such as bare multisig outputs to store expressions or module code directly in transaction outputs), the creation of minimal non-dust metadata outputs is a technical necessity of that storage method. Bare multisig is used in part because it allows the full data (not merely a hash) to reside in the output of a single transaction. This provides better user experience and reliability in high-throughput environments (e.g., exchanges), where the two-transaction commit/reveal patterns required by taproot and similar standard output types (data stored in the spending input) can introduce unacceptable latency, mempool risks, or state inconsistency. (OP_RETURN cannot achieve equivalent single-transaction UX here: only one OP_RETURN is allowed per transaction and its size is strictly limited, precluding multiple metadata outputs or sufficient data sizes for expressions/modules in one tx.) These metadata outputs also carry the minimal satoshi value needed to enable the UTXO hygiene service (periodic consolidation by BCDB Inc. to keep the UTXO set from bloating indefinitely).

The amount of any such technical dust depends on the size of the on-chain metadata and the blockchain you select. For detailed information on costs, the precise scope of when hygiene dust outputs are generated, user choices to minimize on-chain data (and thus fees), the rationale for the current direct on-chain storage method, and how to independently verify transactions, please refer to the [Fees documentation](https://github.com/bitcoin-computer/monorepo/blob/main/packages/docs/fees.md) and [Tx Format documentation](https://github.com/bitcoin-computer/monorepo/blob/main/packages/docs/format.md). Users can verify the above by parsing the transactions using open source tools such as the widely used bitcoin-js library.

You may modify the software freely under the MIT License, but any use of the patented functionality, including in modified versions, requires compliance with the current open terms or obtaining an alternative license. Bypassing any required on-chain technical outputs while still using the patented technology may constitute patent infringement. For alternative licensing options, please contact clemens@bitcoincomputer.io.

You may use the software for free for testing purposes on testnet and regtest, as these environments use test coins with no real value. However, any use on mainnet or other production environments requires compliance with the terms outlined in this notice and the Fees documentation.

## Licensing

The patented technology (U.S. Patent Nos. 11,188,911 and 11,694,197 and related family members) is currently licensed for free under open terms for all uses, including open-source, personal, small-scale, and commercial use. We explicitly reserve the right to introduce paid commercial licensing terms in the future. If/when paid commercial terms are introduced, transactions, objects, and expressions created before 2026-06-15 will continue to use the prior (free/open) mechanism and terms (grandfathering). For questions or alternative licensing, please contact clemens@bitcoincomputer.io.

## Disclaimer Regarding User Modifications

**BCDB Does Not Endorse or Promote User Software Activity**. We are publishing certain portions of the Software, on an open-source basis, to demonstrate the utility of the Bitcoin Computer. As this Software is open-source, it may be modified and deployed for a wide range of uses that we may not have intended. We do not endorse or promote, and expressly disclaim liability for, any non-BCDB use or modification of the Software.

## Legal and Regulatory Compliance

**Sanctioned Users are Prohibited**. You may not access or use this software if you are (i) a resident of any country with which transactions or dealings are prohibited by governmental sanctions imposed by the U.S., the United Nations, the European Union, the United Kingdom, or any other applicable jurisdiction (collectively, “Sanctions Regimes”); (ii) a person, entity or government prohibited under an applicable Sanctions Regime (“Sanctioned Person”), including the Office of Foreign Assets Control, Specially Designated Nationals and Blocked Persons List; or (iii) prohibited from accessing or using the Software pursuant to the laws, rules, and regulations in the jurisdiction in which you reside or otherwise access and use the Software.

**Users Must Comply with Applicable Law**. You may only access or use the Software in compliance with laws, rules, and regulations in the jurisdiction in which you reside or otherwise access and use the Software, including, as applicable, Sanctions Regimes, anti-money laundering laws and regulations, securities laws and regulations (including U.S. Howey test considerations and the avoidance of common-enterprise or expectation-of-profits characteristics), and the upcoming California Digital Financial Asset Law (DFAL) and related regulatory requirements. This software is a technical development tool and does not constitute a financial service, platform, exchange, custodian, or offer of securities or investment contracts. Users themselves create and write expressions, metadata, and objects directly into transactions on public blockchains; BCDB Inc. does not take custody of user assets, operate a platform, or provide investment advice or opportunities. On-chain activity under the current model is framed strictly as the technical cost/necessity of the chosen direct on-chain storage method plus the UTXO hygiene service (see Fees documentation); it is not compensation for the patented technology itself (which remains free under open terms) and should not be viewed as an investment in BCDB Inc. or the protocol's future success.

Additionally, you are solely responsible for ensuring that your cryptocurrency transactions and on-chain object activity comply with all applicable laws in your jurisdiction, including anti-money laundering (AML), know-your-customer (KYC) where required, tax reporting, securities, and DFAL compliance. You bear full responsibility for any regulatory characterization of your use of this tool or any resulting on-chain objects or transactions.

## Liability Disclaimer and Indemnification

BCDB Inc. provides this software "as is," without any warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement. BCDB Inc. shall not be liable for any direct, indirect, incidental, special, exemplary, or consequential damages resulting from your use or modification of the software.

By using this software, you agree to indemnify, defend, and hold harmless BCDB Inc. and its affiliates from any claims, damages, liabilities, or expenses (including attorneys’ fees and costs) arising from your use or modification of the software, including but not limited to violations of applicable laws or infringement of third-party rights.

## Intellectual Property

The patented technology is protected under U.S. Patent Nos. 11,188,911 and 11,694,197 (and related family members). This patent protection applies in the United States only. If you are outside the US, you should review your local patent laws to understand any additional obligations.

## Contact Information

For questions, alternative licensing options, or further clarification, please contact clemens@bitcoincomputer.io.

Last updated: 2026-06-15
