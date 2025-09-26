# rpc

_Call a Bitcoin RPC method._

## Endpoint

`/v1/CHAIN/NETWORK/rpc`

## Example

### Request

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/rpc \
     -H "Content-Type: application/json" \
     -d '{
           "method": "getmempoolinfo",
           "params": ""
         }'
```

### Response

#### Success (200)

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

#### Invalid method (400 / 500)

```json
{ "error": "Please provide appropriate RPC method name" }
```

```json
{ "error": "Method is not allowed" }
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```

> **Note:** Only RPC methods matching `BCN_ALLOWED_RPC_METHODS` are permitted. Any other method will return an error. This value can be configured in the `.env` file.
