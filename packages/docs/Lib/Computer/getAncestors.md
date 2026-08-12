# getAncestors

Returns the transactions id history of the given revision.

## Type

```ts
getAncestors(location: string, verbosity?: number): Promise<string[] | Map<string, string>>
```

### Return Value

Given a location (revision or transaction id), returns a promise that resolves to an array of transaction ids representing the history of the given revision. If verbosity is set to 1, it returns a map where the keys are transaction ids and the values are their corresponding transaction hex strings.

### Syntax

```js
computer.getAncestors(rev)
computer.getAncestors(rev, 1)
```

### Inside smart contracts (`InnerComputer`)

- Starting location must be **confirmed**.
- Empty arrays are valid stable results when there are no ancestors.
- Missing or unconfirmed starts invalidate the evaluation.
- Verbosity maps are a client-side convenience; contracts typically use the default `string[]` form.

See [Contract – Querying](../Contract/index.md#querying-inside-of-a-contract).

## Example

:::code source="../../../lib/test/lib/computer/get-ancestors.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-ancestors.test.ts" target=_blank>Source</a>
