# utxos

_Returns the UTXOs for a given address._

## Endpoint

`/v1/CHAIN/NETWORK/wallet/:address/utxos`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/wallet/mwJn1YPMq7y5F8J3LkC5Hxg9PHyZ5K4cFv/utxos
```

### Response

```json
[
  {
    "address": "mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t",
    "satoshis": 99927794,
    "asm": "OP_DUP OP_HASH160 350dbb89c08f5b4aa19eb2bc0b4bb8ba5b79a873 OP_EQUALVERIFY OP_CHECKSIG",
    "rev": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:3",
    "txId": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
    "vout": 3
  }
]
```
