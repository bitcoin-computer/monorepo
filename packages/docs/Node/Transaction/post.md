# post

#### `/v1/CHAIN/NETWORK/tx/post`

Posts a raw transaction to the network and returns its transaction ID.

```shell
curl -X POST http://localhost:1031/v1/LTC/regtest/tx/post \
     -H "Content-Type: application/json" \
     -d '{
           "hex": "0100000002b80e0d87611d00c4..."
         }'
```

```json
"e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca"
```
