# getTXOs

_Returns **Transaction Outputs** for the given query parameters._

## Type

```ts
type DbOutput = {
  rev: string
  address: string
  satoshis: bigint
  asm: string
  expHash?: string
  mod?: string
  isObject: boolean
  previous?: string
  blockHash?: string
  blockHeight?: number
  blockIndex?: number
}

type GetTXOsQuery = {
  verbosity?: number
  limit?: number
  order?: 'ASC' | 'DESC'
  offset?: number
  isSpent?: boolean
  isConfirmed?: boolean
  publicKey?: string
  exp?: string
} & Partial<Omit<DbOutput, 'expHash'>>

async getTXOs(q: GetTXOsQuery & { verbosity?: 0 }): Promise<string[]>
async getTXOs(q: GetTXOsQuery & { verbosity: 1 }): Promise<DbOutput[]>
async getTXOs(q: GetTXOsQuery): Promise<string[] | DbOutput[]>

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

### Return Value

An array of either revision strings or rows from the database Output table, depending on the verbosity level specified in the query.

## Description

The `getTXOs` function retrieves transaction outputs (TXOs) from the database based on customizable query parameters. It supports filtering by attributes such as address, satoshi amount, script assembly (ASM), smart object status, ownership via public key, and more. Results can be returned in two formats depending on the `verbosity` level: an array of revision strings (for `verbosity: 0`) or an array of detailed `DbOutput` objects (for `verbosity: 1`).

### Key Column Details

- **address**: Derived from the output script using `address.fromOutputScript` from the `@bitcoin-computer/nakamotoJs` library. If the script cannot be converted (e.g., non-standard P2PKH or P2SH scripts), this value is set to `null`. When filtering by `address`, only TXOs with matching convertible scripts are included.
- **asm**: The assembly (ASM) string representation of the output script, computed as `script.toASM(script)`. Use this for exact script-based filtering.
- **Other columns**: Include `rev` (revision string), `satoshis` (output value as bigint), `isObject` (boolean indicating if it's a smart object), `mod` (module identifier for smart objects), `exp` (expression hash), `previous` (prior TXO reference), `blockHash` (inclusion in a specific block), and `spent` (spend status).

### Filtering Behaviors

- **By public key (`publicKey`)**: Matches TXOs where the output script contains specified public key, enabling ownership-based queries. The value does not have to be a public key, the query works for any string. For example if you query for `OP_TRUE` the query will return all outputs whose script contains `OP_TRUE`.
- **By smart object status (`isObject`)**: Set to `true` to retrieve all on-chain smart objects.
- **By module (`mod`)**: Filters for smart objects created with the given module specifier. Modules are inherited in descendant objects within the Bitcoin Computer ecosystem, except during new object creation or explicit module overrides in expressions. This is particularly useful for tracking token transfers or module-specific lineages—refer to the examples for practical demonstrations.
- **Spent status (`spent`)**: Includes or excludes spent TXOs; combine with other filters for UTXO-like queries.
- **Pagination and ordering**: Use `limit`, `offset`, and `order` ('ASC' or 'DESC') for controlled, sorted result sets.

For security and efficiency, always pair this with `publicKey` to scope results to a specific owner, and apply `limit`/`offset` to manage result volume.

To retrieve Unspent Transaction Outputs, see the syntactic sugar function `getUTXOs`, which internally calls `getTXOs` with the `isSpent: false` parameter.

To retrieve Bitcoin Computer objects, see the syntactic sugar function `getOTXOs`, which internally calls `getTXOs` with the `isObject: true` parameter.

To retrieve unspent Bitcoin Computer objects, see the syntactic sugar function `getUOTXOs`, which internally calls `getTXOs` with the parameters `isObject: true` and `isSpent: false`.

## Example

:::code source="../../../lib/test/lib/computer/get-txos.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-txos.test.ts" target=_blank>Source</a>
