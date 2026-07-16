# Transaction

The `Transaction` class exported from `@bitcoin-computer/lib` extends the `Transaction` class exported from `@bitcoin-computer/nakamotojs` and therefore has all of its properties and methods (see [here](../../NakamotoJs/index.md)).

In addition it has methods and properties related to the Bitcoin Computer protocol, as well as convenience methods for developing Bitcoin-based applications.

## Properties

### <span class="mono">inRevs</span>

Returns the revisions of on-chain objects spent by the transaction.

### <span class="mono">outRevs</span>

Returns the revisions of on-chain objects created by the transaction.

## Methods

### <span class="mono">fromTxId</span>

``` -->

Returns a `Transaction` object from a transaction id.

<!-- ### <span class="mono">fromHex</span>

Returns a `Transaction` object from a transaction hex.

### <span class="mono">fromBuffer</span>

Returns a `Transaction` object from a transaction buffer. -->

### <span class="mono">onChainMetaData</span>

Returns a `Transaction` object from a transaction buffer.

## Example

```js
```
