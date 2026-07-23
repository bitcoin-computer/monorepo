# module

_Get a single indexed module by specifier, including its source._

## Endpoint

`/v1/CHAIN/NETWORK/module/:mod`

## Description

Returns one row from the node’s `Module` table for the given module specifier.

The path parameter `mod` is a revision-style string of the form `<transaction-id>:<output-number>` (typically `<txId>:0` as returned by [`computer.deploy`](../Lib/Computer/deploy.md)).

| Field          | Type                    | Description                                                                 |
| -------------- | ----------------------- | --------------------------------------------------------------------------- |
| `mod`          | `string`                | Module specifier (`txId:vout`). Primary key.                                |
| `ept`          | `string`                | Module source text (ECMAScript module body).                                |
| `storageType`  | `multisig` \| `taproot` | How the deploy was encoded on chain.                                        |
| `blockHash`    | `string` \| `null`      | Confirming block hash, or `null` if still unconfirmed.                      |
| `blockHeight`  | `number` \| `null`      | Confirming block height, or `null` if still unconfirmed.                    |
| `timestamp`    | `string`                | When the node indexed the row (database timestamp).                         |

This endpoint returns the stored source string. It does **not** evaluate the module. On the client, use [`computer.getModule`](../Lib/Computer/getModule.md) for the same row, or [`computer.load`](../Lib/Computer/load.md) to import exports in a SES compartment.

## Path Parameters

| Parameter | Type     | Description                                                                 |
| --------- | -------- | --------------------------------------------------------------------------- |
| `mod`     | `string` | Module specifier. Must match `/^[0-9A-Fa-f]{64}:\d+$/` (same form as a rev). |

## Example

### Request

```shell
curl -X GET "http://localhost:1031/v1/LTC/regtest/module/a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458:0"
```

### Response

#### Success (200)

```json
{
  "mod": "a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458:0",
  "ept": "export class Counter extends Contract {\n  constructor() { super({ n: 0 }) }\n  inc() { this.n += 1 }\n}\n",
  "storageType": "taproot",
  "blockHash": "00000000000000000000000000000000000000000000000000000000000000ff",
  "blockHeight": 104,
  "timestamp": "2026-07-22T12:00:00.000Z"
}
```

#### Validation error (400)

```json
{ "error": "Invalid module specifier" }
```

#### Not found (404)

```json
{ "error": "Module not found" }
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```

## See also

- [modules](./modules.md) — list indexed modules
- Client: [getModule](../Lib/Computer/getModule.md), [deploy](../Lib/Computer/deploy.md) / [load](../Lib/Computer/load.md)
- [Operate & Troubleshoot](./operations.md) — 404 / not indexed / schema missing
