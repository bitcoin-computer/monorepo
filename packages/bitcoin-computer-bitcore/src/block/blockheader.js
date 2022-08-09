import _ from 'lodash'
import $ from '../util/preconditions'
import BN from '../crypto/bn'
import BufferReader from '../encoding/bufferreader'
import BufferWriter from '../encoding/bufferwriter'
import BufferUtil from '../util/buffer'
import Hash from '../crypto/hash'

const GENESIS_BITS = 0x1d00ffff

/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */

class BlockHeader {
  constructor(arg) {
    if (!(this instanceof BlockHeader)) {
      return new BlockHeader(arg)
    }
    const info = BlockHeader._from(arg)
    this.version = info.version
    this.prevHash = info.prevHash
    this.merkleRoot = info.merkleRoot
    this.time = info.time
    this.timestamp = info.time
    this.bits = info.bits
    this.nonce = info.nonce

    if (info.hash) {
      $.checkState(this.hash === info.hash, 'Argument object hash does not match block hash.')
    }

    return this
  }

  /**
   * @param {*} - A Buffer, JSON string or Object
   * @returns {Object} - An object representing block header data
   * @throws {TypeError} - If the argument was not recognized
   * @private
   */
  static _from(arg) {
    let info = {}
    if (BufferUtil.isBuffer(arg)) {
      info = BlockHeader._fromBufferReader(BufferReader(arg))
    } else if (_.isObject(arg)) {
      info = BlockHeader._fromObject(arg)
    } else {
      throw new TypeError('Unrecognized argument for BlockHeader')
    }
    return info
  }

  /**
   * @param {Object} - A JSON string
   * @returns {Object} - An object representing block header data
   * @private
   */
  static _fromObject(data) {
    $.checkArgument(data, 'data is required')
    let { prevHash } = data
    let { merkleRoot } = data
    if (_.isString(data.prevHash)) {
      prevHash = BufferUtil.reverse(Buffer.from(data.prevHash, 'hex'))
    }
    if (_.isString(data.merkleRoot)) {
      merkleRoot = BufferUtil.reverse(Buffer.from(data.merkleRoot, 'hex'))
    }
    const info = {
      hash: data.hash,
      version: data.version,
      prevHash,
      merkleRoot,
      time: data.time,
      timestamp: data.time,
      bits: data.bits,
      nonce: data.nonce,
    }
    return info
  }

  /**
   * @param {Object} - A plain JavaScript object
   * @returns {BlockHeader} - An instance of block header
   */
  static fromObject(obj) {
    const info = this._fromObject(obj)
    return new BlockHeader(info)
  }

  /**
   * @param {Binary} - Raw block binary data or buffer
   * @returns {BlockHeader} - An instance of block header
   */
  static fromRawBlock(data) {
    if (!BufferUtil.isBuffer(data)) {
      data = Buffer.from(data, 'binary')
    }
    const br = BufferReader(data)
    br.pos = BlockHeader.Constants.START_OF_HEADER
    const info = this._fromBufferReader(br)
    return new BlockHeader(info)
  }

  /**
   * @param {Buffer} - A buffer of the block header
   * @returns {BlockHeader} - An instance of block header
   */
  static fromBuffer(buf) {
    const info = this._fromBufferReader(BufferReader(buf))
    return new BlockHeader(info)
  }

  /**
   * @param {string} - A hex encoded buffer of the block header
   * @returns {BlockHeader} - An instance of block header
   */
  static fromString(str) {
    const buf = Buffer.from(str, 'hex')
    return this.fromBuffer(buf)
  }

  /**
   * @param {BufferReader} - A BufferReader of the block header
   * @returns {Object} - An object representing block header data
   * @private
   */
  static _fromBufferReader(br) {
    const info = {}
    info.version = br.readInt32LE()
    info.prevHash = br.read(32)
    info.merkleRoot = br.read(32)
    info.time = br.readUInt32LE()
    info.bits = br.readUInt32LE()
    info.nonce = br.readUInt32LE()
    return info
  }

  /**
   * @param {BufferReader} - A BufferReader of the block header
   * @returns {BlockHeader} - An instance of block header
   */
  static fromBufferReader(br) {
    const info = this._fromBufferReader(br)
    return new BlockHeader(info)
  }

  /**
   * @returns {Object} - A plain object of the BlockHeader
   */
  toJSON() {
    return {
      hash: this.hash,
      version: this.version,
      prevHash: BufferUtil.reverse(this.prevHash).toString('hex'),
      merkleRoot: BufferUtil.reverse(this.merkleRoot).toString('hex'),
      time: this.time,
      bits: this.bits,
      nonce: this.nonce,
    }
  }

  toObject() {
    return this.toJSON()
  }

  /**
   * @returns {Buffer} - A Buffer of the BlockHeader
   */
  toBuffer() {
    return this.toBufferWriter().concat()
  }

  /**
   * @returns {string} - A hex encoded string of the BlockHeader
   */
  toString() {
    return this.toBuffer().toString('hex')
  }

  /**
   * @param {BufferWriter} - An existing instance BufferWriter
   * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader
   */
  toBufferWriter(bw) {
    if (!bw) {
      bw = new BufferWriter()
    }
    bw.writeInt32LE(this.version)
    bw.write(this.prevHash)
    bw.write(this.merkleRoot)
    bw.writeUInt32LE(this.time)
    bw.writeUInt32LE(this.bits)
    bw.writeUInt32LE(this.nonce)
    return bw
  }

  /**
   * Returns the target difficulty for this block
   * @param {Number} bits
   * @returns {BN} An instance of BN with the decoded difficulty bits
   */
  getTargetDifficulty(bits) {
    bits = bits || this.bits

    let target = new BN(bits & 0xffffff)
    let mov = 8 * ((bits >>> 24) - 3)
    while (mov > 0) {
      target = target.mul(new BN(2))
      mov -= 1
    }
    return target
  }

  /**
   * @link https://en.bitcoin.it/wiki/Difficulty
   * @return {Number}
   */
  getDifficulty() {
    const difficulty1TargetBN = this.getTargetDifficulty(GENESIS_BITS).mul(new BN(10 ** 8))
    const currentTargetBN = this.getTargetDifficulty()

    let difficultyString = difficulty1TargetBN.div(currentTargetBN).toString(10)
    const decimalPos = difficultyString.length - 8
    const leftOfDecimal = `${difficultyString.slice(0, decimalPos)}`
    const rightOfDecimal = `${difficultyString.slice(decimalPos)}`
    difficultyString = `${leftOfDecimal}.${rightOfDecimal}`

    return parseFloat(difficultyString)
  }

  /**
   * @returns {Buffer} - The little endian hash buffer of the header
   */
  _getHash() {
    const buf = this.toBuffer()
    return Hash.sha256sha256(buf)
  }

  /**
   * @returns {Boolean} - If timestamp is not too far in the future
   */
  validTimestamp() {
    const currentTime = Math.round(new Date().getTime() / 1000)
    if (this.time > currentTime + BlockHeader.Constants.MAX_TIME_OFFSET) {
      return false
    }
    return true
  }

  /**
   * @returns {Boolean} - If the proof-of-work hash satisfies the target difficulty
   */
  validProofOfWork() {
    const pow = new BN(this.id, 'hex')
    const target = this.getTargetDifficulty()

    if (pow.cmp(target) > 0) {
      return false
    }
    return true
  }

  /**
   * @returns {string} - A string formatted for the console
   */
  inspect() {
    return `<BlockHeader ${this.id}>`
  }
}

const idProperty = {
  configurable: false,
  enumerable: true,
  /**
   * @returns {string} - The big endian hash buffer of the header
   */
  get() {
    if (!this._id) {
      this._id = BufferReader(this._getHash()).readReverse().toString('hex')
    }
    return this._id
  },
  set: _.noop,
}
Object.defineProperty(BlockHeader.prototype, 'id', idProperty)
Object.defineProperty(BlockHeader.prototype, 'hash', idProperty)

BlockHeader.Constants = {
  START_OF_HEADER: 8, // Start buffer position in raw block data
  MAX_TIME_OFFSET: 2 * 60 * 60, // The max a timestamp can be in the future
  LARGEST_HASH: new BN('10000000000000000000000000000000000000000000000000000000000000000', 'hex'),
}

export default BlockHeader
