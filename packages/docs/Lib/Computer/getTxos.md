# getTxos

_Returns transaction outputs for the given query parameters._

## Type

```ts
type GetTxos = {
  rev: string
} & GetTxos_

type GetTxos_ = Partial<{
  address: string
  satoshis: bigint
  asm: string
  isSmartObject: boolean
  mod: string
  previous: string
  expHash: string
  blockHash: string
  spent: boolean
  publicKey: string
}>

type GetTxosQuery = {
  verbosity?: number
  limit?: number
  order?: 'ASC' | 'DESC'
  offset?: number
} & GetTxos_

getTxos(query: GetTxosQuery): Promise<GetTxos[]>
```

### Parameters

#### `query`

An object with the query parameters.

{.compact}
| Key | Description |
| ------------- | --------------------------------------------------------------------------- |
| verbosity | 0 for revision strings, 1 for rows from the Output table |
| address | Return txouts that belong to this address |
| satoshis | Return txouts with this exact satoshi amount |
| asm | Return txouts matching the asm script |
| isSmartObject | Return txouts that are (or are not) smart objects |
| mod | Return txouts that are (or are not) smart objects created with this module or a descendant of it |
| previous | Return txouts whose previous is the provided parameter |
| expHash | Return txouts that are matching the provided expression hash |
| blockHash | Return txouts that are (or are not) included in the block with this hash |
| spent | Return txouts that are (or are not) spent |
| publicKey | Return txouts that are (or are not) owned by this public key |
| limit | Limit the number of txouts returned |
| offset | Return results starting from offset |
| order | Order results in ascending or descending order |

### Return Value

An array of either revision strings or rows from the Output table, depending on the verbosity level specified in the query.

## Description

The `getTxos` function allows you to query transaction outputs (txos) based on various parameters. You can filter txouts by address, satoshi amount, script assembly, whether they are smart objects, and more. The function returns either revision strings or detailed rows from the Output table, depending on the verbosity level specified in the query.

## Example

:::code source="../../../lib/test/lib/computer/get-txos.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-txos.test.ts" target=_blank>Source</a>
