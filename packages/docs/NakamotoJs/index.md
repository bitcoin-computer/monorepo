---
order: -48
icon: repo
---

# NakamotoJS

NakamotoJS is available on Github [here](https://github.com/bitcoin-computer/monorepo/tree/main/packages/nakamotojs#readme).

It owns chain **identity** (network params, BIP44 coin type, fees/dust defaults, features) and **parse/index hooks** used by the node.

## Adding a UTXO chain

For a Bitcoin-family chain, add a builtin `ChainConfig` in NakamotoJS (`ts_src/chains/builtins.ts`) and `registerChain` it at load time. Lib picks up fees, dust, `moduleStorageType`, and `getCoinType` from that config. `getNetwork` stays a wrapper over the registry.

Typical fields:

- `networks.mainnet | testnet | regtest` — `messagePrefix`, optional `bech32`, `bip32`, `pubKeyHash`, `scriptHash`, `wif`, `coinType` (testnet/regtest are `1`)
- `defaults` — `satPerByte`, `dustRelayTxFee`, `moduleStorageType` (`taproot` | `multisig`)
- `features` — set `taproot: false` on networks that cannot store modules in taproot (lib will reject `moduleStorageType: 'taproot'`)

### Parse / index hooks

The node never branches on chain name in the ingest path. It binds two functions **once** at worker / ZMQ start:

```ts
const { shouldParse, shouldIndex } = getParsingPolicy(chain, network)
```

| Hook | When | Return `false` to |
|---|---|---|
| `shouldParse(hex)` | Before `Transaction.fromHex` | Skip unparseable extra-tx formats (e.g. LTC MWEB flags `00`+`08`/`09`). Use `skipAdvancedTx(marker, flags)` or write your own. |
| `shouldIndex({ txId, height })` | After parse, sync path only | Skip historical duplicates. Use `skipTxsAtHeight([{ txId, height }])`. Omit `height` on ZMQ — skip-by-txid-only is unsafe for BIP30. |

Standard clones can omit `parsing` (both hooks default to “accept”). Hooks must be TypeScript functions in the repo (or `registerChain` from a local `import`). Do not load them from JSON or the network.

After building NakamotoJS with your changes, copy the environment file and the chain `.conf` file to the Bitcoin Computer Node base folder and try the setup locally. To fully add a supported chain, open a PR with your changes. The Bitcoin Computer team will review the code and, if approved, the chain will be fully supported in the ecosystem.

Node ops that are still **not** covered by this registry: `chain-setup/` env/conf/Docker image, and small `walletSetup` / RPC dialect differences. See [Node — Adding a chain](../Node/index.md).
