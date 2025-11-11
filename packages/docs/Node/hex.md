# hex

_Returns the raw transaction hex for a given transaction ID._

## Endpoint

`/v1/CHAIN/NETWORK/tx/:txId/hex`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/tx/e53c1440f547b51343d46a2acaafe127e915c7ed08a7ef2ed0ffc248360c0cca/hex
```

### Response

#### Success (200)

```json
{
  "0100000001202aabc..."
}
```

> **Note on caching:** Successful responses are returned with  
> `Cache-Control: public, max-age=31536000`, meaning they can be cached for up to **1 year**.

#### Missing parameter (400)

```json
{ "error": "Missing input txId." }
```

#### Not found (404)

```json
{ "error": "Not found" }
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```
