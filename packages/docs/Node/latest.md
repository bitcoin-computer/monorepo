# latest

_Get the latest revision of a given revision._

## Endpoint

`/v1/CHAIN/NETWORK/latest/:rev`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/latest/032fc7a37e7848f5fb2beb79f773631c6047be0a2e9a699e1355aa8d1c64155e:0
```

### Response

#### Success (200)

```json
{ "rev": "44a1e658be5b1fa7b13511979c91497cacf9286aac694bbb75188b875384db98:0" }
```

#### Missing parameter (400)

```json
{ "error": "Missing rev." }
```

#### Not found (404)

```json
{ "error": "Not found" }
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```
