import _ from 'lodash'
import $ from '../util/preconditions'
import BN from './bn'
import BufferUtil from '../util/buffer'
import Hash from './hash'
import Point from './point'
import PublicKey from '../publickey'
import Random from './random'
import Signature from './signature'

const ECDSA = function ECDSA(obj) {
  if (!(this instanceof ECDSA)) {
    return new ECDSA(obj)
  }
  if (obj) {
    this.set(obj)
  }
}

ECDSA.prototype.set = function (obj) {
  this.hashbuf = obj.hashbuf || this.hashbuf
  this.endian = obj.endian || this.endian // the endianness of hashbuf
  this.privkey = obj.privkey || this.privkey
  this.pubkey = obj.pubkey || (this.privkey ? this.privkey.publicKey : this.pubkey)
  this.sig = obj.sig || this.sig
  this.k = obj.k || this.k
  this.verified = obj.verified || this.verified
  return this
}

ECDSA.prototype.privkey2pubkey = function () {
  this.pubkey = this.privkey.toPublicKey()
}

ECDSA.prototype.calci = function () {
  for (let i = 0; i < 4; i += 1) {
    this.sig.i = i
    let Qprime
    try {
      Qprime = this.toPublicKey()

      if (Qprime.point.eq(this.pubkey.point)) {
        this.sig.compressed = this.pubkey.compressed
        return this
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  this.sig.i = undefined
  throw new Error('Unable to find valid recovery factor')
}

ECDSA.fromString = function (str) {
  const obj = JSON.parse(str)
  return new ECDSA(obj)
}

ECDSA.prototype.randomK = function () {
  const N = Point.getN()
  let k
  do {
    k = BN.fromBuffer(Random.getRandomBuffer(32))
  } while (!(k.lt(N) && k.gt(BN.Zero)))
  this.k = k
  return this
}

// https://tools.ietf.org/html/rfc6979#section-3.2
ECDSA.prototype.deterministicK = function (badrs) {
  // if r or s were invalid when this function was used in signing,
  // we do not want to actually compute r, s here for efficiency, so,
  // we can increment badrs. explained at end of RFC 6979 section 3.2
  if (_.isUndefined(badrs)) {
    badrs = 0
  }
  let v = Buffer.alloc(32)
  v.fill(0x01)
  let k = Buffer.alloc(32)
  k.fill(0x00)
  const x = this.privkey.bn.toBuffer({
    size: 32,
  })
  const hashbuf = this.endian === 'little' ? BufferUtil.reverse(this.hashbuf) : this.hashbuf
  k = Hash.sha256hmac(Buffer.concat([v, Buffer.from([0x00]), x, hashbuf]), k)
  v = Hash.sha256hmac(v, k)
  k = Hash.sha256hmac(Buffer.concat([v, Buffer.from([0x01]), x, hashbuf]), k)
  v = Hash.sha256hmac(v, k)
  v = Hash.sha256hmac(v, k)
  let T = BN.fromBuffer(v)
  const N = Point.getN()

  // also explained in 3.2, we must ensure T is in the proper range (0, N)
  for (let i = 0; i < badrs || !(T.lt(N) && T.gt(BN.Zero)); i += 1) {
    k = Hash.sha256hmac(Buffer.concat([v, Buffer.from([0x00])]), k)
    v = Hash.sha256hmac(v, k)
    v = Hash.sha256hmac(v, k)
    T = BN.fromBuffer(v)
  }

  this.k = T
  return this
}

// Information about public key recovery:
// https://bitcointalk.org/index.php?topic=6430.0
// http://stackoverflow.com/questions/19665491/how-do-i-get-an-ecdsa-public-key-from-just-a-bitcoin-signature-sec1-4-1-6-k
ECDSA.prototype.toPublicKey = function () {
  const { i } = this.sig
  $.checkArgument(i === 0 || i === 1 || i === 2 || i === 3, 'i must be equal to 0, 1, 2, or 3')

  const e = BN.fromBuffer(this.hashbuf)
  const { r } = this.sig
  const { s } = this.sig

  // A set LSB signifies that the y-coordinate is odd
  const isYOdd = i & 1

  // The more significant bit specifies whether we should use the
  // first or second candidate key.
  const isSecondKey = i >> 1

  const n = Point.getN()
  const G = Point.getG()

  // 1.1 Let x = r + jn
  const x = isSecondKey ? r.add(n) : r
  const R = Point.fromX(isYOdd, x)

  // 1.4 Check that nR is at infinity
  const nR = R.mul(n)

  if (!nR.isInfinity()) {
    throw new Error('nR is not a valid curve point')
  }

  // Compute -e from e
  const eNeg = e.neg().umod(n)

  // 1.6.1 Compute Q = r^-1 (sR - eG)
  // Q = r^-1 (sR + -eG)
  const rInv = r.invm(n)

  // var Q = R.multiplyTwo(s, G, eNeg).mul(rInv);
  const Q = R.mul(s).add(G.mul(eNeg)).mul(rInv)

  const pubkey = PublicKey.fromPoint(Q, this.sig.compressed)

  return pubkey
}

ECDSA.prototype.sigError = function () {
  if (!BufferUtil.isBuffer(this.hashbuf) || this.hashbuf.length !== 32) {
    return 'hashbuf must be a 32 byte buffer'
  }

  const { r } = this.sig
  const { s } = this.sig
  if (!(r.gt(BN.Zero) && r.lt(Point.getN())) || !(s.gt(BN.Zero) && s.lt(Point.getN()))) {
    return 'r and s not in range'
  }

  const e = BN.fromBuffer(
    this.hashbuf,
    this.endian
      ? {
          endian: this.endian,
        }
      : undefined
  )
  const n = Point.getN()
  const sinv = s.invm(n)
  const u1 = sinv.mul(e).umod(n)
  const u2 = sinv.mul(r).umod(n)

  const p = Point.getG().mulAdd(u1, this.pubkey.point, u2)
  if (p.isInfinity()) {
    return 'p is infinity'
  }

  if (p.getX().umod(n).cmp(r) !== 0) {
    return 'Invalid signature'
  }
  return false
}

ECDSA.toLowS = function (s) {
  // enforce low s
  // see BIP 62, "low S values in signatures"
  const maxS = '7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0'
  if (s.gt(BN.fromBuffer(Buffer.from(maxS, 'hex')))) {
    s = Point.getN().sub(s)
  }
  return s
}

ECDSA.prototype._findSignature = function (d, e) {
  const N = Point.getN()
  const G = Point.getG()
  // try different values of k until r, s are valid
  let badrs = 0
  let Q
  let r
  let s
  do {
    if (!this.k || badrs > 0) {
      this.deterministicK(badrs)
    }
    badrs += 1
    const { k } = this
    Q = G.mul(k)
    r = Q.x.umod(N)
    s = k
      .invm(N)
      .mul(e.add(d.mul(r)))
      .umod(N)
  } while (r.cmp(BN.Zero) <= 0 || s.cmp(BN.Zero) <= 0)

  s = ECDSA.toLowS(s)
  return {
    s,
    r,
  }
}

ECDSA.prototype.sign = function () {
  const { hashbuf } = this
  const { privkey } = this
  const d = privkey.bn

  $.checkState(hashbuf && privkey && d, 'invalid parameters')
  $.checkState(BufferUtil.isBuffer(hashbuf), 'hashbuf must be a buffer')
  $.checkState(hashbuf.length === 32, 'hashbuf must be 32 bytes')

  const e = BN.fromBuffer(
    hashbuf,
    this.endian
      ? {
          endian: this.endian,
        }
      : undefined
  )

  const obj = this._findSignature(d, e)
  obj.compressed = this.pubkey.compressed

  this.sig = new Signature(obj)
  return this
}

ECDSA.prototype.signRandomK = function () {
  this.randomK()
  return this.sign()
}

ECDSA.prototype.toString = function () {
  const obj = {}
  if (this.hashbuf) {
    obj.hashbuf = this.hashbuf.toString('hex')
  }
  if (this.privkey) {
    obj.privkey = this.privkey.toString()
  }
  if (this.pubkey) {
    obj.pubkey = this.pubkey.toString()
  }
  if (this.sig) {
    obj.sig = this.sig.toString()
  }
  if (this.k) {
    obj.k = this.k.toString()
  }
  return JSON.stringify(obj)
}

ECDSA.prototype.verify = function () {
  if (!this.sigError()) {
    this.verified = true
  } else {
    this.verified = false
  }
  return this
}

ECDSA.sign = function (hashbuf, privkey, endian) {
  return ECDSA()
    .set({
      hashbuf,
      endian,
      privkey,
    })
    .sign().sig
}

ECDSA.verify = function (hashbuf, sig, pubkey, endian) {
  return ECDSA()
    .set({
      hashbuf,
      endian,
      sig,
      pubkey,
    })
    .verify().verified
}

export default ECDSA
