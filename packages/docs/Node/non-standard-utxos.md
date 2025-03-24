# non-standard-utxos

_Query revisions by module specifier, public key, limit, order, offset and list of transaction ids._

## Endpoint

`/v1/CHAIN/NETWORK/non-standard-utxos`

## Example

### Requests

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?publicKey=02e3b0...
```

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?publicKey=02e3b0...&mod=af19fa7...
```

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?publicKey=02e3b0...&mod=af19fa7...&limit=10
```

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/non-standard-utxos?ids=%5B%224446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494%3A0%22%5D
```

<!-- id="4446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494:0"
json_array=$(jq -n --arg id "$id" '[$id]')
encoded_json=$(echo "$json_array" | jq -r @uri)
url="http://localhost:1031/v1/LTC/regtest/non-standard-utxos?ids=$encoded_json"
curl -X GET "$url" -->

### Response

```json
["4446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494:0"]
```
