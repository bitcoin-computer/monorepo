# prev

_Get the previous revision of a given revision._

## Endpoint

`/v1/CHAIN/NETWORK/prev/:rev`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/LTC/regtest/prev/44a1e658be5b1fa7b13511979c91497cacf9286aac694bbb75188b875384db98:0
```

### Response

#### Success (200)

```json
{
  "rev": "032fc7a37e7848f5fb2beb79f773631c6047be0a2e9a699e1355aa8d1c64155e:0"
}
```

> **Note on caching:** Successful responses are returned with  
> `Cache-Control: public, max-age=31536000`, meaning they can be cached for up to **1 year**.

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
