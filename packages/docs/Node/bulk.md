# bulk

_Returns the raw transaction hexes for a given list of transaction ids._

## Endpoint

`/v1/CHAIN/NETWORK/tx/bulk`

## Example

### Request

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/tx/bulk \
     -H "Content-Type: application/json" \
     -d '{
           "txIds": [
             "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
             "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8",
             "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be"
           ]
         }'
```

### Response

```json
["0100000002b80e0d87611d...", "0100000001b80e0d87611d...", "0100000000012b087e1832..."]
```
