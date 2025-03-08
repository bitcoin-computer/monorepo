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

```json
[
  "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
  "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8",
  "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be"
]
```
