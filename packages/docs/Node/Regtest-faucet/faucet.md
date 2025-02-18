# faucet

#### `/v1/CHAIN/NETWORK/faucet`

Send coins to an address.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/faucet \
     -H "Content-Type: application/json" \
     -d '{
           "address": "mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t",
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
