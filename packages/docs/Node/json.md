# json

_Returns the JSON representation of a given transaction._

## Endpoint

`/v1/CHAIN/NETWORK/tx/:txId/json`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/tx/e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca/json
```

### Response

```json
{
  "txId": "e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca",
  "txHex": "0100000001202aabc...",
  "vsize": 443,
  "version": 1,
  "locktime": 0,
  "ins": [
    {
      "txId": "7c2f4dacaeac0a69c451bdd19f6c31d54def13b76ec8687160468d0ac8ab2a20",
      "vout": 0,
      "script": "47304402203...",
      "sequence": 4294967295
    }
  ],
  "outs": [
    {
      "address": "mryiaVyu9cDrdYCGzt8TimdxXPS1vmJS1a",
      "script": "512102ff3...",
      "value": 5820
    },
    {
      "address": "mryiaVyu9cDrdYCGzt8TimdxXPS1vmJS1a",
      "script": "76a9147db...",
      "value": 99971398
    }
  ]
}
```
