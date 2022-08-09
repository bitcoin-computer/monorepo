import bs58 from 'bs58'
import _ from 'lodash'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.split('')

const Base58 = function Base58(obj) {
  if (!(this instanceof Base58)) {
    return new Base58(obj)
  }
  if (Buffer.isBuffer(obj)) {
    const buf = obj
    this.fromBuffer(buf)
  } else if (typeof obj === 'string') {
    const str = obj
    this.fromString(str)
  } else if (obj) {
    this.set(obj)
  }
}

Base58.validCharacters = function validCharacters(chars) {
  if (Buffer.isBuffer(chars)) {
    chars = chars.toString()
  }
  return _.every(_.map(chars, (char) => _.includes(ALPHABET, char)))
}

Base58.prototype.set = function (obj) {
  this.buf = obj.buf || this.buf || undefined
  return this
}

Base58.encode = function (buf) {
  if (!Buffer.isBuffer(buf)) {
    throw new Error('Input should be a buffer')
  }
  return bs58.encode(buf)
}

Base58.decode = function (str) {
  if (typeof str !== 'string') {
    throw new Error('Input should be a string')
  }
  return Buffer.from(bs58.decode(str))
}

Base58.prototype.fromBuffer = function (buf) {
  this.buf = buf
  return this
}

Base58.prototype.fromString = function (str) {
  const buf = Base58.decode(str)
  this.buf = buf
  return this
}

Base58.prototype.toBuffer = function () {
  return this.buf
}

Base58.prototype.toString = function () {
  return Base58.encode(this.buf)
}

export default Base58
