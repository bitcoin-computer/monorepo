# getTXOs

_Returns *transaction outputs* for the given query parameters._

## Type

```ts
type TXORecord = {
  rev: string
  address: string
  satoshis: bigint
  asm: string
  expHash?: string
  mod?: string
  isObject?: boolean
  previous?: string
  blockHash?: string
  blockHeight?: number
  blockIndex?: number
}

type TXOQuery = {
  verbosity?: number
  limit?: number
  order?: 'ASC' | 'DESC'
  offset?: number
  isSpent?: boolean
  isConfirmed?: boolean
  publicKey?: PublicKeyString
  exp?: string
} & Partial<Omit<TXORecord, 'expHash'>>

async getTXOs(q: TXOQuery & { verbosity?: 0 }): Promise<string[]>
async getTXOs(q: TXOQuery & { verbosity: 1 }): Promise<TXORecord[]>
async getTXOs(q: TXOQuery): Promise<string[] | TXORecord[]>

```

### Parameters

#### `query`

An object with the query parameters.

{.compact}
| Key | Description |
| ------------- | --------------------------------------------------------------------------- |
| verbosity | 0 for revision strings, 1 for rows from the Output table |
| rev | Return TXOs with this exact revision |
| address | Return TXOs that belong to this address. The matching address is computed from the output script (see below) |
| satoshis | Return TXOs with this exact satoshis amount |
| asm | Return TXOs matching the asm script |
| isObject | Return TXOs that are (or are not) smart objects |
| mod | Return TXOs that are smart objects created with this module or a descendant of it |
| previous | Return TXOs whose previous revision is the provided parameter |
| exp | Giving an expression, return TXOs that matches the hash of that expression |
| blockHash | Return TXOs that are included in the block with this hash |
| isSpent | Return TXOs that are (or are not) spent |
| isConfirmed | Return TXOs that are (or are not) included in a block |
| publicKey | Return TXOs whose asm contains this public key |
| limit | Limit the number of TXOs returned |
| offset | Return results starting from offset |
| order | Order results in ascending or descending order |

### Return Value

An array of either revision strings or rows from the database Output table, depending on the verbosity level specified in the query.

## Description

The `getTXOs` function retrieves transaction outputs (TXOs) from the database based on customizable query parameters. It supports filtering by attributes such as address, satoshi amount, script assembly (ASM), smart object status, ownership via public key, and more. Results can be returned in two formats depending on the `verbosity` level: an array of revision strings (for `verbosity: 0`) or an array of detailed `TXORecord` objects (for `verbosity: 1`).

### Key Column Details

- **address**: Derived from the output script using `address.fromOutputScript` from the `@bitcoin-computer/nakamotoJs` library. If the script cannot be converted (e.g., non-standard P2PKH or P2SH scripts), this value is set to `null`. When filtering by `address`, only TXOs with matching convertible scripts are included.
- **asm**: The assembly (ASM) string representation of the output script, computed as `script.toASM(script)`. Use this for exact script-based filtering.
- **Other columns**: Include `rev` (revision string), `satoshis` (output value as bigint), `isObject` (whether the output encodes a smart object), `mod` (module specifier membership for smart objects), `expHash` (hash of the transition expression), `previous` (prior TXO reference), `blockHash` / `blockHeight` / `blockIndex` (confirmation metadata). Spend status is selected via the `isSpent` query flag, not a column named `spent`.

### Filtering Behaviors

- **By public key (`publicKey`)**: Matches TXOs where the output asm script contains the given string. The value does not have to be a public key; for example `OP_TRUE` matches outputs whose script contains that chunk.
- **By smart object status (`isObject`)**: Set to `true` to retrieve on-chain smart objects.
- **By module (`mod`)**: Filters for smart objects that **belong to** the given module specifier (object membership / inheritance). This is not the module source itself—use [`getModules`](./getModules.md) / [`getModule`](./getModule.md) for deploys.
- **Spent status (`isSpent`)**: Include or exclude spent TXOs; combine with other filters for UTXO-like queries.
- **Pagination and ordering**: Use `limit`, `offset`, and `order` (`ASC` or `DESC`) for controlled result sets.

For security and efficiency, pair filters with `publicKey` when scoping to an owner, and apply `limit` / `offset` to manage result volume.

Syntactic sugar:

| Helper | Equivalent |
| --------------------------- | ------------------------------------------- |
| [`getUTXOs`](./getUTXOs.md) | `getTXOs({ …, isSpent: false })` |
| [`getOTXOs`](./getOTXOs.md) | `getTXOs({ …, isObject: true })` |
| [`getOUTXOs`](./getOUTXOs.md) | `getTXOs({ …, isObject: true, isSpent: false })` |

## Example

:::code source="../../../lib/test/lib/computer/get-txos.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-txos.test.ts" target=_blank>Source</a>

## See also

- Node HTTP: [get-txos](../../Node/get-txos.md)
- Sugar: [getUTXOs](./getUTXOs.md), [getOTXOs](./getOTXOs.md), [getOUTXOs](./getOUTXOs.md)
