# store

#### `/v1/store`

Stores the hex of the data in the offchain storage.

```shell
curl -X POST http://localhost:1031/v1/store \
     -H "Content-Type: application/json" \
     -d '{
           "data": "{\"exp\":\"3+1\"}"
          }'
```
