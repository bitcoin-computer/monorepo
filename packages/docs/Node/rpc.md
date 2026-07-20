# rpc

_Call a Bitcoin RPC method._

## Endpoint

`/v1/CHAIN/NETWORK/rpc`

## Description

This endpoint acts as a secure proxy to the underlying Bitcoin node (bitcoind).
Only methods matching the `BCN_ALLOWED_RPC_METHODS` regular expression (configured
in the node's `.env` file) are permitted.

**Important:** The `params` argument is a **space-separated string**. For RPC methods
that accept optional trailing parameters (e.g. `verbosity` in `getrawtransaction`,
`getblock`, or `verbose` in `getblockheader`), you may omit the optional parameters.
The node will use the default values defined by Bitcoin Core.

## Parameters

| Field    | Type   | Required | Description                                                                                                                                             |
| -------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `method` | string | Yes      | Name of the Bitcoin RPC method to call (case-insensitive matching supported).                                                                           |
| `params` | string | No       | Space-separated list of arguments for the RPC method. Optional trailing parameters may be omitted. Use `""` or omit for methods that take no arguments. |

## Examples

### Example 1: Method with no parameters

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/rpc \
     -H "Content-Type: application/json" \
     -d '{
           "method": "getmempoolinfo",
           "params": ""
         }'
```

### Example 2: Method with optional parameter omitted (recommended)

```shell
curl -X POST http://localhost:1031/v1/BTC/mainnet/rpc \
     -H "Content-Type: application/json" \
     -d '{
           "method": "getblockheader",
           "params": "0000000000000000000abc123def456789"
         }'
```

### Example 3: Method with optional parameter provided

```shell
curl -X POST http://localhost:1031/v1/BTC/mainnet/rpc \
     -H "Content-Type: application/json" \
     -d '{
           "method": "getrawtransaction",
           "params": "txid1234567890abcdef 1"
         }'
```

## Response

### Success (200)

```json
{
  "result": {
    "result": { ... },   // actual result from bitcoind
    "error": null,
    "id": 40795
  }
}
```

### Invalid / Unsupported Method (400)

```json
{ "error": "This RPC method does not exist or is not supported: someMethod" }
```

### Method Not Allowed (400)

```json
{ "error": "Method is not allowed" }
```

### Invalid Parameters (400)

```json
{ "error": "Too few params provided for method \"getblockhash\". Expected at least 1, got 0" }
```

### Server Error (500)

```json
{ "error": "Internal server error message" }
```

> **Note:** Only RPC methods matching `BCN_ALLOWED_RPC_METHODS` are permitted.
> The parameter parser now supports optional trailing arguments for common methods
> such as `getrawtransaction`, `getblock`, and `getblockheader`.
