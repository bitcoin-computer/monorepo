import assert from 'assert'
import $ from './preconditions'
import js from './js'

function equals(a, b) {
  if (a.length !== b.length) {
    return false
  }
  const { length } = a
  for (let i = 0; i < length; i += 1) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}

const BufferUtil = {
  /**
   * Fill a buffer with a value.
   *
   * @param {Buffer} buff
   * @param {number} value
   * @return {Buffer}
   */
  fill: function fill(buff, value) {
    $.checkArgumentType(buff, 'Buffer', 'buffer')
    $.checkArgumentType(value, 'number', 'value')
    const { length } = buff
    for (let i = 0; i < length; i += 1) {
      buff[i] = value
    }
    return buff
  },

  /**
   * Return a copy of a buffer
   *
   * @param {Buffer} original
   * @return {Buffer}
   */
  copy(original) {
    const buff = Buffer.alloc(original.length)
    original.copy(buff)
    return buff
  },

  /**
   * Returns true if the given argument is an instance of a buffer. Tests for
   * both node's Buffer and Uint8Array
   *
   * @param {*} arg
   * @return {boolean}
   */
  isBuffer: function isBuffer(arg) {
    return Buffer.isBuffer(arg) || arg instanceof Uint8Array
  },

  /**
   * Returns a zero-filled byte array
   *
   * @param {number} bytes
   * @return {Buffer}
   */
  emptyBuffer: function emptyBuffer(bytes) {
    $.checkArgumentType(bytes, 'number', 'bytes')
    const result = Buffer.alloc(bytes)
    for (let i = 0; i < bytes; i += 1) {
      result.write('\0', i)
    }
    return result
  },

  /**
   * Concatenates a buffer
   *
   * Shortcut for <tt>Buffer.concat</tt>
   */
  concat: Buffer.concat,

  equals,
  equal: equals,

  /**
   * Transforms a number from 0 to 255 into a Buffer of size 1 with that value
   *
   * @param {number} integer
   * @return {Buffer}
   */
  integerAsSingleByteBuffer: function integerAsSingleByteBuffer(integer) {
    $.checkArgumentType(integer, 'number', 'integer')
    return Buffer.from([integer & 0xff])
  },

  /**
   * Transform a 4-byte integer into a Buffer of length 4.
   *
   * @param {number} integer
   * @return {Buffer}
   */
  integerAsBuffer: function integerAsBuffer(integer) {
    $.checkArgumentType(integer, 'number', 'integer')
    const bytes = []
    bytes.push((integer >> 24) & 0xff)
    bytes.push((integer >> 16) & 0xff)
    bytes.push((integer >> 8) & 0xff)
    bytes.push(integer & 0xff)
    return Buffer.from(bytes)
  },

  /**
   * Transform the first 4 values of a Buffer into a number, in little endian encoding
   *
   * @param {Buffer} buff
   * @return {number}
   */
  integerFromBuffer: function integerFromBuffer(buff) {
    $.checkArgumentType(buff, 'Buffer', 'buffer')
    return (buff[0] << 24) | (buff[1] << 16) | (buff[2] << 8) | buff[3]
  },

  /**
   * Transforms the first byte of an array into a number ranging from -128 to 127
   * @param {Buffer} buff
   * @return {number}
   */
  integerFromSingleByteBuffer: function integerFromBuffer(buff) {
    $.checkArgumentType(buff, 'Buffer', 'buffer')
    return buff[0]
  },

  /**
   * Transforms a buffer into a string with a number in hexa representation
   *
   * Shorthand for <tt>buffer.toString('hex')</tt>
   *
   * @param {Buffer} buff
   * @return {string}
   */
  bufferToHex: function bufferToHex(buff) {
    $.checkArgumentType(buff, 'Buffer', 'buffer')
    return buff.toString('hex')
  },

  /**
   * Reverse a buffer
   * @param {Buffer} param
   * @return {Buffer}
   */
  reverse: function reverse(param) {
    const ret = Buffer.alloc(param.length)
    for (let i = 0; i < param.length; i += 1) {
      ret[i] = param[param.length - i - 1]
    }
    return ret
  },

  /**
   * Transforms an hexa encoded string into a Buffer with binary values
   *
   * Shorthand for <tt>Buffer(string, 'hex')</tt>
   *
   * @param {string} string
   * @return {Buffer}
   */
  hexToBuffer: function hexToBuffer(string) {
    assert(js.isHexa(string))
    return Buffer.from(string, 'hex')
  },
}

BufferUtil.NULL_HASH = BufferUtil.fill(Buffer.alloc(32), 0)
BufferUtil.EMPTY_BUFFER = Buffer.alloc(0)

export default BufferUtil
