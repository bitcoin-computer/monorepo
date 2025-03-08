# revToId

_Given a revision, returns the id of the smart contract._

## Endpoint

`/v1/CHAIN/NETWORK/rev/:revToId`

## Example

### Request

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/revToId \
      -H "Content-Type: application/json" \
     -d '{
           "rev": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:0"
         }'
```

### Response

```json
"db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be:0"
```
