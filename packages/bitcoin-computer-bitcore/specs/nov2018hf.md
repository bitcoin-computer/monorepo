# November 2018 Hard Fork Support

## Problem

BitcoinSource currently only supports an older version of BCH. The library works for basic transactions, but it does not support many of the new opcodes since May 2018, and it also does not support BSV after the November 2018 fork. This is one of the items preventing BitcoinToken from working on the BSV chain and generally it would be better if the library were up-to-date.

## Proposal

This document proposes to update the Bitcoin Source library to support both BCH and BSV chains after the November 2018 hard fork. Normally this would make maintenance more difficult but BSV is not planning any further hard forks. Supporting both chains should be doable. To our awareness, there are no other libraries that do this today.

### New Top-Level Functions: bsv() and bch()

These two new functions will be the new module exports. The user will be expected to call one of the two, and it will return the module exports currently returned today. In addition, they will also set various internal flags and constants that change the behavior of each chain.

Example:

```
const bsv = require('bitcoin-source').bsv();
const privateKey = new bsv.PrivateKey();
const address = privateKey.toAddress();
```

This requires changing bitcoinsource.js to create two exported functions: bsv() and bch(). Each will call a third private function, bitcoinsource(), that creates today's exports (crypto, Address, Block, etc.). Then each function will set the appropriate flags the customize the behavior of those classes for the particular chain.

### Update Network Seeds

The BCH and BSV network seeds are now different and will need to be updated. We suggest that the default behavior in network.js be to set the BSV network seeds and the BCH seeds be overridden in bitcoinsource.js. We suggest having two constant arrays in networks.js for the BCH mainnet and testnet seeds so that bitcoinsource.js can simply write:

```
function bch() {
 let bitcoinsource = bitcoinsource();
 bitcoinsource.Networks.livenet.dnsSeeds = BCH_MAINNET_DNS_SEEDS;
 bitcoinsource.Networks.testnet.dnsSeeds = BCH_TESTNET_DNS_SEEDS;
 return bitcoinsource;
}
```

The BSV network seeds for mainnet are:

- seed.bitcoinsv.io
- seed.cascharia.com
- seed.satoshisvision.network

The BSV network seeds for testnet are:

- stn-seed.bitcoinsv.io

The BCH network seeds remain the same.

_Note: Many BSV seeds also return BCH nodes. This unfortunately makes connecting to nodes more difficul, but we will not make any changes in the BitcoinSource library for now. This is because BSV has proposed replay protection soon and clients may simply check the user agents upon connecting_

### Ensure Signature Hashing Uses the Correct Fork ID

The BCH chain now sets a fork ID of 1. We should make sure the code applies this correctly during signature hashing, and also that the BSV chain uses the correct value too. This will require some investigation. It likely requires creating a new FORK_ID flag in sighash.js and applying it.

## Action Items

_Note: Each code change requires a new test case._

#### High Priority

- [ ] Replace top-level exports with bsv() and bch() functions
- [ ] Update network seeds
- [ ] Update documentation for chains
- [ ] Ensure signature hashing uses the correct fork id

#### Medium Priority

- [ ] Update max block size and flag to enable

#### Low Priority

- [ ] Make internal code comments chain-agnostic
- [ ] Add support for May 2018 opcodes
- [ ] Add OP_CHECKDATASIG and OP_CHECKDATASIGVERIFY and flags to enable (BCH)
- [ ] Enforce minimum transaction size with flag to enable (BCH)
- [ ] Enforce push-only rule for scriptSig with flag to enable (BCH)
- [ ] Enforce clean stack rule with flag to enable (BCH)
- [ ] Add OP_MUL and flag to enable (BSV)
- [ ] Add OP_INVERT and flag to enable (BSV)
- [ ] Add OP_LSHIFT and flag to enable (BSV)
- [ ] Add OP_RSHIFT and flag to enable (BSV)
- [ ] Increase MAX_SCRIPT_OPS if necessary with flag to enable (BSV)
- [ ] Increase DATA_CARRIER_SIZE if necessary with flag to enable (BSV)

#### Not Relevant

- [ ] Add support for CTOR validation and flag to enable (BCH)
- [ ] Add support for TTOR validation and flag to enable (BSV)

## Additional Information

### Add Support for May 2018 Opcodes

Currently these opcodes exist but are not implemented in interpreter.js. We must implement them and also remove them from the disabled list. The bcash project implementation may serve as an example.

### OP_CHECKDATASIG and OP_CHECKDATASIGVERIFY

Recommendations

- Add these two opcodes (186 and 187) must be added in opcodes.js.
- Create a new flag Interpreter.CHECK_DATA_SIG_ENABLED in interpreter.js.
- Set CHECK_DATA_SIG_ENABLED correctly in bch() and bsv() in bitcoinsource.js.
- Delete these opcodes in bsv() in bitcoinsource.js
- Update Interpreter.step() to process these new opcides when CHECK_DATA_SIG_ENABLED is true.

See the official spec for all implementation details.

### Transaction Ordering

There is currently no work to be done because transaction order is not checked by this library.

### Update Block Size

The block cap is defined in MAX_BLOCK_SIZE in block.js. Currently it is set to 1MB for BTC and needs to be updated for both chains.

Recommendations

- Set Block.MAX_BLOCK_SIZE to 32000000 in bch() in bitcionsource.js.
- Set Block.MAX_BLOCK_SIZE to 128000000 in bsv() in bitcionsource.js.
- Delete MAX_BLOCK_SIZE in transaction.js.

### Enforce minimum transaction size

Recommendations

- Create a new flag in transaction.js called MINIMUM_TRANSACTION_SIZE.
- Set this flag to 100 for bch() in bitcoinsource.js.
- Set this flag to 0 for bsv() in bitcoinsource.js.
- Add a check in Transaction.verify() that ensures the transaction size is greater than or equal to this value.

### Enforce Push-Only Rule for ScriptSig

Recommendations

- Create a new flag in transaction.js called ENFORCE_PUSH_ONLY_FOR_SCRIPT_SIG.
- Set this flag to true for bch() in bitcoinsource.js.
- Set this flag to false for bsv() in bitcoinsource.js.
- Check the script sig only contains opcodes less than or equal to 96 in Transaction.verify(). See the BCH Nov 18 HF spec.

### Enforce Clean Stack Rule

Recommendations

- Create a new flag in interpreter.js called Interpreter.ENFORCE_CLEAN_STACK.
- Set this flag to true for bch() in bitcoinsource.js.
- Set this flag to false for bsv() in bitcoinsource.js.
- Check that the stack is empty at the end of Interpreter.evaluate() and if not return false.

### Increase Max Script Ops

Recommendations

- Create a new flag in interpreter.js called MAX_SCRIPT_OPS
- Set this flag to 201 for bch() in bitcoinsource.js
- Set this flag to 500 for bsv() in bitcoinsource.js
- Check this flag in interpreter.js() instead of checking for 201 directly.

### Increase Data Carrier Size

Recommendations

- Create a new flag in transaction.js called DATA_CARRIER_SIZE.
- Set this flag to 223 for bch() in bitcoinsource.js.
- Set this flag to 100000 for bsv() in bitcoinsource.js.
- Add a check in Transaction.verify() that ensures that pk_scripts that start with OP_RETURN are lengths less than or equal to the DATA_CARRIER_SIZE.

### OP_MUL, OP_INVERT, OP_LSHIFT, OP_RSHIFT

These must all be implemented according to the spec and removed from the disabled list in interpreter.js. In addition, flags should be created for each similar to OP_CHECKDATASIG so that they may be enabled in bsv() and disabled in bch() in bitcoinsource.js. The bcoinsv project may serve as an example.
