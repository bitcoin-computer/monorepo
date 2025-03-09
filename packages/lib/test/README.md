# Bitcoin Computer Lib Tests

These tests are configured to run with a local Bitcoin Computer node. To start the node follow the README file of the [node](https://github.com/bitcoin-computer/monorepo/tree/main/packages/node#readme).

To run the tests against the node provided by us, update the definitions of `chain`, `network`, and `url` in the file `utils/index.ts` as shown below.

```ts
export const url = 'https://rltc.node.bitcoincomputer.io/'
export const chain = 'LTC'
export const network = 'regtest
```
