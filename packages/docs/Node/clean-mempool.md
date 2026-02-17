# clean-mempool

_Triggers a cleanup of stale unconfirmed mempool entries._

## Description

Triggers a manual cleanup of the node’s internal mempool representation.

The Bitcoin Computer Node stores unconfirmed transactions and outputs in its database to efficiently track mempool state. Over time, some transactions may disappear from the Bitcoin node’s mempool (for example due to eviction, replacement, or restarts) without ever being confirmed.

This endpoint removes unconfirmed database entries that are no longer present in the Bitcoin node’s mempool, ensuring that the node’s internal state remains consistent and does not accumulate stale data.

It is recommended disable this endpoint for mainnet network mode, as it performs a potentially expensive database operation.

## Endpoint

`/v1/CHAIN/NETWORK/clean-mempool`

## Configuration

To enable this endpoint, set the following variable in your `.env` file:

```bash
BCN_MEMPOOL_CLEANUP_ENDPOINT_ENABLED='true'
```

If this variable is set to 'false', the endpoint will return a `403 Forbidden` response.

Even if disabled, the node will still perform automatic background cleanup based on the configured interval, according to the Bitcoin Node mempool `BCN_MEMPOOL_CLEANUP_INTERVAL_MS` (default is 1 hour for BTC and LTC, mainnet and testnet; and 15 minutes for DOGE and PEPE)

## Example

### Request

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/clean-mempool
```

### Response

#### Success (200)

Returns a list of revision identifiers (`rev`) that were removed during the cleanup.

```json
["txid1:0", "txid2:1", "txid3:0"]
```

Each entry represents a stale unconfirmed revision that was removed from the database.

#### Forbidden (403)

Returned when the cleanup endpoint is disabled via configuration.

```
[
  "Mempool cleanup is disabled"
]
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```

### Notes

- It is recommended to keep this endpoint disabled on public mainnet deployments unless explicitly required.
