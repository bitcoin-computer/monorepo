import _ from 'lodash'
import assert from 'assert'
import $ from './util/preconditions'
import Base58 from './encoding/base58'
import Base58Check from './encoding/base58check'
import BN from './crypto/bn'
import BufferUtil from './util/buffer'
import errors from './errors'
import Hash from './crypto/hash'
import HDPrivateKey from './hdprivatekey'
import JSUtil from './util/js'
import Network from './networks'
import Point from './crypto/point'
import PublicKey from './publickey'

const hdErrors = errors.HDPublicKey

/**
 * The representation of an hierarchically derived public key.
 *
 * See https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
 *
 * @constructor
 * @param {Object|string|Buffer} arg
 */
function HDPublicKey(arg) {
  if (arg instanceof HDPublicKey) {
    return arg
  }
  if (!(this instanceof HDPublicKey)) {
    return new HDPublicKey(arg)
  }
  if (arg) {
    if (_.isString(arg) || BufferUtil.isBuffer(arg)) {
      const error = HDPublicKey.getSerializedError(arg)
      if (!error) {
        return this._buildFromSerialized(arg)
      }
      if (BufferUtil.isBuffer(arg) && !HDPublicKey.getSerializedError(arg.toString())) {
        return this._buildFromSerialized(arg.toString())
      }
      if (error instanceof hdErrors.ArgumentIsPrivateExtended) {
        return new HDPrivateKey(arg).hdPublicKey
      }
      throw error
    } else {
      if (_.isObject(arg)) {
        if (arg instanceof HDPrivateKey) {
          return this._buildFromPrivate(arg)
        }
        return this._buildFromObject(arg)
      }
      throw new hdErrors.UnrecognizedArgument(arg)
    }
  } else {
    throw new hdErrors.MustSupplyArgument()
  }
}

/**
 * Verifies that a given path is valid.
 *
 * @param {string|number} arg
 * @return {boolean}
 */
HDPublicKey.isValidPath = function (arg) {
  if (_.isString(arg)) {
    const indexes = HDPrivateKey._getDerivationIndexes(arg)
    return indexes !== null && _.every(indexes, HDPublicKey.isValidPath)
  }

  if (_.isNumber(arg)) {
    return arg >= 0 && arg < HDPublicKey.Hardened
  }

  return false
}

/**
 * WARNING: This method is deprecated. Use deriveChild instead.
 *
 *
 * Get a derivated child based on a string or number.
 *
 * If the first argument is a string, it's parsed as the full path of
 * derivation. Valid values for this argument include "m" (which returns the
 * same public key), "m/0/1/40/2/1000".
 *
 * Note that hardened keys can't be derived from a public extended key.
 *
 * If the first argument is a number, the child with that index will be
 * derived. See the example usage for clarification.
 *
 * @example
 * ```javascript
 * var parent = new HDPublicKey('xpub...');
 * var child_0_1_2 = parent.derive(0).derive(1).derive(2);
 * var copy_of_child_0_1_2 = parent.derive("m/0/1/2");
 * assert(child_0_1_2.xprivkey === copy_of_child_0_1_2);
 * ```
 *
 * @param {string|number} arg
 */
HDPublicKey.prototype.derive = function (arg, hardened) {
  return this.deriveChild(arg, hardened)
}

/**
 * WARNING: This method will not be officially supported until v1.0.0.
 *
 *
 * Get a derivated child based on a string or number.
 *
 * If the first argument is a string, it's parsed as the full path of
 * derivation. Valid values for this argument include "m" (which returns the
 * same public key), "m/0/1/40/2/1000".
 *
 * Note that hardened keys can't be derived from a public extended key.
 *
 * If the first argument is a number, the child with that index will be
 * derived. See the example usage for clarification.
 *
 * @example
 * ```javascript
 * var parent = new HDPublicKey('xpub...');
 * var child_0_1_2 = parent.deriveChild(0).deriveChild(1).deriveChild(2);
 * var copy_of_child_0_1_2 = parent.deriveChild("m/0/1/2");
 * assert(child_0_1_2.xprivkey === copy_of_child_0_1_2);
 * ```
 *
 * @param {string|number} arg
 */
HDPublicKey.prototype.deriveChild = function (arg, hardened) {
  if (_.isNumber(arg)) {
    return this._deriveWithNumber(arg, hardened)
  }
  if (_.isString(arg)) {
    return this._deriveFromString(arg)
  }
  throw new hdErrors.InvalidDerivationArgument(arg)
}

HDPublicKey.prototype._deriveWithNumber = function (index, hardened) {
  if (index >= HDPublicKey.Hardened || hardened) {
    throw new hdErrors.InvalidIndexCantDeriveHardened()
  }
  if (index < 0) {
    throw new hdErrors.InvalidPath(index)
  }

  const indexBuffer = BufferUtil.integerAsBuffer(index)
  const data = BufferUtil.concat([this.publicKey.toBuffer(), indexBuffer])
  const hash = Hash.sha512hmac(data, this._buffers.chainCode)
  const leftPart = BN.fromBuffer(hash.slice(0, 32), { size: 32 })
  const chainCode = hash.slice(32, 64)

  let publicKey
  try {
    publicKey = PublicKey.fromPoint(Point.getG().mul(leftPart).add(this.publicKey.point))
  } catch (e) {
    return this._deriveWithNumber(index + 1)
  }

  const derived = new HDPublicKey({
    network: this.network,
    depth: this.depth + 1,
    parentFingerPrint: this.fingerPrint,
    childIndex: index,
    chainCode,
    publicKey,
  })

  return derived
}

HDPublicKey.prototype._deriveFromString = function (path) {
  if (_.includes(path, "'")) {
    throw new hdErrors.InvalidIndexCantDeriveHardened()
  } else if (!HDPublicKey.isValidPath(path)) {
    throw new hdErrors.InvalidPath(path)
  }

  const indexes = HDPrivateKey._getDerivationIndexes(path)
  const derived = indexes.reduce((prev, index) => prev._deriveWithNumber(index), this)

  return derived
}

/**
 * Verifies that a given serialized public key in base58 with checksum format
 * is valid.
 *
 * @param {string|Buffer} data - the serialized public key
 * @param {string|Network=} network - optional, if present, checks that the
 *     network provided matches the network serialized.
 * @return {boolean}
 */
HDPublicKey.isValidSerialized = function (data, network) {
  return _.isNull(HDPublicKey.getSerializedError(data, network))
}

/**
 * Checks what's the error that causes the validation of a serialized public key
 * in base58 with checksum to fail.
 *
 * @param {string|Buffer} data - the serialized public key
 * @param {string|Network=} network - optional, if present, checks that the
 *     network provided matches the network serialized.
 * @return {errors|null}
 */
HDPublicKey.getSerializedError = function (data, network) {
  if (!(_.isString(data) || BufferUtil.isBuffer(data))) {
    return new hdErrors.UnrecognizedArgument('expected buffer or string')
  }
  if (!Base58.validCharacters(data)) {
    return new errors.InvalidB58Char('(unknown)', data)
  }
  try {
    data = Base58Check.decode(data)
  } catch (e) {
    return new errors.InvalidB58Checksum(data)
  }
  if (data.length !== HDPublicKey.DataSize) {
    return new hdErrors.InvalidLength(data)
  }
  if (!_.isUndefined(network)) {
    const error = HDPublicKey._validateNetwork(data, network)
    if (error) {
      return error
    }
  }
  const version = BufferUtil.integerFromBuffer(data.slice(0, 4))
  if (version === Network.livenet.xprivkey || version === Network.testnet.xprivkey) {
    return new hdErrors.ArgumentIsPrivateExtended()
  }
  return null
}

HDPublicKey._validateNetwork = function (data, networkArg) {
  const network = Network.get(networkArg)
  if (!network) {
    return new errors.InvalidNetworkArgument(networkArg)
  }
  const version = data.slice(HDPublicKey.VersionStart, HDPublicKey.VersionEnd)
  if (BufferUtil.integerFromBuffer(version) !== network.xpubkey) {
    return new errors.InvalidNetwork(version)
  }
  return null
}

HDPublicKey.prototype._buildFromPrivate = function (arg) {
  const args = _.clone(arg._buffers)
  const point = Point.getG().mul(BN.fromBuffer(args.privateKey))
  args.publicKey = Point.pointToCompressed(point)
  args.version = BufferUtil.integerAsBuffer(
    Network.get(BufferUtil.integerFromBuffer(args.version)).xpubkey
  )
  args.privateKey = undefined
  args.checksum = undefined
  args.xprivkey = undefined
  return this._buildFromBuffers(args)
}

HDPublicKey.prototype._buildFromObject = function (arg) {
  // TODO: Type validation
  let publicKey
  if (_.isString(arg.publicKey)) {
    publicKey = BufferUtil.hexToBuffer(arg.publicKey)
  } else if (BufferUtil.isBuffer(arg.publicKey)) {
    ;({ publicKey } = arg)
  } else {
    publicKey = arg.publicKey.toBuffer()
  }

  const buffers = {
    version: arg.network
      ? BufferUtil.integerAsBuffer(Network.get(arg.network).xpubkey)
      : arg.version,
    depth: _.isNumber(arg.depth) ? BufferUtil.integerAsSingleByteBuffer(arg.depth) : arg.depth,
    parentFingerPrint: _.isNumber(arg.parentFingerPrint)
      ? BufferUtil.integerAsBuffer(arg.parentFingerPrint)
      : arg.parentFingerPrint,
    childIndex: _.isNumber(arg.childIndex)
      ? BufferUtil.integerAsBuffer(arg.childIndex)
      : arg.childIndex,
    chainCode: _.isString(arg.chainCode) ? BufferUtil.hexToBuffer(arg.chainCode) : arg.chainCode,
    publicKey,
    checksum: _.isNumber(arg.checksum) ? BufferUtil.integerAsBuffer(arg.checksum) : arg.checksum,
  }
  return this._buildFromBuffers(buffers)
}

HDPublicKey.prototype._buildFromSerialized = function (arg) {
  const decoded = Base58Check.decode(arg)
  const buffers = {
    version: decoded.slice(HDPublicKey.VersionStart, HDPublicKey.VersionEnd),
    depth: decoded.slice(HDPublicKey.DepthStart, HDPublicKey.DepthEnd),
    parentFingerPrint: decoded.slice(
      HDPublicKey.ParentFingerPrintStart,
      HDPublicKey.ParentFingerPrintEnd
    ),
    childIndex: decoded.slice(HDPublicKey.ChildIndexStart, HDPublicKey.ChildIndexEnd),
    chainCode: decoded.slice(HDPublicKey.ChainCodeStart, HDPublicKey.ChainCodeEnd),
    publicKey: decoded.slice(HDPublicKey.PublicKeyStart, HDPublicKey.PublicKeyEnd),
    checksum: decoded.slice(HDPublicKey.ChecksumStart, HDPublicKey.ChecksumEnd),
    xpubkey: arg,
  }
  return this._buildFromBuffers(buffers)
}

/**
 * Receives a object with buffers in all the properties and populates the
 * internal structure
 *
 * @param {Object} arg
 * @param {Buffer} arg.version
 * @param {Buffer} arg.depth
 * @param {Buffer} arg.parentFingerPrint
 * @param {Buffer} arg.childIndex
 * @param {Buffer} arg.chainCode
 * @param {Buffer} arg.publicKey
 * @param {Buffer} arg.checksum
 * @param {string=} arg.xpubkey - if set, don't recalculate the base58
 *      representation
 * @return {HDPublicKey} this
 */
HDPublicKey.prototype._buildFromBuffers = function (arg) {
  HDPublicKey._validateBufferArguments(arg)

  JSUtil.defineImmutable(this, {
    _buffers: arg,
  })

  const sequence = [
    arg.version,
    arg.depth,
    arg.parentFingerPrint,
    arg.childIndex,
    arg.chainCode,
    arg.publicKey,
  ]
  const concat = BufferUtil.concat(sequence)
  const checksum = Base58Check.checksum(concat)
  if (!arg.checksum || !arg.checksum.length) {
    arg.checksum = checksum
  } else if (arg.checksum.toString('hex') !== checksum.toString('hex')) {
    throw new errors.InvalidB58Checksum(concat, checksum)
  }
  const network = Network.get(BufferUtil.integerFromBuffer(arg.version))

  const xpubkey = Base58Check.encode(BufferUtil.concat(sequence))
  arg.xpubkey = Buffer.from(xpubkey)

  const publicKey = new PublicKey(arg.publicKey, { network })
  const size = HDPublicKey.ParentFingerPrintSize
  const fingerPrint = Hash.sha256ripemd160(publicKey.toBuffer()).slice(0, size)

  JSUtil.defineImmutable(this, {
    xpubkey,
    network,
    depth: BufferUtil.integerFromSingleByteBuffer(arg.depth),
    publicKey,
    fingerPrint,
  })

  return this
}

HDPublicKey._validateBufferArguments = function (arg) {
  const checkBuffer = function (name, size) {
    const buff = arg[name]
    assert(BufferUtil.isBuffer(buff), `${name} argument is not a buffer, it's ${typeof buff}`)
    assert(buff.length === size, `${name} size unexpected: found ${buff.length}, expected ${size}`)
  }
  checkBuffer('version', HDPublicKey.VersionSize)
  checkBuffer('depth', HDPublicKey.DepthSize)
  checkBuffer('parentFingerPrint', HDPublicKey.ParentFingerPrintSize)
  checkBuffer('childIndex', HDPublicKey.ChildIndexSize)
  checkBuffer('chainCode', HDPublicKey.ChainCodeSize)
  checkBuffer('publicKey', HDPublicKey.PublicKeySize)
  if (arg.checksum && arg.checksum.length) {
    checkBuffer('checksum', HDPublicKey.CheckSumSize)
  }
}

HDPublicKey.fromString = function (arg) {
  $.checkArgument(_.isString(arg), 'No valid string was provided')
  return new HDPublicKey(arg)
}

HDPublicKey.fromObject = function (arg) {
  $.checkArgument(_.isObject(arg), 'No valid argument was provided')
  return new HDPublicKey(arg)
}

/**
 * Returns the base58 checked representation of the public key
 * @return {string} a string starting with "xpub..." in livenet
 */
HDPublicKey.prototype.toString = function () {
  return this.xpubkey
}

/**
 * Returns the console representation of this extended public key.
 * @return string
 */
HDPublicKey.prototype.inspect = function () {
  return `<HDPublicKey: ${this.xpubkey}>`
}

/**
 * Returns a plain JavaScript object with information to reconstruct a key.
 *
 * Fields are: <ul>
 *  <li> network: 'livenet' or 'testnet'
 *  <li> depth: a number from 0 to 255, the depth to the master extended key
 *  <li> fingerPrint: a number of 32 bits taken from the hash of the public key
 *  <li> fingerPrint: a number of 32 bits taken from the hash of this key's
 *  <li>     parent's public key
 *  <li> childIndex: index with which this key was derived
 *  <li> chainCode: string in hexa encoding used for derivation
 *  <li> publicKey: string, hexa encoded, in compressed key format
 *  <li> checksum: BufferUtil.integerFromBuffer(this._buffers.checksum),
 *  <li> xpubkey: the string with the base58 representation of this extended key
 *  <li> checksum: the base58 checksum of xpubkey
 * </ul>
 */
HDPublicKey.prototype.toJSON = function toObject() {
  return {
    network: Network.get(BufferUtil.integerFromBuffer(this._buffers.version)).name,
    depth: BufferUtil.integerFromSingleByteBuffer(this._buffers.depth),
    fingerPrint: BufferUtil.integerFromBuffer(this.fingerPrint),
    parentFingerPrint: BufferUtil.integerFromBuffer(this._buffers.parentFingerPrint),
    childIndex: BufferUtil.integerFromBuffer(this._buffers.childIndex),
    chainCode: BufferUtil.bufferToHex(this._buffers.chainCode),
    publicKey: this.publicKey.toString(),
    checksum: BufferUtil.integerFromBuffer(this._buffers.checksum),
    xpubkey: this.xpubkey,
  }
}

HDPublicKey.prototype.toObject = HDPublicKey.prototype.toJSON

/**
 * Create a HDPublicKey from a buffer argument
 *
 * @param {Buffer} arg
 * @return {HDPublicKey}
 */
HDPublicKey.fromBuffer = function (arg) {
  return new HDPublicKey(arg)
}

/**
 * Return a buffer representation of the xpubkey
 *
 * @return {Buffer}
 */
HDPublicKey.prototype.toBuffer = function () {
  return BufferUtil.copy(this._buffers.xpubkey)
}

HDPublicKey.Hardened = 0x80000000
HDPublicKey.RootElementAlias = ['m', 'M']

HDPublicKey.VersionSize = 4
HDPublicKey.DepthSize = 1
HDPublicKey.ParentFingerPrintSize = 4
HDPublicKey.ChildIndexSize = 4
HDPublicKey.ChainCodeSize = 32
HDPublicKey.PublicKeySize = 33
HDPublicKey.CheckSumSize = 4

HDPublicKey.DataSize = 78
HDPublicKey.SerializedByteSize = 82

HDPublicKey.VersionStart = 0
HDPublicKey.VersionEnd = HDPublicKey.VersionStart + HDPublicKey.VersionSize
HDPublicKey.DepthStart = HDPublicKey.VersionEnd
HDPublicKey.DepthEnd = HDPublicKey.DepthStart + HDPublicKey.DepthSize
HDPublicKey.ParentFingerPrintStart = HDPublicKey.DepthEnd
HDPublicKey.ParentFingerPrintEnd =
  HDPublicKey.ParentFingerPrintStart + HDPublicKey.ParentFingerPrintSize
HDPublicKey.ChildIndexStart = HDPublicKey.ParentFingerPrintEnd
HDPublicKey.ChildIndexEnd = HDPublicKey.ChildIndexStart + HDPublicKey.ChildIndexSize
HDPublicKey.ChainCodeStart = HDPublicKey.ChildIndexEnd
HDPublicKey.ChainCodeEnd = HDPublicKey.ChainCodeStart + HDPublicKey.ChainCodeSize
HDPublicKey.PublicKeyStart = HDPublicKey.ChainCodeEnd
HDPublicKey.PublicKeyEnd = HDPublicKey.PublicKeyStart + HDPublicKey.PublicKeySize
HDPublicKey.ChecksumStart = HDPublicKey.PublicKeyEnd
HDPublicKey.ChecksumEnd = HDPublicKey.ChecksumStart + HDPublicKey.CheckSumSize

assert(HDPublicKey.PublicKeyEnd === HDPublicKey.DataSize)
assert(HDPublicKey.ChecksumEnd === HDPublicKey.SerializedByteSize)

export default HDPublicKey
