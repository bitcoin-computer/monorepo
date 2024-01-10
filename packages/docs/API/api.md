---
order: -40
---

# Computer API

The ``Computer`` class can create smart objects, query for the latest revision of these, and provides the basic functionalities of a Bitcoin wallet. The table below list all of it's methods.

<table>
  <tr>
    <th>&nbsp;</th>
    <th>Method</th>
    <th>Description</th>
  </tr>

  <tr>
    <td rowspan="4">Basic</td>
    <td><a href="/api/constructor/#constructor">constructor</a></td>
    <td>Creates an object of class Computer</td>
  </tr>

  <tr>
    <td><a href="/api/new/#new">new</a></td>
    <td>Creates a smart object from a smart contract</td>
  </tr>

  <tr>
    <td><a href="/api/sync/#sync">sync</a></td>
    <td>Computes the state of a smart object at a given revision</td>
  </tr>

  <tr>
    <td><a href="/api/query/#query">query</a></td>
    <td>Finds the latest revisions of smart object</td>
  </tr>


  <tr>
    <td rowspan="4">Advanced</td>
    <td><a href="/api/encode/#encode">encode</a></td>
    <td>Encodes a Javascript expression into a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="/api/decode/#decode">decode</a></td>
    <td>Decodes a Bitcoin transaction into a Javascript expression</td>
  </tr>

  <tr>
    <td><a href="/api/encodenew/#encodenew">encodeNew</a></td>
    <td>Encodes a constructor call into a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="/api/encodecall/#encodecall">encodeCall</a></td>
    <td>Encodes a function call into a Bitcoin transaction</td>
  </tr>


  <tr>
    <td rowspan="2">Modules</td>
    <td><a href="/api/deploy/#deploy">deploy</a></td>
    <td>Deploys an ES6 module on the blockchain</td>
  </tr>

  <tr>
    <td><a href="/api/load/#load">load</a></td>
    <td>Loads an ES6 module from the blockchain</td>
  </tr>


  <tr>
    <td rowspan="14">Wallet</td>
    <td><a href="/api/fund/#fund">fund</a></td>
    <td>Funds a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="/api/sign/#sign">sign</a></td>
    <td>Signs a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="/api/broadcast/#broadcast">broadcast</a></td>
    <td>Broadcasts a Bitcoin transaction</td>
  </tr>

  <tr>
    <td><a href="/api/send/#send">send</a></td>
    <td>Sends satoshis to an address</td>
  </tr>

  <tr>
    <td><a href="/api/rpcCall/#rpcCall">rpcCall</a></td>
    <td>Access Bitcoin's RPC interface</td>
  </tr>

  <tr>
    <td><a href="/api/getaddress/#getaddress">getAddress</a></td>
    <td>Returns the Bitcoin address of the computer wallet</td>
  </tr>

  <tr>
    <td><a href="/api/getbalance/#getbalance">getBalance</a></td>
    <td>Returns the balance in satoshi</td>
  </tr>

  <tr>
    <td><a href="/api/getchain/#getchain">getChain</a></td>
    <td>Returns the blockchain (BTC or LTC)</td>
  </tr>

  <tr>
    <td><a href="/api/getnetwork/#getnetwork">getNetwork</a></td>
    <td>Returns the network</td>
  </tr>

  <tr>
    <td><a href="/api/getmnemonic/#getmnemonic">getMnemonic</a></td>
    <td>Returns a BIP39 mnemonic sentence</td>
  </tr>

  <tr>
    <td><a href="/api/getpassphrase/#getpassphrase">getPassphrase</a></td>
    <td>Returns the passphrase</td>
  </tr>

  <tr>
    <td><a href="/api/getprivatekey/#getprivatekey">getPrivateKey</a></td>
    <td>Returns the private key</td>
  </tr>

  <tr>
    <td><a href="/api/getpublickey/#getpublickey">getPublicKey</a></td>
    <td>Returns the public key</td>
  </tr>

  <tr>
    <td><a href="/api/getUtxos/#getUtxos">getUtxos</a></td>
    <td>Returns an array of unspent transaction outputs</td>
  </tr>
</table>