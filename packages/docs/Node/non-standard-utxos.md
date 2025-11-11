# non-standard-utxos

_Query revisions by module specifier, public key, limit, order, offset and list of transaction ids._

## Endpoint

`/v1/CHAIN/NETWORK/non-standard-utxos`

## Query Parameters

| Parameter   | Type   | Description                                 |
| ----------- | ------ | ------------------------------------------- |
| `mod`       | string | Optional filter.                            |
| `publicKey` | string | Optional filter by public key.              |
| `limit`     | string | Maximum number of results to return.        |
| `offset`    | string | Number of results to skip (for pagination). |
| `order`     | string | Sort order: `ASC` or `DESC`.                |

> Notes:
>
> - `BCN_QUERY_LIMIT` is configurable in your `.env` file. If set, any `limit` exceeding this value will throw a validation error.

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

### Response

#### Success (200)

```json
["4446faf2ea02713580152f2355bc91e2eac3649c85e38d882e1ca795bb7b1494:0"]
```

#### Validation errors (400)

```json
{ "error": "Can't fetch more than 1000 revs." }
```

```json
{ "error": "Invalid order. Should be ASC or DESC." }
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```
