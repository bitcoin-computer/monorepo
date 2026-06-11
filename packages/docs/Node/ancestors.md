# ancestors

_Returns an array of transaction ids for all transaction that the on-chain object at the given transaction if depends on._

## Description

An on-chain object _o_ depends on a transaction _tx_ if _tx_ is a Bitcoin Computer transaction labelled with an expression _exp_ and _exp_ needs to be evaluated in order to compute the the value of _o_. The endpoint returns all ids of such transactions.

## Endpoint

`/v1/CHAIN/NETWORK/tx/:txId/ancestors`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/tx/e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca/ancestors
```

### Response

#### Success (200)

```json
[
  "b3c1a43d0c9a8e07a27df8727c3b3a3e74c5b99f0d9f9af7f2f9bde1e46c2a77",
  "9f1b2d18fce0c95fba8843d10c5c87b81a4fa221cbe7e97de2b42e15d2a90f66"
]
```

> **Note on caching:** Successful responses are returned with  
> `Cache-Control: public, max-age=31536000`, meaning they can be cached for up to **1 year**.

#### Invalid parameter (400)

```json
{ "error": "Invalid txId, did you provide a revision instead?" }
```

#### Missing parameter (400)

```json
{ "error": "Missing input txIds." }
```

#### Not found (404)

```json
{ "error": "Not found" }
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```
