# id

#### `/v1/store/:id`

Get the data stored in the offchain storage.

```shell
curl -X GET http://localhost:1031/v1/store/fcdb882a0b9556a0c6fb2a89efe0633f0c256f24696f465d386a91803838e79a
```

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
