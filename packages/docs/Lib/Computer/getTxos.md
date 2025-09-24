# getTXOs

_Returns transaction outputs for the given query parameters._

## Type

```ts
type DbOutput = {
  rev: string
  address: string
  satoshis: bigint
  asm: string
  exp?: string
  mod?: string
  isObject?: boolean
  previous?: string
  blockHash?: string
}

export type GetTXOs = string | DbOutput

export type GetTXOsQuery = {
  verbosity?: number
  limit?: number
  order?: 'ASC' | 'DESC'
  offset?: number
  spent?: boolean
  publicKey?: string
} & Partial<DbOutput>

getTXOs(query: GetTXOsQuery): Promise<GetTXOs[]>
```

### Parameters

#### `query`

An object with the query parameters.

{.compact}
| Key | Description |
| ------------- | --------------------------------------------------------------------------- |
| verbosity | 0 for revision strings, 1 for rows from the Output table |
| rev | Return TXOs with this exact revision |
| address | Return TXOs that belong to this address. The address is computed from the output script (see below) |
| satoshis | Return TXOs with this exact satoshis amount |
| asm | Return TXOs matching the asm script |
| isObject | Return TXOs that are (or are not) smart objects |
| mod | Return TXOs that are (or are not) smart objects created with this module or a descendant of it |
| previous | Return TXOs whose previous is the provided parameter |
| exp | Giving an expression, return TXOs that matches the hash of that expression |
| blockHash | Return TXOs that are (or are not) included in the block with this hash |
| spent | Return TXOs that are (or are not) spent |
| publicKey | Return TXOs that are (or are not) owned by this public key |
| limit | Limit the number of TXOs returned |
| offset | Return results starting from offset |
| order | Order results in ascending or descending order |

While syncing to the blockchain, the Output table is fully populated with all TXOs. Two additional computed columns are available to facilitate querying:

The column 'address' is computed from the output script by attempting to convert it to an address using the `address.fromOutputScript` function from the `@bitcoin-computer/nakamotoJs` library. If the conversion fails (for example, if the output script is not a standard pay-to-public-key-hash or pay-to-script-hash script), the address is set to `null`.

```
import { address, script } from '@bitcoin-computer/nakamotoJs'

address = nullIfThrows(() => address.fromOutputScript(script))

```

The column 'asm' contains the assembly representation of the output script.

```
asm = script.toASM(script)
```

Then, queries can be made based on these computed columns. When filtering by address, only TXOs whose output script can be successfully converted to that address are considered. When filtering by public key, only TXOs whose output script includes the provided public key are considered. See the examples below for more details.

To query all on chain objects, use the parameter `isObject: true`. It is a good practice to always combine this with the `publicKey` parameter to return only the objects owned by a specific public key, and to limit the scope of the query.

To return only objects created with a specific module or its descendants, you can use the `mod` parameter. This is useful when you want to filter objects based on their module of origin. Within the Bitcoin Computer, the module is inherited to all descendant objects created from the original module object, except when the execution creates new objects or when the module is explicitly changed within the expression. See the examples, some test cases illustrate this behavior for token transfers.

### Return Value

An array of either revision strings or rows from the database Output table, depending on the verbosity level specified in the query.

## Description

The `getTXOs` function allows you to query transaction outputs (txos) based on various parameters. You can filter TXOs by address, satoshi amount, script assembly, whether they are smart objects, and more. The function returns either revision strings or detailed rows from the Output table, depending on the verbosity level specified in the query.

## Example

:::code source="../../../lib/test/lib/computer/get-txos.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-txos.test.ts" target=_blank>Source</a>
