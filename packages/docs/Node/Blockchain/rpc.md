# rpc

#### `/v1/CHAIN/NETWORK/rpc`

Call a Bitcoin RPC method.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/rpc \
     -H "Content-Type: application/json" \
     -d '{
           "method": "getmempoolinfo",
           "params": ""
         }'
```

```json
{
  "result": {
    "result": {
      "loaded": true,
      "size": 1,
      "bytes": 144,
      "usage": 1296,
      "maxmempool": 300000000,
      "mempoolminfee": 0.00001,
      "minrelaytxfee": 0.00001,
      "unbroadcastcount": 1
    },
    "error": null,
    "id": 40795
  }
}
```
