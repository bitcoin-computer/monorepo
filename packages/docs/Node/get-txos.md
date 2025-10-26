# get-txos

_Returns the TXOs (transaction outputs) filtered by the provided query parameters._

## Endpoint

`/v1/CHAIN/NETWORK/get-txos`

## Description

This endpoint retrieves transaction outputs (TXOs) from the `Output` table according to the specified query parameters.  
At least one filtering parameter (other than `verbosity`) must be provided.  
Validation is performed on all parameters to ensure proper format and type.

## Query Parameters

| Parameter     | Type       | Description                                        |
| ------------- | ---------- | -------------------------------------------------- |
| `verbosity`   | `0` or `1` | Required. Level of detail in the response.         |
| `rev`         | `string`   | TXO revision ID (must be valid).                   |
| `address`     | `string`   | Filter by address.                                 |
| `satoshis`    | `string`   | Amount in satoshis.                                |
| `asm`         | `string`   | Script in ASM format.                              |
| `isObject`    | `boolean`  | Whether to return TXOs as objects.                 |
| `mod`         | `string`   | Modifier revision (must be valid).                 |
| `previous`    | `string`   | Previous TXO revision (must be valid).             |
| `exp`         | `string`   | Script in hexadecimal format.                      |
| `blockHash`   | `string`   | Block hash (must be hex).                          |
| `blockHeight` | `number`   | Block height (non-negative integer).               |
| `blockIndex`  | `number`   | Index of the TXO within the block.                 |
| `isSpent`     | `boolean`  | Filter spent/unspent outputs.                      |
| `isConfirmed` | `boolean`  | Filter confirmed/unconfirmed outputs.              |
| `publicKey`   | `string`   | Public key in hex format.                          |
| `limit`       | `number`   | Maximum number of results (must not exceed limit). |
| `offset`      | `number`   | Number of items to skip (must be non-negative).    |
| `order`       | `string`   | Sort order: `"ASC"` or `"DESC"`.                   |

## Example

### Request

```shell
curl -X GET "http://localhost:1031/v1/LTC/regtest/get-txos?verbosity=1&address=mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t&isSpent=false&limit=2"
```

### Response

#### Success (200)

```json
[
  {
    "rev": "5a04f3cdb0450fd4708dfcd2fe86f51c6077add296507d69f2620c15e94c8e89:3",
    "address": "mkMUZNoiLh4uuuENU5HNZ4Ssxo8BqEQc5t",
    "satoshis": 99927794,
    "asm": "OP_DUP OP_HASH160 350dbb89c08f5b4aa19eb2bc0b4bb8ba5b79a873 OP_EQUALVERIFY OP_CHECKSIG",
    "isObject": false,
    "mod": null,
    "previous": null,
    "exp": "a69f71ff08ef782d3edb7d938cd765b89ce608c3b7d0db9a3f1675c172fe43b3",
    "blockHeight": 104,
    "blockHash": "00000000000000000000000000000000000000000000000000000000000000ff",
    "blockIndex": 0
  }
]
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```
