import hash from 'hash.js'

/**
 * PDKBF2
 * Credit to: https://github.com/stayradiated/pbkdf2-sha512
 * Copyright (c) 2014, JP Richardson Copyright (c) 2010-2011 Intalio Pte, All Rights Reserved
 */
function pbkdf2(key, salt, iterations, dkLen) {
  const hLen = 64 // SHA512 Mac length
  if (dkLen > (2 ** 32 - 1) * hLen) {
    throw Error('Requested key length too long')
  }

  if (typeof key !== 'string' && !Buffer.isBuffer(key)) {
    throw new TypeError('key must a string or Buffer')
  }

  if (typeof salt !== 'string' && !Buffer.isBuffer(salt)) {
    throw new TypeError('salt must a string or Buffer')
  }

  if (typeof key === 'string') {
    key = Buffer.from(key)
  }

  if (typeof salt === 'string') {
    salt = Buffer.from(salt)
  }

  const DK = Buffer.alloc(dkLen)

  let U = Buffer.alloc(hLen)
  const T = Buffer.alloc(hLen)
  const block1 = Buffer.alloc(salt.length + 4)

  const l = Math.ceil(dkLen / hLen)
  const r = dkLen - (l - 1) * hLen

  salt.copy(block1, 0, 0, salt.length)
  for (let i = 1; i <= l; i += 1) {
    block1[salt.length + 0] = (i >> 24) & 0xff
    block1[salt.length + 1] = (i >> 16) & 0xff
    block1[salt.length + 2] = (i >> 8) & 0xff
    block1[salt.length + 3] = (i >> 0) & 0xff

    const digest = hash.hmac(hash.sha512, key).update(block1).digest()
    U = Buffer.from(digest)

    U.copy(T, 0, 0, hLen)

    for (let j = 1; j < iterations; j += 1) {
      const innerDigest = hash.hmac(hash.sha512, key).update(U).digest()
      U = Buffer.from(innerDigest)

      for (let k = 0; k < hLen; k += 1) {
        T[k] ^= U[k]
      }
    }

    const destPos = (i - 1) * hLen
    const len = i === l ? r : hLen
    T.copy(DK, destPos, 0, len)
  }

  return DK
}

export default pbkdf2
