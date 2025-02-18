# received-outputs

#### `/v1/CHAIN/NETWORK/wallet/:address/received-outputs`

Returns the outputs that were received by a given address.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/wallet/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/received-outputs
```

```json
[
  {
    "output": "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be:5",
    "amount": 99961718
  },
  {
    "output": "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8:3",
    "amount": 99944756
  },
  {
    "output": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:3",
    "amount": 99927794
  }
]
```
