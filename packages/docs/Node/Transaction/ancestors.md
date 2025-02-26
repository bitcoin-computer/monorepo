# ancestors

#### `/v1/CHAIN/NETWORK/tx/:txId/ancestors`

Returns an array with the transaction IDs of the ancestors of a given transaction. An ancestor is a transaction that is an input to the given transaction.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/tx/e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca/ancestors
```

```json
[
  "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
  "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8",
  "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be"
]
```
