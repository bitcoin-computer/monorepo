---
order: 0
visibility: hidden
---

# How it works

Bitcoin had support for tokens before Ethereum existed. Tokens were built on colored coin protocols. Colored coins allow users to encode updates to data structures in Bitcoin transactions. Other users can parse these transactions to compute the latest state of the data structure. Each colored coin protocol comes with a fixed set of update types and only protocol developers can add new transaction types. This limits the speed at which applications can evolve.
The Bitcoin Computer is an improvement over previous colored coin protocols by supporting arbitrary user defined data types and all computable updates. This is achieved by simulating memory cells in unspent transaction outputs (utxos). When a memory cell is updated a Bitcoin transaction spends the utxo representing the old state of that memory cell and creates an utxo representing the new state.

The Bitcoin Computer creates a shared memory on the blockchain. This utxo based memory can do things that normal memory cannot do: utxos can store satoshis so that money can be stored in an atomic unit with data. Only users that can unlock the output script can spend a utxo. Thus the right to update data in the Bitcoin memory can also be restricted by Bitcoin Script. This leads to a natural notion of data ownership, enforced by Bitcoin's mining network.

Data structures and updates are specified in Javascript. When a new object is created, a transaction encoding the class and the arguments to the constructor is broadcast. When a function is called, the name of the function as well as its parameters are stored as metadata on a transaction. Other users can parse the transactions and compute the latest state of the data structure, just like in a traditional colored coin.

The computation required to evaluate smart contracts is shifted from the most expensive computing devices (blockchains) to the cheapest ones (user hardware). Users do not consider electricity cost for computation, even when running demanding software like games or video editing. Client side validation enables arbitrary computation at a fixed cost. This is the biggest advantage of smart contracts on Bitcoin as it will make it possible to build all applications, even compute intense ones, as smart contracts.

Like for all colored coins, users only need to perform computation for objects they are interested in. This makes it possible to run a smart contract that requires a supercomputer to evaluate without bothering other users.

Application development with the Bitcoin Computer can be compared to web development. The biggest difference is that Javascript objects can be persisted directly on the blockchain via the client side Bitcoin Computer library. This makes it possible to build applications without a server.
Plus it's cool to run smart contracts on Bitcoin.
