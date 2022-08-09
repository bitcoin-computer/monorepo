import _ from 'lodash'
import cashaddr from 'cashaddrjs'
import $ from './util/preconditions'
import Base58Check from './encoding/base58check'
import errors from './errors'
import Hash from './crypto/hash'
import JSUtil from './util/js'
import Networks from './networks'
import PublicKey from './publickey'
import Script from './script/script'

const BITPAY_P2PKH_VERSION_BYTE = 28
const BITPAY_P2SH_VERSION_BYTE = 40

/**
 * Instantiate an address from an address String or Buffer, a public key or
 * script hash Buffer, or an instance of {@link PublicKey} or {@link Script}.
 *
 * This is an immutable class, and if the first parameter provided to this
 * constructor is an `Address` instance, the same argument will be returned.
 *
 * An address has two key properties: `network` and `type`. The type is either
 * `Address.PayToPublicKeyHash` (value is the `'pubkeyhash'` string) or
 * `Address.PayToScriptHash` (the string `'scripthash'`). The network is an
 * instance of {@link Network}. You can quickly check whether an address is of a
 * given kind by using the methods `isPayToPublicKeyHash` and
 * `isPayToScriptHash`
 *
 * @example
 * ```javascript
 * // validate that an input field is valid
 * var error = Address.getValidationError(input, 'testnet');
 * if (!error) {
 *   var address = Address(input, 'testnet');
 * } else {
 *   // invalid network or checksum (typo?)
 *   var message = error.messsage;
 * }
 *
 * // get an address from a public key
 * var address = Address(publicKey, 'testnet').toString();
 * ```
 *
 * @param {*} data - The encoded data in various formats
 * @param {Network|String|number=} network - The network: 'livenet' or 'testnet'
 * @param {string=} type - The type of address: 'script' or 'pubkey'
 * @returns {Address} A new valid and frozen instance of an Address
 * @constructor
 */

class Address {
  constructor(data, network, type) {
    if (!(this instanceof Address)) {
      return new Address(data, network, type)
    }

    if (_.isArray(data) && _.isNumber(network)) {
      return Address.createMultisig(data, network, type)
    }

    if (data instanceof Address) {
      // Immutable instance
      return data
    }

    $.checkArgument(data, 'Address data required in first argument.', 'guide/address.html')

    if (network && !Networks.get(network)) {
      throw new TypeError('Second argument must be "livenet" or "testnet".')
    }

    if (type && type !== Address.PayToPublicKeyHash && type !== Address.PayToScriptHash) {
      throw new TypeError('Third argument must be "pubkeyhash" or "scripthash".')
    }

    const info = Address._classifyArguments(data, network, type)

    // set defaults if not set
    info.network = info.network || Networks.get(network) || Networks.defaultNetwork
    info.type = info.type || type || Address.PayToPublicKeyHash

    JSUtil.defineImmutable(this, {
      hashBuffer: info.hashBuffer,
      network: info.network,
      type: info.type,
    })
  }

  /**
   * Internal function used to split different kinds of arguments of the constructor
   * @param {*} data - The encoded data in various formats
   * @param {Network|String|number=} network - The network: 'livenet' or 'testnet'
   * @param {string=} type - The type of address: 'script' or 'pubkey'
   * @returns {Object} An "info" object with "type", "network", and "hashBuffer"
   */
  static _classifyArguments(data, network, type) {
    // transform and validate input data
    if ((data instanceof Buffer || data instanceof Uint8Array) && data.length === 20) {
      return Address._transformHash(data)
    }
    if ((data instanceof Buffer || data instanceof Uint8Array) && data.length === 21) {
      return Address._transformBuffer(data, network, type)
    }
    if (data instanceof PublicKey) {
      return Address._transformPublicKey(data)
    }
    // eslint-disable-next-line no-use-before-define
    if (data instanceof Script) {
      return Address._transformScript(data, network)
    }
    if (typeof data === 'string') {
      return Address._transformString(data, network, type, Address.DefaultFormat)
    }
    if (_.isObject(data)) {
      return Address._transformObject(data)
    }
    throw new TypeError('First argument is an unrecognized data format.')
  }

  /**
   * @param {Buffer} hash - An instance of a hash Buffer
   * @returns {Object} An object with keys: hashBuffer
   * @private
   */
  static _transformHash(hash) {
    const info = {}
    if (!(hash instanceof Buffer) && !(hash instanceof Uint8Array)) {
      throw new TypeError('Address supplied is not a buffer.')
    }
    if (hash.length !== 20) {
      throw new TypeError('Address hashbuffers must be exactly 20 bytes.')
    }
    info.hashBuffer = hash
    return info
  }

  /**
   * Deserializes an address serialized through `Address#toObject()`
   * @param {Object} data
   * @param {string} data.hash - the hash that this address encodes
   * @param {string} data.type - either 'pubkeyhash' or 'scripthash'
   * @param {Network=} data.network - the name of the network associated
   * @return {Address}
   */
  static _transformObject(data) {
    $.checkArgument(data.hash || data.hashBuffer, 'Must provide a `hash` or `hashBuffer` property')
    $.checkArgument(data.type, 'Must provide a `type` property')
    return {
      hashBuffer: data.hash ? Buffer.from(data.hash, 'hex') : data.hashBuffer,
      network: Networks.get(data.network) || Networks.defaultNetwork,
      type: data.type,
    }
  }

  /**
   * Internal function to discover the network and type based on the first data byte
   *
   * @param {Buffer} buffer - An instance of a hex encoded address Buffer
   * @returns {Object} An object with keys: network and type
   * @private
   */
  static _classifyFromVersion(buffer) {
    const version = {}

    const pubkeyhashNetwork = Networks.get(buffer[0], 'pubkeyhash')
    const scripthashNetwork = Networks.get(buffer[0], 'scripthash')

    if (pubkeyhashNetwork) {
      version.network = pubkeyhashNetwork
      version.type = this.PayToPublicKeyHash
    } else if (scripthashNetwork) {
      version.network = scripthashNetwork
      version.type = this.PayToScriptHash
    }

    return version
  }

  /**
   * Internal function to transform a bitcoin address buffer
   *
   * @param {Buffer} buffer - An instance of a hex encoded address Buffer
   * @param {string=} network - The network: 'livenet' or 'testnet'
   * @param {string=} type - The type: 'pubkeyhash' or 'scripthash'
   * @returns {Object} An object with keys: hashBuffer, network and type
   * @private
   */
  static _transformBuffer(buffer, network, type) {
    const info = {}
    if (!(buffer instanceof Buffer) && !(buffer instanceof Uint8Array)) {
      throw new TypeError('Address supplied is not a buffer.')
    }
    if (buffer.length !== 1 + 20) {
      throw new TypeError('Address buffers must be exactly 21 bytes.')
    }

    network = Networks.get(network)
    const bufferVersion = Address._classifyFromVersion(buffer)

    if (!bufferVersion.network || (network && network !== bufferVersion.network)) {
      throw new TypeError('Address has mismatched network type.')
    }

    if (!bufferVersion.type || (type && type !== bufferVersion.type)) {
      throw new TypeError('Address has mismatched type.')
    }

    info.hashBuffer = buffer.slice(1)
    info.network = bufferVersion.network
    info.type = bufferVersion.type
    return info
  }

  /**
   * Internal function to transform a {@link PublicKey}
   *
   * @param {PublicKey} pubkey - An instance of PublicKey
   * @returns {Object} An object with keys: hashBuffer, type
   * @private
   */
  static _transformPublicKey(pubkey) {
    const info = {}
    if (!(pubkey instanceof PublicKey)) {
      throw new TypeError('Address must be an instance of PublicKey.')
    }
    info.hashBuffer = Hash.sha256ripemd160(pubkey.toBuffer())
    info.type = this.PayToPublicKeyHash
    return info
  }

  /**
   * Internal function to transform a {@link Script} into a `info` object.
   *
   * @param {Script} script - An instance of Script
   * @returns {Object} An object with keys: hashBuffer, type
   * @private
   */
  static _transformScript(script, network) {
    // eslint-disable-next-line no-use-before-define
    $.checkArgument(script instanceof Script, 'script must be a Script instance')
    const info = script.getAddressInfo(network)
    if (!info) {
      throw new errors.Script.CantDeriveAddress(script)
    }
    return info
  }

  /**
   * Creates a P2SH address from a set of public keys and a threshold.
   *
   * The addresses will be sorted lexicographically, as that is the trend in bitcoin.
   * To create an address from unsorted public keys, use the {@link Script#buildMultisigOut}
   * interface.
   *
   * @param {Array} publicKeys - a set of public keys to create an address
   * @param {number} threshold - the number of signatures needed to release the funds
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @param {boolean=} nestedWitness - if the address uses a nested p2sh witness
   * @return {Address}
   */
  static createMultisig(publicKeys, threshold, network, nestedWitness) {
    network = network || publicKeys[0].network || Networks.defaultNetwork
    const redeemScript = Script.buildMultisigOut(publicKeys, threshold);
    if (nestedWitness) {
      return Address.payingTo(Script.buildWitnessMultisigOutFromScript(redeemScript), network);
    }
    return Address.payingTo(redeemScript, network);
  }

  /**
   * Internal function to transform a bitcoin address string
   *
   * @param {string} data
   * @param {String|Network=} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string=} type - The type: 'pubkeyhash' or 'scripthash'
   * @param {string} format - The format: 'legacy', 'bitpay' or 'cashaddr'
   * @returns {Object} An object with keys: hashBuffer, network and type
   * @private
   */
  static _transformString(data, network, type, format) {
    if (typeof data !== 'string') {
      throw new TypeError('data parameter supplied is not a string.')
    }
    data = data.trim()
    if (format === this.LegacyFormat) {
      return this._transformStringLegacy(data, network, type)
    }
    if (format === this.BitpayFormat) {
      return this._transformStringBitpay(data, network, type)
    }
    if (format === this.CashAddrFormat) {
      return this._transformStringCashAddr(data, network, type)
    }
    throw new TypeError('Unrecognized address format.')
  }

  /**
   * Internal function to transform a bitcoin address string in legacy format
   *
   * @param {string} data
   * @param {String|Network=} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string=} type - The type: 'pubkeyhash' or 'scripthash'
   * @returns {Object} An object with keys: hashBuffer, network and type
   * @private
   */
  static _transformStringLegacy(data, network, type) {
    const addressBuffer = Base58Check.decode(data)
    return this._transformBuffer(addressBuffer, network, type)
  }

  /**
   * Internal function to transform a bitcoin address string in Bitpay format
   *
   * @param {string} data
   * @param {String|Network=} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string=} type - The type: 'pubkeyhash' or 'scripthash'
   * @returns {Object} An object with keys: hashBuffer, network and type
   * @private
   */
  static _transformStringBitpay(data, network, type) {
    const addressBuffer = Base58Check.decode(data)
    if (addressBuffer[0] === BITPAY_P2PKH_VERSION_BYTE) {
      addressBuffer[0] = 0
    } else if (addressBuffer[0] === BITPAY_P2SH_VERSION_BYTE) {
      addressBuffer[0] = 5
    }
    return this._transformBuffer(addressBuffer, network, type)
  }

  /**
   * Internal function to transform a bitcoin address string in CashAddr format
   *
   * @param {string} data
   * @param {String|Network=} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string=} type - The type: 'pubkeyhash' or 'scripthash'
   * @returns {Object} An object with keys: hashBuffer, network and type
   * @private
   */
  static _transformStringCashAddr(data, network, type) {
    if (!(typeof network === 'string')) {
      network = network.toString()
    }
    const decoded = cashaddr.decode(data)
    $.checkArgument(
      !network ||
        (network === 'livenet' && decoded.prefix === 'bitcoincash') ||
        (network === 'testnet' && decoded.prefix === 'bchtest'),
      'Invalid network.'
    )
    $.checkArgument(
      !type ||
        (type === this.PayToPublicKeyHash && decoded.type === 'P2PKH') ||
        (type === this.PayToScriptHash && decoded.type === 'P2SH'),
      'Invalid type.'
    )
    network = Networks.get(network || (decoded.prefix === 'bitcoincash' ? 'livenet' : 'testnet'))
    type = type || (decoded.type === 'P2PKH' ? this.PayToPublicKeyHash : this.PayToScriptHash)
    const version = Buffer.from([network[type]])
    const hashBuffer = Buffer.from(decoded.hash)
    const addressBuffer = Buffer.concat([version, hashBuffer])
    return this._transformBuffer(addressBuffer, network, type)
  }

  /**
   * Instantiate an address from a PublicKey instance
   *
   * @param {PublicKey} data
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromPublicKey(data, network) {
    const info = this._transformPublicKey(data)
    network = network || Networks.defaultNetwork
    return new Address(info.hashBuffer, network, info.type)
  }

  /**
   * Instantiate an address from a ripemd160 public key hash
   *
   * @param {Buffer} hash - An instance of buffer of the hash
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromPublicKeyHash(hash, network) {
    const info = this._transformHash(hash)
    return new Address(info.hashBuffer, network, this.PayToPublicKeyHash)
  }

  /**
   * Instantiate an address from a ripemd160 script hash
   *
   * @param {Buffer} hash - An instance of buffer of the hash
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromScriptHash(hash, network) {
    $.checkArgument(hash, 'hash parameter is required')
    const info = this._transformHash(hash)
    return new Address(info.hashBuffer, network, this.PayToScriptHash)
  }

  /**
   * Builds a p2sh address paying to script. This will hash the script and
   * use that to create the address.
   * If you want to extract an address associated with a script instead,
   * see {{Address#fromScript}}
   *
   * @param {Script} script - An instance of Script
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static payingTo(script, network) {
    $.checkArgument(script, 'script is required')
    // eslint-disable-next-line no-use-before-define
    $.checkArgument(script instanceof Script, 'script must be instance of Script')

    return this.fromScriptHash(Hash.sha256ripemd160(script.toBuffer()), network)
  }

  /**
   * Extract address from a Script. The script must be of one
   * of the following types: p2pkh input, p2pkh output, p2sh input
   * or p2sh output.
   * This will analyze the script and extract address information from it.
   * If you want to transform any script to a p2sh Address paying
   * to that script's hash instead, use {{Address#payingTo}}
   *
   * @param {Script} script - An instance of Script
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromScript(script, network) {
    // eslint-disable-next-line no-use-before-define
    $.checkArgument(script instanceof Script, 'script must be a Script instance')
    const info = this._transformScript(script, network)
    return new Address(info.hashBuffer, network, info.type)
  }

  /**
   * Instantiate an address from a buffer of the address
   *
   * @param {Buffer} buffer - An instance of buffer of the address
   * @param {String|Network=} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string=} type - The type of address: 'script' or 'pubkey'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromBuffer(buffer, network, type) {
    const info = this._transformBuffer(buffer, network, type)
    return new Address(info.hashBuffer, info.network, info.type)
  }

  /**
   * Instantiate an address from an address string
   *
   * @param {string} str - An string of the bitcoin address
   * @param {String|Network=} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string=} type - The type of address: 'script' or 'pubkey'
   * @param {string=} format - The format: 'legacy', 'bitpay' or 'cashaddr'
   * @returns {Address} A new valid and frozen instance of an Address
   */
  static fromString(str, network, type, format) {
    format = format || this.DefaultFormat
    const info = this._transformString(str, network, type, format)
    return new Address(info.hashBuffer, info.network, info.type)
  }

  /**
   * Instantiate an address from an Object
   *
   * @param {string} json - An JSON string or Object with keys: hash, network and type
   * @returns {Address} A new valid instance of an Address
   */

  static fromObject(obj) {
    $.checkState(JSUtil.isHexa(obj.hash), `Unexpected hash, "${obj.hash}", expected to be hex.`)
    const hashBuffer = Buffer.from(obj.hash, 'hex')
    return new Address(hashBuffer, obj.network, obj.type)
  }

  /**
   * Will return a validation error if exists
   *
   * @example
   * ```javascript
   * // a network mismatch error
   * var error = this.getValidationError('15vkcKf7gB23wLAnZLmbVuMiiVDc1Nm4a2', 'testnet');
   * ```
   *
   * @param {string} data - The encoded data
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string} type - The type of address: 'script' or 'pubkey'
   * @returns {null|Error} The corresponding error message
   */
  static getValidationError(data, network, type) {
    let error
    try {
      // eslint-disable-next-line no-new
      new Address(data, network, type)
    } catch (e) {
      error = e
    }
    return error
  }

  /**
   * Will return a boolean if an address is valid
   *
   * @example
   * ```javascript
   * assert(this.isValid('15vkcKf7gB23wLAnZLmbVuMiiVDc1Nm4a2', 'livenet'));
   * ```
   *
   * @param {string} data - The encoded data
   * @param {String|Network} network - either a Network instance, 'livenet', or 'testnet'
   * @param {string} type - The type of address: 'script' or 'pubkey'
   * @returns {boolean} The corresponding error message
   */
  static isValid(data, network, type) {
    return !this.getValidationError(data, network, type)
  }

  /**
   * Returns true if an address is of pay to public key hash type
   * @return boolean
   */
  isPayToPublicKeyHash() {
    return this.type === Address.PayToPublicKeyHash
  }

  /**
   * Returns true if an address is of pay to script hash type
   * @return boolean
   */
  isPayToScriptHash() {
    return this.type === Address.PayToScriptHash
  }

  /**
   * Will return a buffer representation of the address
   *
   * @returns {Buffer} Bitcoin address buffer
   */
  toBuffer() {
    const version = Buffer.from([this.network[this.type]])
    const buf = Buffer.concat([version, this.hashBuffer])
    return buf
  }

  /**
   * @returns {Object} A plain object with the address information
   */

  toObject() {
    return {
      hash: this.hashBuffer.toString('hex'),
      type: this.type,
      network: this.network.toString(),
    }
  }

  toJSON() {
    return this.toObject()
  }

  /**
   * Will return a the string representation of the address
   *
   * @param {string=} format - The format: 'legacy', 'bitpay' or 'cashaddr'
   * @returns {string} Bitcoin address
   */
  toString(format) {
    format = format || Address.DefaultFormat
    if (format === Address.LegacyFormat) {
      return this._toStringLegacy()
    }
    if (format === Address.BitpayFormat) {
      return this._toStringBitpay()
    }
    if (format === Address.CashAddrFormat) {
      return this._toStringCashAddr()
    }
    throw new TypeError('Unrecognized address format.')
  }

  /**
   * Will return a the string representation of the address in legacy format
   *
   * @returns {string} Bitcoin address
   */
  _toStringLegacy() {
    return Base58Check.encode(this.toBuffer())
  }

  /**
   * Will return a the string representation of the address in Bitpay format
   *
   * @returns {string} Bitcoin address
   */
  _toStringBitpay() {
    const buffer = this.toBuffer()
    if (this.network.toString() === 'livenet') {
      if (this.type === Address.PayToPublicKeyHash) {
        buffer[0] = BITPAY_P2PKH_VERSION_BYTE
      } else if (this.type === Address.PayToScriptHash) {
        buffer[0] = BITPAY_P2SH_VERSION_BYTE
      }
    }
    return Base58Check.encode(buffer)
  }

  /**
   * Will return a the string representation of the address in CashAddr format
   *
   * @returns {string} Bitcoin address
   */
  _toStringCashAddr() {
    const prefix = this.network.toString() === 'livenet' ? 'bitcoincash' : 'bchtest'
    const type = this.type === Address.PayToPublicKeyHash ? 'P2PKH' : 'P2SH'
    return cashaddr.encode(prefix, type, this.hashBuffer)
  }

  /**
   * Will return a string formatted for the console
   *
   * @returns {string} Bitcoin address
   */
  inspect() {
    return `<Address: ${this.toString()}, type: ${this.type}, network: ${this.network}>`
  }
}

Address.LegacyFormat = 'legacy'
Address.BitpayFormat = 'bitpay'
Address.CashAddrFormat = 'cashaddr'
Address.DefaultFormat = Address.LegacyFormat

Address.PayToPublicKeyHash = 'pubkeyhash'
Address.PayToScriptHash = 'scripthash'

export default Address
