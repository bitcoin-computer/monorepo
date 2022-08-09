# Bitcoin Computer Bitcore Examples

## Generate a random address

```javascript
import Bitcoin from 'bitcoin-source'

const privateKey = new Bitcoin.PrivateKey()
const address = privateKey.toAddress()

console.log(address.toString()) // 15WZwpw3BofscM2u43ji85BXucai5YGToL
```

## Generate a address from a SHA256 hash

```javascript
import Bitcoin from 'bitcoin-source'

const value = Buffer.from('Bitcoin Cash - Peer-to-Peer Electronic Cash')
const hash = Bitcoin.crypto.Hash.sha256(value)
const bn = Bitcoin.crypto.BN.fromBuffer(hash)
const address = new Bitcoin.PrivateKey(bn).toAddress()

console.log(address.toString()) // 126tFHmNHNAXDYT1QeEBEwBbEojib1VZyg
```

## Translate an address to any Bitcoin Cash address format

```javascript
import Bitcoin from 'bitcoin-source'

const Address = Bitcoin.Address
const BitpayFormat = Address.BitpayFormat
const CashAddrFormat = Address.CashAddrFormat

const address = new Address('1MF7A5H2nHYYJMieouip2SkZiFZMBKqSZe')

console.log(address.toString()) // 1MF7A5H2nHYYJMieouip2SkZiFZMBKqSZe
console.log(address.toString(BitpayFormat)) // Cchzj7d6fLX5CVd5Vf3jbxNbLNmm4BTYuG
console.log(address.toString(CashAddrFormat)) // bitcoincash:qr0q67nsn66cf3klfufttr0vuswh3w5nt5jqpp20t9
```

## Read an address from any Bitcoin Cash address format

```javascript
import Bitcoin from 'bitcoin-source'

const Address = Bitcoin.Address
const fromString = Address.fromString
const BitpayFormat = Address.BitpayFormat
const CashAddrFormat = Address.CashAddrFormat

const legacy = fromString('1MF7A5H2nHYYJMieouip2SkZiFZMBKqSZe', 'livenet', 'pubkeyhash')
const bitpay = fromString(
  'Cchzj7d6fLX5CVd5Vf3jbxNbLNmm4BTYuG',
  'livenet',
  'pubkeyhash',
  BitpayFormat
)
const cashaddr = fromString(
  'bitcoincash:qr0q67nsn66cf3klfufttr0vuswh3w5nt5jqpp20t9',
  'livenet',
  'pubkeyhash',
  CashAddrFormat
)
```

## Import an address via WIF

```javascript
import Bitcoin from 'bitcoin-source'

const wif = 'Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct'
const address = new Bitcoin.PrivateKey(wif).toAddress()

console.log(address.toString()) // 19AAjaTUbRjQCMuVczepkoPswiZRhjtg31
```

## Create a Transaction

```javascript
import Bitcoin from 'bitcoin-source'

const privateKey = new Bitcoin.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy')
const utxo = {
  txId: '115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986',
  outputIndex: 0,
  address: '17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV',
  script: '76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac',
  satoshis: 50000,
}
const transaction = new Bitcoin.Transaction()
  .from(utxo)
  .to('1Gokm82v6DmtwKEB8AiVhm82hyFSsEvBDK', 15000)
  .sign(privateKey)

console.log(transaction.toString()) // 01000000018689302ea03ef...
```

## Verify a Bitcoin message

```javascript
import Bitcoin from 'bitcoin-source'

const Message = Bitcoin.Message

const message = new Message('Bitcoin Cash - Peer-to-Peer Electronic Cash.')
const address = '13Js7D3q4KvfSqgKN8LpNq57gcahrVc5JZ'
const signature =
  'IJuZCwN/4HtIRulOb/zRLU1oCPVMiPvT5dJhgXxOuQNFaXoytoejPePUerSs9KSIvPL/BDimPe2cj/JabeDGmbc='

console.log(message.verify(address, signature)) // true
```

## Sign a Bitcoin message

```javascript
import Bitcoin from 'bitcoin-source'

const Message = Bitcoin.Message

const message = new Message('Bitcoin Cash - Peer-to-Peer Electronic Cash.')
const privateKey = new Bitcoin.PrivateKey('L23PpjkBQqpAF4vbMHNfTZAb3KFPBSawQ7KinFTzz7dxq6TZX8UA')
const signature = message.sign(privateKey)

console.log(signature.toString()) // IJuZCwN/4HtIRulOb/zRLU1oCP...
```

## Create an OP RETURN transaction

```javascript
import Bitcoin from 'bitcoin-source'

const privateKey = new Bitcoin.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy')
const utxo = {
  txId: '115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986',
  outputIndex: 0,
  address: '17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV',
  script: '76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac',
  satoshis: 50000,
}
const transaction = new Bitcoin.Transaction()
  .from(utxo)
  .addData('Bitcoin Cash - Peer-to-Peer Electronic Cash.') // Add OP_RETURN data
  .sign(privateKey)

console.log(transaction.toString()) // 01000000018689302ea03ef...
```

## Create a 2-of-3 multisig P2SH address

```javascript
import Bitcoin from 'bitcoin-source'

const publicKeys = [
  '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
  '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
  '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
]
const requiredSignatures = 2
const address = new Bitcoin.Address(publicKeys, requiredSignatures)

console.log(address.toString()) // 36NUkt6FWUi3LAWBqWRdDmdTWbt91Yvfu7
```

## Spend from a 2-of-2 multisig P2SH address

```javascript
import Bitcoin from 'bitcoin-source'

const privateKeys = [
  new Bitcoin.PrivateKey('91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjJoQFacbgwmaKkrx'),
  new Bitcoin.PrivateKey('91avARGdfge8E4tZfYLoxeJ5sGBdNJQH4kvjJoQFacbgww7vXtT'),
]
const publicKeys = privateKeys.map(Bitcoin.PublicKey)
const address = new Bitcoin.Address(publicKeys, 2) // 2 of 2
const utxo = {
  txId: '153068cdd81b73ec9d8dcce27f2c77ddda12dee3db424bff5cafdbe9f01c1756',
  outputIndex: 0,
  address: address.toString(),
  script: new Bitcoin.Script(address).toHex(),
  satoshis: 20000,
}
const transaction = new Bitcoin.Transaction()
  .from(utxo, publicKeys, 2)
  .to('mtoKs9V381UAhUia3d7Vb9GNak8Qvmcsme', 20000)
  .sign(privateKeys)

console.log(transaction.toString()) // 010000000156171cf0e9dba...
```
