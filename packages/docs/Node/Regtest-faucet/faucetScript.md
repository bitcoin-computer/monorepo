# faucetScript

#### `v1/CHAIN/NETWORK/faucetScript`

Send coins to a script.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/faucetScript \
     -H "Content-Type: application/json" \
     -d '{
           "script": "76a914f7f1",
            "value": "100000000"
          }'
```

```json
{
  "txId": "68ef61b6c8896c42f983a0a80caa299ba8cfb0d9d03431ee5bcd6fbf7e0aa21b",
  "vout": 0,
  "height": -1,
  "satoshis": "100000000"
}
```
