# modules

_List deployed Bitcoin Computer modules indexed by the node._

## Endpoint

`/v1/CHAIN/NETWORK/modules`

## Description

The node indexes **module deploy** transactions into a dedicated `Module` table (see the [DB schema](https://github.com/bitcoin-computer/monorepo/blob/main/packages/node/db/db_schema.sql)).

Module deploys are not smart-object transitions. They store ECMAScript module source on chain:

- **multisig** — cleartext `{ ept }` in bare-multisig data outputs
- **taproot** — module body in a reveal-input witness envelope with protocol id `BC` (content type `text/javascript`)

Clients deploy modules with [`computer.deploy`](../Lib/Computer/deploy.md) and load them with [`computer.load`](../Lib/Computer/load.md). This endpoint lists what the node has indexed so you can discover module specifiers without knowing every deploy transaction id.

Owner outputs from module deploys still appear in the `Output` table like other payments; the `Module` row holds the source (`ept`) and storage type.

## Query Parameters

| Parameter      | Type                  | Description                                                                 |
| -------------- | --------------------- | --------------------------------------------------------------------------- |
| `verbosity`    | `0` or `1`            | Response detail. `0` (default): array of module specifier strings. `1`: full rows. |
| `limit`        | `number`              | Maximum number of results. Defaults to `BCN_QUERY_LIMIT` or `100`.          |
| `offset`       | `number`              | Number of results to skip (pagination). Defaults to `0`.                    |
| `order`        | `ASC` or `DESC`       | Sort by insert `timestamp`. Defaults to `DESC`.                             |
| `storageType`  | `multisig` \| `taproot` | Optional filter by on-chain encoding.                                     |
| `isConfirmed`  | `boolean`             | Optional. `true`: only modules with a `blockHash`. `false`: mempool only.   |

> Notes:
>
> - `BCN_QUERY_LIMIT` is configurable in your `.env` file. If set, any `limit` exceeding this value returns a validation error.
> - Results are ordered by the row `timestamp` (when the node indexed the module), not by block height.
> - Unconfirmed (mempool) modules have `blockHash` / `blockHeight` unset until the deploy is confirmed. On reorg, confirmation fields are cleared; on hard mempool cleanup, unconfirmed module rows may be deleted.

## Example

### Request — list specifiers

```shell
curl -X GET "http://localhost:1031/v1/LTC/regtest/modules?limit=10"
```

### Request — full rows, confirmed multisig only

```shell
curl -X GET "http://localhost:1031/v1/LTC/regtest/modules?verbosity=1&storageType=multisig&isConfirmed=true&limit=10"
```

### Response

#### Success (200) — `verbosity=0` (default)

```json
[
  "a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458:0",
  "b588bf7c3778d3a781578e5f1839c796ff18c351346882973429f3aee0ce69569:0"
]
```

#### Success (200) — `verbosity=1`

```json
[
  {
    "mod": "a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458:0",
    "ept": "export class Counter extends Contract {\n  constructor() { super({ n: 0 }) }\n  inc() { this.n += 1 }\n}\n",
    "storageType": "multisig",
    "blockHash": "00000000000000000000000000000000000000000000000000000000000000ff",
    "blockHeight": 104,
    "timestamp": "2026-07-22T12:00:00.000Z"
  }
]
```

#### Validation errors (400)

```json
{ "error": "limit must be a number not exceeding 1000" }
```

```json
{ "error": "storageType must be 'multisig' or 'taproot'" }
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```

## See also

- [module](./module.md) — fetch one module (including source) by specifier
- [deploy](../Lib/Computer/deploy.md) / [load](../Lib/Computer/load.md) — client-side deploy and load
- [non-standard-utxos](./non-standard-utxos.md) — query smart-object revisions filtered by a module specifier (`mod`), not the module source itself
