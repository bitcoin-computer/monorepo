# Some bad patterns that we found

Require inside a function def in [src/transaction/sighash.js](https://github.com/the-bitcoin-token/BitcoinSource/blob/master/src/transaction/sighash.js#L139)

```
function sighash(transaction, sighashType, inputNumber, subscript, satoshisBN) {
  /* eslint-disable global-require */
  // TODO If this is moved in the global scope a bunch of tests fails. This is probably
  // due to a circular dependency. This file could probably use a major overhaul.
  // See GitHub isuse #42.
  import Transaction from './transaction'
  import Input from './input/input'
```

Dead code in [src/crypto/bn.js](https://github.com/the-bitcoin-token/BitcoinSource/pull/75/files#diff-7318cf02df7fd57cc2392bffec7369adR79)

```
if (natlen === opts.size) {
      buf = buf; // Looks like do nothing
    } else */ if (natlen > opts.size) {
      buf = BN.trim(buf, natlen);
    } else if (natlen < opts.size) {
      buf = BN.pad(buf, natlen, opts.size);
    }
```

The last line in the file [src/address.js](https://github.com/the-bitcoin-token/BitcoinSource/pull/80/files#diff-d388968ff4f0a9adeade95ac380637d2R650) is `const Script = require('./script')`. If we move this line to the top of the file then a lot of unit tests break.

In [src/address.js](https://github.com/the-bitcoin-token/BitcoinSource/pull/80/files#diff-d388968ff4f0a9adeade95ac380637d2R514) an object is constructed in a try catch block and not assigned to anything.

```
  var error;
  try {
    new Address(data, network, type);
  } catch (e) {
    error = e;
  }
```
