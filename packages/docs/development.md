---
order: -37
icon: beaker
visibility: hidden
---

# Development

## Troubleshooting

### Common Issues

#### `min relay fee not met` error

This error is thrown by the Bitcoin node. This error occurs when the transaction fee is lower than the minimum required by the network. In general, the parameter `satPerByte` is considered to build the transaction, but in some scenarios the mempool may require a higher fee to accept the transaction (e.g., large transactions with multiple signature operations). To resolve this, you can increase the transaction fee, modify the `satPerByte` parameter in your configuration.

#### `bad-txns-inputs-missingorspent` error

This error is thrown by the Bitcoin node. This error indicates that the transaction is missing an input or the input has already been spent. To fix this, ensure that all inputs are valid and not previously used in another transaction.

#### `Cannot call a function on a smart object that is pointed to` error

When you use a smart object as parameter (env) in some function, that function points to the object. Then, you cannot call a function if there is such a reference to the object. To solve this problem you will need to modify your contract function, and instead of passing the actual object, you can pass the revision and sync to the object in the same contract to get a read only copy of the object.