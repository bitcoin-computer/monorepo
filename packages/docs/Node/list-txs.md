# list-txs

_Returns the sent and received transactions for a given address._

## Endpoint

`/v1/CHAIN/NETWORK/wallet/:address/list-txs`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/wallet/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/list-txs
```

### Response

#### Success (200)

```json
{
  "sentTxs": [
    {
      "txId": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
      "inputsSatoshis": 99944756,
      "outputsSatoshis": 99927794,
      "satoshis": 16962
    },
    {
      "txId": "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8",
      "inputsSatoshis": 99961718,
      "outputsSatoshis": 99944756,
      "satoshis": 16962
    }
  ],
  "receivedTxs": [
    {
      "txId": "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be",
      "inputsSatoshis": 0,
      "outputsSatoshis": 99961718,
      "satoshis": 99961718
    }
  ]
}
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```
