# balance

#### `/v1/CHAIN/NETWORK/address/:address/balance`

Returns the confirmed, unconfirmed and total balance for a given address.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/address/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/balance
```

```json
{
  "confirmed": 99927794,
  "unconfirmed": 0,
  "balance": 99927794
}
```
