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
