# getUtxos

_Returns UTXOs that do not contains on-chain objects._

## Type

```ts
getUtxos(address?: string): Promise<UTXO[]>
```

### Parameters

#### `address`

The address for which to return the UTXOs. If undefined, the UTXOs for the calling object are returned.

### Return value

Returns all unspent transaction outputs (UTXOs) of the address in question. The UTXOs are formatted as strings of the form `<transaction-id>:<output-number>`

## Description

The UTXOs returned are guaranteed to not contain any on-chain objects. This makes it possible to ensure to not spend on-chain objects by mistake.

## Examples

The first example shows that `getUtxos` returns all UTXOs that do not contains on-chain objects.

```ts
const computer = new Computer()
const computer2 = new Computer()
const txId1 = await computer.send(10000, computer2.getAddress())
const txId2 = await computer.send(10000, computer2.getAddress())

const utxos = await computer2.getUtxos()
expect(new Set(utxos)).deep.eq(new Set([`${txId1}:0`, `${txId2}:0`]))
```

The second example shows that `getUtxos` does not return UTXOs that contain on-chain objects.

```ts
class C extends Contract {}

const computer = new Computer()
const c = await computer.new(C)
const utxos = await computer.getUtxos()
expect(!utxos.some((item) => item === c._id))
```
