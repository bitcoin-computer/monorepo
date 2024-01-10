# query

Returns the latest revisions of smart objects. Conditions can be passed in to determine the smart objects. When multiple conditions are passed in, the latest revisions of the smart objects that satisfy all conditions are returned.


### Syntax
```js
const revsArray = await computer.query(params)
```

### Type
```ts
(query: {
  publicKey?: string
  ids?: string[]
  mod?: string
  contract?: <T extends new (...args: any) => any>{
    class: T,
    args?: ConstructorParameters<T>;
  }
  order?: 'ASC' | 'DEC',
  limit?: number,
  offset?: number,
}) => Promise<string[]>
```

### Parameters

#### params
An object with the query parameters.

<div align="center" style="font-size: 14px;">
  <table>
    <tr>
      <th>parameter</th>
      <th>functionality</th>
    </tr>
    <tr>
      <td>publicKey</td>
      <td>Return all unspent revisions currently owned by a public key</td>
    </tr>
    <tr>
      <td>ids</td>
      <td>Return all unspent revision of smart objects with these ids in order</td>
    </tr>
    <tr>
      <td>mod</td>
      <td>Return the latest revision of smart objects created with this module specifier</td>
    </tr>
    <tr>
      <td>contract</td>
      <td>Return all unspent revisions of smart objects from a class</td>
    </tr>
    <tr>
      <td>order</td>
      <td>Order results in 'ASC' or 'DEC' order</td>
    </tr>
    <tr>
      <td>limit</td>
      <td>Return only limited number of revisions</td>
    </tr>
    <tr>
      <td>offset</td>
      <td>Return results starting from offset</td>
    </tr>
  </table>
</div>

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

// query by class
const contract = { class: A }
const [rev4] = await computer.query({ contract })
expect(rev4).to.equal(a._rev)

// query by multiple parameters
const [revs5] = await computer.query({
  limit: 10,
  order: 'ASC',
  contract: { class: A }
})
expect(rev5).to.equal(a._rev)
```