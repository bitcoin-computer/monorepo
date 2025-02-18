# non-standard-utxos

#### `/v1/CHAIN/NETWORK/non-standard-utxos`

Query revisions by module specifier, public key, limit, order, offset and list of transaction ids.

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?mod=1
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?publicKey=02e3b0...
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?limit=10
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?order=DESC
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?offset=10

id="4446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494:0"
json_array=$(jq -n --arg id "$id" '[$id]')
encoded_json=$(echo "$json_array" | jq -r @uri)
url="http://localhost:1031/v1/LTC/regtest/non-standard-utxos?ids=$encoded_json"
curl -X GET "$url"
```

<!-- curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?ids=%5B%224446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494%3A0%22%5D -->

```json
["4446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494:0"]
```
