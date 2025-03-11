# encodeNew

_Creates a transaction from a constructor call._

## Type

```ts
;<T extends new (...args: any) => any>(params: {
  constructor: T
  args?: ConstructorParameters<T>
  mod?: string
}) =>
  Promise<{
    tx: NakamotoJS.Transaction
    effect: { res: Json; env: Json }
  }>
```

### Parameters

#### `params`

{.compact}
| Key | Description |
| -----------| ----------------------------------------------- |
| constructor| A JavaScript class that extends from `Contract`. |
| args | Arguments to the constructor of the class. |
| mod | A string of the form `<id>:<num>` specifying the location of a module. |

### Return Value

See [`encode`](./encode.md).

## Description

See [`encode`](./encode.md).

## Example

:::code source="../../../lib/test/lib/computer/encode-new.test.ts" :::
