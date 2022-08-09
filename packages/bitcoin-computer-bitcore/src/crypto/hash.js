import hash from 'hash.js'
import $ from '../util/preconditions'
import BufferUtil from '../util/buffer'

const Hash = {}

Hash.sha1 = function (buf) {
  $.checkArgument(BufferUtil.isBuffer(buf))
  const digest = hash.sha1().update(buf).digest('hex')
  return Buffer.from(digest, 'hex')
}

Hash.sha1.blocksize = 512

Hash.sha256 = function (buf) {
  $.checkArgument(BufferUtil.isBuffer(buf))
  const digest = hash.sha256().update(buf).digest('hex')
  return Buffer.from(digest, 'hex')
}

Hash.sha256.blocksize = 512

Hash.sha256sha256 = function (buf) {
  $.checkArgument(BufferUtil.isBuffer(buf))
  return Hash.sha256(Hash.sha256(buf))
}

Hash.ripemd160 = function (buf) {
  $.checkArgument(BufferUtil.isBuffer(buf))
  const digest = hash.ripemd160().update(buf).digest('hex')
  return Buffer.from(digest, 'hex')
}

Hash.sha256ripemd160 = function (buf) {
  $.checkArgument(BufferUtil.isBuffer(buf))
  return Hash.ripemd160(Hash.sha256(buf))
}

Hash.sha512 = function (buf) {
  $.checkArgument(BufferUtil.isBuffer(buf))
  const digest = hash.sha512().update(buf).digest('hex')
  return Buffer.from(digest, 'hex')
}

Hash.sha512.blocksize = 1024

Hash.hmac = function (hashf, data, key) {
  // http://en.wikipedia.org/wiki/Hash-based_message_authentication_code
  // http://tools.ietf.org/html/rfc4868#section-2
  $.checkArgument(BufferUtil.isBuffer(data))
  $.checkArgument(BufferUtil.isBuffer(key))
  $.checkArgument(hashf.blocksize)

  const blocksize = hashf.blocksize / 8

  if (key.length > blocksize) {
    key = hashf(key)
  } else if (key < blocksize) {
    const fill = Buffer.alloc(blocksize)
    fill.fill(0)
    key.copy(fill)
    key = fill
  }

  const oKey = Buffer.alloc(blocksize)
  oKey.fill(0x5c)

  const iKey = Buffer.alloc(blocksize)
  iKey.fill(0x36)

  const oKeyPad = Buffer.alloc(blocksize)
  const iKeyPad = Buffer.alloc(blocksize)
  for (let i = 0; i < blocksize; i += 1) {
    oKeyPad[i] = oKey[i] ^ key[i]
    iKeyPad[i] = iKey[i] ^ key[i]
  }

  return hashf(Buffer.concat([oKeyPad, hashf(Buffer.concat([iKeyPad, data]))]))
}

Hash.sha256hmac = function (data, key) {
  return Hash.hmac(Hash.sha256, data, key)
}

Hash.sha512hmac = function (data, key) {
  return Hash.hmac(Hash.sha512, data, key)
}

export default Hash
