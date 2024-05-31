# query

Returns the latest revisions of smart objects. Conditions can be passed in to determine the smart objects. When multiple conditions are passed in, the latest revisions of the smart objects that satisfy all conditions are returned.

### Type

```ts
<T extends new (...args: any) => any>(
  query:
    | {
        ids: string[];
      }
    | {
        publicKey?: string;
        mod?: string;
        limit?: number;
        offset?: number;
        order?: "ASC" | "DEC";
      }
) => Promise<string[]>;
```

### Syntax

```js
await computer.query({ publicKey })
await computer.query({ ids })
await computer.query({ mod })
await computer.query({ publicKey, order })
...
```

### Parameters

#### params

An object with the query parameters.

{.compact}
| Key | Type | Description |
|-----------|-------------------------------------------------|--------------------------------------------------------------------------------|
| publicKey | string | Return latest revisions of smart objects owned by a public key |
| ids | string[] | Return latest revision of smart objects with ids in order |
| mod | string | Return the latest revision of smart objects created with this module specifier |
| limit | number | Return only limited number of revisions |
| offset | number | Return results starting from offset |
| order | 'ASC' \| 'DEC' | Order results in ascending or descending order |

### Return value

Given the query parameters, returns an array of strings encoding the latest revisions of smart objects that matches the specified conditions.

### Examples

```ts
class A extends Contract { ... }
a = await computer.new(A)

// query by public key
const publicKey = computer.getPublicKey()
const [rev1] = await computer.query({ publicKey })
expect(rev1).to.equal(a._rev)

// query by id
const ids = [a._id]
const [rev2] = await computer.query({ ids })
expect(rev2).to.equal(a._rev)

// query by module specifier
const mod = await computer.export(`export ${A}`)
const b = await computer.new(A, [], mod)
const [rev3] = await computer.query({ mod })
expect(rev3).to.equal(b._rev)

// query by multiple parameters
const [revs5] = await computer.query({
  limit: 10,
  order: 'ASC',
  publicKey: { computer.getPublicKey() }
})
expect(rev5).to.equal(a._rev)
```
