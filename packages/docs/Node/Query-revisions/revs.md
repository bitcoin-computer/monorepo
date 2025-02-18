# revs

#### `/v1/CHAIN/NETWORK/revs`

Get the revisions of a list of transactions.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/revs \
     -H "Content-Type: application/json" \
     -d '{
           "ids": [
             "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
             "9343ce7ca5e2039ab5329b2918319bd1656983cf2e8f8de7c4001d61870d0eb8"
           ]
         }'
```

```json
[
  "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89",
  "db98c59f328bb45b14a957ce44546f5bfe2f1bf4394de18e98f32188e76082be"
]
```
