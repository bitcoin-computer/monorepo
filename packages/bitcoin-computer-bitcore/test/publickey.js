import chai from 'chai'
import { Bitcoin } from './bitcoin'

const should = chai.should()
const { expect } = chai
const { Point } = Bitcoin.crypto
const { BN } = Bitcoin.crypto
const { PublicKey } = Bitcoin
const { PrivateKey } = Bitcoin
const { Address } = Bitcoin
const { Networks } = Bitcoin

describe('PublicKey', () => {
  const invalidPoint =
    '0400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'

  describe('validating errors on creation', () => {
    it('errors if data is missing', () => {
      ;(function () {
        return new PublicKey()
      }.should.throw('First argument is required, please include public key data.'))
    })

    it('errors if an invalid point is provided', () => {
      ;(function () {
        return new PublicKey(invalidPoint)
      }.should.throw('Point does not lie on the curve.'))
    })

    it('errors if a point not on the secp256k1 curve is provided', () => {
      ;(function () {
        return new PublicKey(new Point(1000, 1000))
      }.should.throw('Point does not lie on the curve.'))
    })

    it('errors if the argument is of an unrecognized type', () => {
      ;(function () {
        return new PublicKey(new Error())
      }.should.throw('First argument is an unrecognized data format.'))
    })
  })

  describe('instantiation', () => {
    it('from a private key', () => {
      const privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff'
      const pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc'
      const privkey = new PrivateKey(new BN(Buffer.from(privhex, 'hex')))
      const pk = new PublicKey(privkey)
      pk.toString().should.equal(pubhex)
    })

    it('problematic secp256k1 public keys', () => {
      const knownKeys = [
        {
          wif: 'KzsjKq2FVqVuQv2ueHVFuB65A9uEZ6S1L6F8NuokCrE3V3kE3Ack',
          priv: '6d1229a6b24c2e775c062870ad26bc261051e0198c67203167273c7c62538846',
          pub: '03d6106302d2698d6a41e9c9a114269e7be7c6a0081317de444bb2980bf9265a01',
          pubx: 'd6106302d2698d6a41e9c9a114269e7be7c6a0081317de444bb2980bf9265a01',
          puby: 'e05fb262e64b108991a29979809fcef9d3e70cafceb3248c922c17d83d66bc9d',
        },
        {
          wif: 'L5MgSwNB2R76xBGorofRSTuQFd1bm3hQMFVf3u2CneFom8u1Yt7G',
          priv: 'f2cc9d2b008927db94b89e04e2f6e70c180e547b3e5e564b06b8215d1c264b53',
          pub: '03e275faa35bd1e88f5df6e8f9f6edb93bdf1d65f4915efc79fd7a726ec0c21700',
          pubx: 'e275faa35bd1e88f5df6e8f9f6edb93bdf1d65f4915efc79fd7a726ec0c21700',
          puby: '367216cb35b086e6686d69dddd822a8f4d52eb82ac5d9de18fdcd9bf44fa7df7',
        },
      ]

      for (let i = 0; i < knownKeys.length; i++) {
        const privkey = new PrivateKey(knownKeys[i].wif)
        const pubkey = privkey.toPublicKey()
        pubkey.toString().should.equal(knownKeys[i].pub)
        pubkey.point.x.toString('hex').should.equal(knownKeys[i].pubx)
        pubkey.point.y.toString('hex').should.equal(knownKeys[i].puby)
      }
    })

    it('from a compressed public key', () => {
      const publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'
      const publicKey = new PublicKey(publicKeyHex)
      publicKey.toString().should.equal(publicKeyHex)
    })

    it('from another publicKey', () => {
      const publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'
      const publicKey = new PublicKey(publicKeyHex)
      const publicKey2 = new PublicKey(publicKey)
      publicKey.should.equal(publicKey2)
    })

    it('sets the network to defaultNetwork if none provided', () => {
      const publicKeyHex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'
      const publicKey = new PublicKey(publicKeyHex)
      publicKey.network.should.equal(Networks.defaultNetwork)
    })

    it('from a hex encoded DER string', () => {
      const pk = new PublicKey(
        '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341'
      )
      should.exist(pk.point)
      pk.point
        .getX()
        .toString(16)
        .should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
    })

    it('from a hex encoded DER buffer', () => {
      const pk = new PublicKey(
        Buffer.from(
          '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341',
          'hex'
        )
      )
      should.exist(pk.point)
      pk.point
        .getX()
        .toString(16)
        .should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
    })

    it('from a point', () => {
      const p = new Point(
        '86a80a5a2bfc48dddde2b0bd88bd56b0b6ddc4e6811445b175b90268924d7d48',
        '3b402dfc89712cfe50963e670a0598e6b152b3cd94735001cdac6794975d3afd'
      )
      const a = new PublicKey(p)
      should.exist(a.point)
      a.point.toString().should.equal(p.toString())
      const c = new PublicKey(p)
      should.exist(c.point)
      c.point.toString().should.equal(p.toString())
    })
  })

  describe('#getValidationError', () => {
    it('should recieve an invalid point error', () => {
      const error = PublicKey.getValidationError(invalidPoint)
      should.exist(error)
      error.message.should.equal('Point does not lie on the curve.')
    })

    it('should recieve a boolean as false', () => {
      const valid = PublicKey.isValid(invalidPoint)
      valid.should.equal(false)
    })

    it('should recieve a boolean as true for uncompressed', () => {
      const valid = PublicKey.isValid(
        '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341'
      )
      valid.should.equal(true)
    })

    it('should recieve a boolean as true for compressed', () => {
      const valid = PublicKey.isValid(
        '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'
      )
      valid.should.equal(true)
    })
  })

  describe('#fromPoint', () => {
    it('should instantiate from a point', () => {
      const p = new Point(
        '86a80a5a2bfc48dddde2b0bd88bd56b0b6ddc4e6811445b175b90268924d7d48',
        '3b402dfc89712cfe50963e670a0598e6b152b3cd94735001cdac6794975d3afd'
      )
      const b = PublicKey.fromPoint(p)
      should.exist(b.point)
      b.point.toString().should.equal(p.toString())
    })

    it('should error because paramater is not a point', () => {
      ;(function () {
        PublicKey.fromPoint(new Error())
      }.should.throw('First argument must be an instance of Point.'))
    })
  })

  describe('#json/object', () => {
    it('should input/ouput json', () => {
      const json = JSON.stringify({
        x: '1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a',
        y: '7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341',
        compressed: false,
      })
      const pubkey = new PublicKey(JSON.parse(json))
      JSON.stringify(pubkey).should.deep.equal(json)
    })

    it('fails if "y" is not provided', () => {
      expect(() => new PublicKey({
          x: '1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a',
        })).to.throw()
    })

    it('fails if invalid JSON is provided', () => {
      expect(() => PublicKey._transformJSON('¹')).to.throw()
    })

    it('works for X starting with 0x00', () => {
      const a = new PublicKey('030589ee559348bd6a7325994f9c8eff12bd5d73cc683142bd0dd1a17abc99b0dc')
      const b = new PublicKey(`03${a.toObject().x}`)
      b.toString().should.equal(a.toString())
    })
  })

  describe('#fromPrivateKey', () => {
    it('should make a public key from a privkey', () => {
      should.exist(PublicKey.fromPrivateKey(PrivateKey.fromRandom()))
    })

    it('should error because not an instance of privkey', () => {
      ;(function () {
        PublicKey.fromPrivateKey(new Error())
      }.should.throw('Must be an instance of PrivateKey'))
    })
  })

  describe('#fromBuffer', () => {
    it('should parse this uncompressed public key', () => {
      const pk = PublicKey.fromBuffer(
        Buffer.from(
          '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341',
          'hex'
        )
      )
      pk.point
        .getX()
        .toString(16)
        .should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
      pk.point
        .getY()
        .toString(16)
        .should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341')
    })

    it('should parse this compressed public key', () => {
      const pk = PublicKey.fromBuffer(
        Buffer.from('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
      )
      pk.point
        .getX()
        .toString(16)
        .should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
      pk.point
        .getY()
        .toString(16)
        .should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341')
    })

    it('should throw an error on this invalid public key', () => {
      ;(function () {
        PublicKey.fromBuffer(
          Buffer.from('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
        )
      }.should.throw())
    })

    it('should throw error because not a buffer', () => {
      ;(function () {
        PublicKey.fromBuffer('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
      }.should.throw('Must be a hex buffer of DER encoded public key'))
    })

    it('should throw error because buffer is the incorrect length', () => {
      ;(function () {
        PublicKey.fromBuffer(
          Buffer.from(
            '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a34112',
            'hex'
          )
        )
      }.should.throw('Length of x and y must be 32 bytes'))
    })
  })

  describe('#fromDER', () => {
    it('should parse this uncompressed public key', () => {
      const pk = PublicKey.fromDER(
        Buffer.from(
          '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341',
          'hex'
        )
      )
      pk.point
        .getX()
        .toString(16)
        .should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
      pk.point
        .getY()
        .toString(16)
        .should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341')
    })

    it('should parse this compressed public key', () => {
      const pk = PublicKey.fromDER(
        Buffer.from('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
      )
      pk.point
        .getX()
        .toString(16)
        .should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
      pk.point
        .getY()
        .toString(16)
        .should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341')
    })

    it('should throw an error on this invalid public key', () => {
      ;(function () {
        PublicKey.fromDER(
          Buffer.from('091ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
        )
      }.should.throw())
    })
  })

  describe('#fromString', () => {
    it('should parse this known valid public key', () => {
      const pk = PublicKey.fromString(
        '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341'
      )
      pk.point
        .getX()
        .toString(16)
        .should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
      pk.point
        .getY()
        .toString(16)
        .should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341')
    })
  })

  describe('#fromX', () => {
    it('should create this known public key', () => {
      const x = BN.fromBuffer(
        Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
      )
      const pk = PublicKey.fromX(true, x)
      pk.point
        .getX()
        .toString(16)
        .should.equal('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
      pk.point
        .getY()
        .toString(16)
        .should.equal('7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341')
    })

    it('should error because odd was not included as a param', () => {
      const x = BN.fromBuffer(
        Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
      )
      ;(function () {
        return PublicKey.fromX(null, x)
      }.should.throw('Must specify whether y is odd or not (true or false)'))
    })
  })

  describe('#toBuffer', () => {
    it('should return this compressed DER format', () => {
      const x = BN.fromBuffer(
        Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
      )
      const pk = PublicKey.fromX(true, x)
      pk.toBuffer()
        .toString('hex')
        .should.equal('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
    })

    it('should return this uncompressed DER format', () => {
      const x = BN.fromBuffer(
        Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
      )
      const pk = PublicKey.fromX(true, x)
      pk.toBuffer()
        .toString('hex')
        .should.equal('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
    })
  })

  describe('#toDER', () => {
    it('should return this compressed DER format', () => {
      const x = BN.fromBuffer(
        Buffer.from('1ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a', 'hex')
      )
      const pk = PublicKey.fromX(true, x)
      pk.toDER()
        .toString('hex')
        .should.equal('031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a')
    })

    it('should return this uncompressed DER format', () => {
      const pk = PublicKey.fromString(
        '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341'
      )
      pk.toDER()
        .toString('hex')
        .should.equal(
          '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341'
        )
    })
  })

  describe('#toAddress', () => {
    it('should output this known mainnet address correctly', () => {
      const pk = new PublicKey('03c87bd0e162f26969da8509cafcb7b8c8d202af30b928c582e263dd13ee9a9781')
      const address = pk.toAddress('livenet')
      address.toString().should.equal('1A6ut1tWnUq1SEQLMr4ttDh24wcbJ5o9TT')
    })

    it('should output this known testnet address correctly', () => {
      const pk = new PublicKey('0293126ccc927c111b88a0fe09baa0eca719e2a3e087e8a5d1059163f5c566feef')
      const address = pk.toAddress('testnet')
      address.toString().should.equal('mtX8nPZZdJ8d3QNLRJ1oJTiEi26Sj6LQXS')
    })
  })

  describe('hashes', () => {
    // wif private key, address
    // see: https://github.com/bitcoin/bitcoin/blob/master/src/test/key_tests.cpp#L20
    const data = [
      ['5HxWvvfubhXpYYpS3tJkw6fq9jE9j18THftkZjHHfmFiWtmAbrj', '1QFqqMUD55ZV3PJEJZtaKCsQmjLT6JkjvJ'],
      ['5KC4ejrDjv152FGwP386VD1i2NYc5KkfSMyv1nGy1VGDxGHqVY3', '1F5y5E5FMc5YzdJtB9hLaUe43GDxEKXENJ'],
      [
        'Kwr371tjA9u2rFSMZjTNun2PXXP3WPZu2afRHTcta6KxEUdm1vEw',
        '1NoJrossxPBKfCHuJXT4HadJrXRE9Fxiqs',
      ],
      [
        'L3Hq7a8FEQwJkW1M2GNKDW28546Vp5miewcCzSqUD9kCAXrJdS3g',
        '1CRj2HyM1CXWzHAXLQtiGLyggNT9WQqsDs',
      ],
    ]
    data.forEach((d) => {
      const publicKey = PrivateKey.fromWIF(d[0]).toPublicKey()
      const address = Address.fromString(d[1])
      address.hashBuffer.should.deep.equal(publicKey._getID())
    })
  })

  describe('#toString', () => {
    it('should print this known public key', () => {
      const hex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'
      const pk = PublicKey.fromString(hex)
      pk.toString().should.equal(hex)
    })
  })

  describe('#inspect', () => {
    it('should output known uncompressed pubkey for console', () => {
      const pubkey = PublicKey.fromString(
        '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341'
      )
      pubkey
        .inspect()
        .should.equal(
          '<PublicKey: 041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a7baad41d04514751e6851f5304fd243751703bed21b914f6be218c0fa354a341, uncompressed>'
        )
    })

    it('should output known compressed pubkey for console', () => {
      const pubkey = PublicKey.fromString(
        '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'
      )
      pubkey
        .inspect()
        .should.equal(
          '<PublicKey: 031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a>'
        )
    })

    it('should output known compressed pubkey with network for console', () => {
      const privkey = PrivateKey.fromWIF('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m')
      const pubkey = new PublicKey(privkey)
      pubkey
        .inspect()
        .should.equal(
          '<PublicKey: 03c87bd0e162f26969da8509cafcb7b8c8d202af30b928c582e263dd13ee9a9781>'
        )
    })
  })

  describe('#validate', () => {
    it('should not have an error if pubkey is valid', () => {
      const hex = '031ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a'
      expect(() => PublicKey.fromString(hex)).to.not.throw()
    })

    it('should throw an error if pubkey is invalid', () => {
      const hex =
        '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a0000000000000000000000000000000000000000000000000000000000000000'
      ;(function () {
        return PublicKey.fromString(hex)
      }.should.throw('Invalid y value for curve.'))
    })

    it('should throw an error if pubkey is invalid', () => {
      const hex =
        '041ff0fe0f7b15ffaa85ff9f4744d539139c252a49710fb053bb9f2b933173ff9a00000000000000000000000000000000000000000000000000000000000000FF'
      ;(function () {
        return PublicKey.fromString(hex)
      }.should.throw('Invalid y value for curve.'))
    })

    it('should throw an error if pubkey is infinity', () => {
      ;(function () {
        return new PublicKey(Point.getG().mul(Point.getN()))
      }.should.throw('Point cannot be equal to Infinity'))
    })
  })
})
