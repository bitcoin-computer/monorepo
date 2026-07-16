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

## Example

:::code source="../../../lib/test/lib/computer/get-ancestors.test.ts" :::

<a href="https://github.com/bitcoin-computer/monorepo/blob/main/packages/lib/test/lib/computer/get-ancestors.test.ts" target=_blank>Source</a>
