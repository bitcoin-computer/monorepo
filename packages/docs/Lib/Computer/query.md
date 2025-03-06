# query

_Returns the latest revisions of on-chain objects._

## Type

```ts
;<T extends new (...args: any) => any>(
  query:
    | {
        ids: string[]
      }
    | {
        publicKey?: string
        mod?: string
        limit?: number
        offset?: number
        order?: 'ASC' | 'DEC'
      },
) => Promise<string[]>
```

### Parameters

#### `args`

An object with the query parameters.

{.compact}
| Key | Description |
| --------- | ------------------------------------------------------------------------------ |
| publicKey | Return latest revisions of on-chain objects owned by a public key |
| ids | Return latest revision of on-chain objects with ids in order |
| mod | Return the latest revision of on-chain objects created with this module specifier |
| limit | Limit the number of revisions returned |
| offset | Return results starting from offset |
| order | Order results in ascending or descending order |

### Return value

Given the query parameters, returns an array of strings encoding the latest revisions of on-chain objects that matches the specified conditions.

## Description

The `args` object specifies the on-chain objects of which to return the latest revisions. One can either query by public key to obtain the latests revisions of objects currently owned by that public key

Conditions can be passed in to determine the on-chain objects. When multiple conditions are passed in, the latest revisions of the on-chain objects that satisfy all conditions are returned.

## Examples

```ts
import { Computer, Contract } from '@bitcoin-computer/lib'

class Counter extends Contract {
  constructor() {
    super({ n: 0 })
  }

  inc() {
    this.n += 1
  }
}

const computer = new Computer()

// Deploy module
const mod = await computer.deploy(`export ${Counter}`)

// Encode on-chain object and create it by broadcasting the transaction
const { effect, tx } = await computer.encode({ exp: 'new Counter()', mod })
await computer.broadcast(tx)

// Increment on-chain object
const counter = effect.res
await counter.inc()

// Query by public key
const pRevs = await computer.query({ publicKey })
expect(pRevs.includes(counter._rev)).to.be.true

// Query by id
const [iRev] = await computer.query({ ids: [counter._id] })
expect(iRev).eq(counter._rev)

// Query by module specifier
const [mRev] = await computer.query({ mod })
expect(mRev).eq(counter._rev)

// Query by multiple parameters
const mRevs = await computer.query({ publicKey, limit: 1 })
expect(mRevs.length).eq(1)
expect(mRevs.includes(counter._rev)).to.be.true
```
