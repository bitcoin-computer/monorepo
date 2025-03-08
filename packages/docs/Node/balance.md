# balance

_Returns the balance of a given address._

## Description

Returns the confirmed, unconfirmed and total balance.

## Endpoint

`/v1/CHAIN/NETWORK/address/:address/balance`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/address/mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t/balance
```

### Response

```json
{
  "confirmed": 99927794,
  "unconfirmed": 0,
  "balance": 99927794
}
```
