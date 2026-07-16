# id

_Get the data stored in the off-chain storage._

## Endpoint

`/v1/store/:id`

## Example

### Request

```shell
curl -X GET http://localhost:1031/v1/store/fcdb882a0b9556a0c6fb2a89efe0633f0c256f24696f465d386a91803838e79a
```

### Response

#### Success (200)

```json
{
  "exp": "class A extends Contract {
            constructor(n, url){
              super({
                n: n,
                _url: url
              });

            }
          }
          new A(0.2815266905953051,'http://localhost:1031')",
    "env":{},
    "mod":"",
    "v":"0.24.0-beta.0"
}
```

#### Not found / forbidden (403)

```json
{ "error": "No entry found." }
```

#### Server error (500)

```json
{ "error": "Internal server error message" }
```
