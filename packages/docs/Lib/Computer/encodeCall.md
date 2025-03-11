# encodeCall

_Creates a transaction from a function call._

## Type

```ts
;<T extends new (...args: any) => any, K extends keyof InstanceType<T>>(params: {
  target: InstanceType<T>
  property: string
  args: Parameters<InstanceType<T>[K]>
  mod?: string
}) =>
  Promise<{
    tx: NakamotoJS.Transaction
    effect: { res: Json; env: Json }
  }>
```

### Parameters

#### `params`

An object with the configuration parameters to encode the expression in a transaction.

{.compact}
| Key | Type | Description |
| -------- | ---------------------------------- | ---------------------------------------------- |
| target | InstanceType\<T\> | The smart object on which to call the function |
| property | string | The name of the function being called |
| args | Parameters\<InstanceType\<T\>[K]\> | The arguments to the function call |
| mod | string | A module specifier |

Module specifiers are encoded as strings of the form \<transaction id\>:\<output number\>

### Return Value

See [`encode`](./encode.md).

## Description

See [`encode`](./encode.md).

## Example

:::code source="../../../lib/test/lib/computer/encode-call.test.ts" :::
