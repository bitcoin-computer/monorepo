# height

#### `/v1/CHAIN/NETWORK/:id/height`

Get the height of an specific block. The `id` can be `best` or a block given hash.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/best/height
```

```json
{ "height": 101 }
```
