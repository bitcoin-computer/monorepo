# Making Bitcoin Source Chain Agnostic

Currently, Bitcoin Token uses the following classes from Bitcoin Source:

[Address](/src/address.js), [PublicKey](/src/publickey.js), [PrivateKey](/src/privatekey.js), [HDPrivateKey](/src/hdprivatekey.js), [Mnemonic](/src/mnemonic/mnemonic.js)  
[Signature](/src/transaction/signature.js), [Script](/src/script/script.js), [Opcode](/src/opcode.js), [Transaction](/src/transaction/transaction.js), [Output](/src/transaction/output.js), [Input](/src/transaction/input/input.js), [MultiSigScriptHash](/src/transaction/input/multisigscripthash.js), [PublicKeyHashInput](/src/transaction/input/publickeyhash.js), [MultiSigScriptHashInput](/src/transaction/input/multisigscripthash.js)

# Goal

Our goal is to make Bitcoin Token work on different chains. To make that possible, we want to turn Bitcoin Source into a minimal library that can do the following:

| Task                                 | Priority | BCH | BSV | BTC |
| ------------------------------------ | -------- | --- | --- | --- |
| Build and sign p2pkh tx              | high     | ?   | ?   | ?   |
| Build and sign p2sh tx               | high     | ?   | ?   | ?   |
| Compute tx id                        | high     | ?   | ?   | ?   |
| Create addresses from keys           | high     | ?   | ?   | ?   |
| Create keys from mnemonics           | high     | ?   | ?   | ?   |
| Derive keys from other HD keys       | high     | ?   | ?   | ?   |
| Test transaction fromHex and toHex   | high     | ?   | ?   | ?   |
| Tests to broadcast tx on regtest net | medium   | ?   | ?   | ?   |
| Test block fromHex and toHex         | medium   | ?   | ?   | ?   |
| Test merkleblock fromHex and toHex   | medium   | ?   | ?   | ?   |

# Research

| Task                                                                | Priority | BCH                          | BSV                              | BTC              |
| ------------------------------------------------------------------- | -------- | ---------------------------- | -------------------------------- | ---------------- |
| Research transaction format differences                             |          | ?                            | ?                                | SegWit           |
| Research block size differences                                     |          | ?                            | ?                                | ?                |
| Research block format differences                                   |          | CTOR                         | TTOR                             | TTOR             |
| Data Carrier Size for OP_RETURN outputs                             |          | 223+ (large OR mined)        | 100,000                          | 80               |
| Max non-push operations per script (MAX_OPS_PER_SCRIPT)             |          | 201                          | 500                              | 201              |
| Research script opcode differences (op_datasigverify, …)            |          | Monolithic + DSV             | Monolithic + MUL+L/RSHIFT+INVERT | None Re-enabled  |
| Research other script differences (clean stack, pushdata only rule) |          | ?                            | ?                                | ?                |
| Chained Transaction Limit                                           |          | 25                           | 25                               | 25               |
| Research differences in p2p protocol (network magic, …)             |          | ?                            | ?                                | ?                |
| Research address differences                                        |          | CashAddr (default), Original | Original (default), CashAddr     | Original, SegWit |
| Research if there are other chain differences                       |          | ?                            | ?                                | ?                |

For reference, here are links to the projects and repositories:

| BCH                                        | BSV                                      | BTC                                |
| ------------------------------------------ | ---------------------------------------- | ---------------------------------- |
| https://www.bitcoincash.org/               | https://bitcoinsv.io/                    | https://bitcoin.org/               |
| https://github.com/Bitcoin-ABC/bitcoin-abc | https://github.com/bitcoin-sv/bitcoin-sv | https://github.com/bitcoin/bitcoin |

# DNS Seeds

### BTC

```
seed.bitcoin.sipa.be
dnsseed.bluematt.me
dnsseed.bitcoin.dashjr.org
seed.bitcoinstats.com
seed.bitnodes.io
bitseed.xf2.org
```

### BCH

```
seed.bitcoinabc.org - Bitcoin ABC seeder
seed-abc.bitcoinforks.org - bitcoinforks seeders
seed.bitcoinunlimited.info - BU seeder
seed.bitprim.org - Bitprim
seed.deadalnix.me - Amaury SÉCHET
```

### BSV

Mainnet

```
seed.bitcoinsv.io
seed.cascharia.com
seed.satoshisvision.network
```

Testnet

```
testnet-seed.bitcoinsv.io
testnet-seed.cascharia.com
```
