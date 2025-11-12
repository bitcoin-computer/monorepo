# sent-outputs

_Returns the outputs that were sent from a given address._

## Endpooint

`/v1/CHAIN/NETWORK/wallet/:address/sent-outputs`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/wallet/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/sent-outputs
```

### Response

#### Success (200)

```json
[
  {
    "output": "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8:1",
    "amount": 99961718
  },
  {
    "output": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:1",
    "amount": 99944756
  }
]
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```
