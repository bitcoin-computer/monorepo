import _ from 'lodash'
import assert from 'assert'
import chai from 'chai'
import { Bitcoin } from './bitcoin'

const { expect } = chai
const { errors } = Bitcoin
const hdErrors = Bitcoin.errors.HDPublicKey
const BufferUtil = Bitcoin.util.buffer
const { HDPublicKey } = Bitcoin
const { Base58Check } = Bitcoin.encoding
const { Networks } = Bitcoin

const xprivkey =
  'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'
const xpubkey =
  'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8'
const xpubkeyTestnet =
  'tpubD6NzVbkrYhZ4WZaiWHz59q5EQ61bd6dUYfU4ggRWAtNAyyYRNWT6ktJ7UHJEXURvTfTfskFQmK7Ff4FRkiRN5wQH8nkGAb6aKB4Yyeqsw5m'
const json =
  '{"network":"livenet","depth":0,"fingerPrint":876747070,"parentFingerPrint":0,"childIndex":0,"chainCode":"873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508","publicKey":"0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2","checksum":-1421395167,"xpubkey":"xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8"}'
// eslint-disable-next-line camelcase
const derived_0_1_200000 =
  'xpub6BqyndF6rkBNTV6LXwiY8Pco8aqctqq7tGEUdA8fmGDTnDJphn2fmxr3eM8Lm3m8TrNUsLbEjHvpa3adBU18YpEx4tp2Zp6nqax3mQkudhX'

describe('HDPublicKey interface', () => {
  const expectFail = function (func, errorType) {
    ;(function () {
      func()
    }.should.throw(errorType))
  }

  const expectDerivationFail = function (argument, error) {
    ;(function () {
      const pubkey = new HDPublicKey(xpubkey)
      pubkey.derive(argument)
    }.should.throw(error))
  }

  const expectFailBuilding = function (argument, error) {
    ;(function () {
      return new HDPublicKey(argument)
    }.should.throw(error))
  }

  describe('creation formats', () => {
    it('returns same argument if already an instance of HDPublicKey', () => {
      const publicKey = new HDPublicKey(xpubkey)
      publicKey.should.equal(new HDPublicKey(publicKey))
    })

    it('returns the correct xpubkey for a xprivkey', () => {
      const publicKey = new HDPublicKey(xprivkey)
      publicKey.xpubkey.should.equal(xpubkey)
    })

    it('allows to call the argument with no "new" keyword', () => {
      HDPublicKey(xpubkey).xpubkey.should.equal(new HDPublicKey(xpubkey).xpubkey)
    })

    it("fails when user doesn't supply an argument", () => {
      expectFailBuilding(null, hdErrors.MustSupplyArgument)
    })

    it('should not be able to change read-only properties', () => {
      const publicKey = new HDPublicKey(xprivkey)
      expect(() => {
        publicKey.fingerPrint = 'notafingerprint'
      }).to.throw(TypeError)
    })

    it("doesn't recognize an invalid argument", () => {
      expectFailBuilding(1, hdErrors.UnrecognizedArgument)
      expectFailBuilding(true, hdErrors.UnrecognizedArgument)
    })

    describe('xpubkey string serialization errors', () => {
      it('fails on invalid length', () => {
        expectFailBuilding(Base58Check.encode(Buffer.from([1, 2, 3])), hdErrors.InvalidLength)
      })
      it('fails on invalid base58 encoding', () => {
        expectFailBuilding(`${xpubkey}1`, errors.InvalidB58Checksum)
      })
      it('user can ask if a string is valid', () => {
        HDPublicKey.isValidSerialized(xpubkey).should.equal(true)
      })
    })

    it('can be generated from a json', () => {
      expect(new HDPublicKey(JSON.parse(json)).xpubkey).to.equal(xpubkey)
    })

    it('can generate a json that has a particular structure', () => {
      assert(
        _.isEqual(new HDPublicKey(JSON.parse(json)).toJSON(), new HDPublicKey(xpubkey).toJSON())
      )
    })

    it('builds from a buffer object', () => {
      new HDPublicKey(new HDPublicKey(xpubkey)._buffers).xpubkey.should.equal(xpubkey)
    })

    it('checks the checksum', () => {
      const buffers = new HDPublicKey(xpubkey)._buffers
      buffers.checksum = BufferUtil.integerAsBuffer(1)
      expectFail(() => new HDPublicKey(buffers), errors.InvalidB58Checksum)
    })
  })

  describe('error checking on serialization', () => {
    const compareType = function (a, b) {
      expect(a instanceof b).to.equal(true)
    }
    it('throws invalid argument when argument is not a string or buffer', () => {
      compareType(HDPublicKey.getSerializedError(1), hdErrors.UnrecognizedArgument)
    })
    it('if a network is provided, validates that data corresponds to it', () => {
      compareType(HDPublicKey.getSerializedError(xpubkey, 'testnet'), errors.InvalidNetwork)
    })
    it('recognizes invalid network arguments', () => {
      compareType(HDPublicKey.getSerializedError(xpubkey, 'invalid'), errors.InvalidNetworkArgument)
    })
    it('recognizes a valid network', () => {
      expect(HDPublicKey.getSerializedError(xpubkey, 'livenet')).to.equal(null)
    })
  })

  it('toString() returns the same value as .xpubkey', () => {
    const pubKey = new HDPublicKey(xpubkey)
    pubKey.toString().should.equal(pubKey.xpubkey)
  })

  it('publicKey property matches network', () => {
    const livenet = new HDPublicKey(xpubkey)
    const testnet = new HDPublicKey(xpubkeyTestnet)

    livenet.publicKey.network.should.equal(Networks.livenet)
    testnet.publicKey.network.should.equal(Networks.testnet)
  })

  it('inspect() displays correctly', () => {
    const pubKey = new HDPublicKey(xpubkey)
    pubKey.inspect().should.equal(`<HDPublicKey: ${pubKey.xpubkey}>`)
  })

  describe('conversion to/from buffer', () => {
    it('should roundtrip to an equivalent object', () => {
      const pubKey = new HDPublicKey(xpubkey)
      const toBuffer = pubKey.toBuffer()
      const fromBuffer = HDPublicKey.fromBuffer(toBuffer)
      const roundTrip = new HDPublicKey(fromBuffer.toBuffer())
      roundTrip.xpubkey.should.equal(xpubkey)
    })
  })

  describe('conversion to different formats', () => {
    const plainObject = {
      network: 'livenet',
      depth: 0,
      fingerPrint: 876747070,
      parentFingerPrint: 0,
      childIndex: 0,
      chainCode: '873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508',
      publicKey: '0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2',
      checksum: -1421395167,
      xpubkey:
        'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8',
    }
    it('roundtrips to JSON and to Object', () => {
      const pubkey = new HDPublicKey(xpubkey)
      expect(HDPublicKey.fromObject(pubkey.toJSON()).xpubkey).to.equal(xpubkey)
    })
    it('recovers state from Object', () => {
      new HDPublicKey(plainObject).xpubkey.should.equal(xpubkey)
    })
  })

  describe('derivation', () => {
    it('derivation is the same whether deriving with number or string', () => {
      const pubkey = new HDPublicKey(xpubkey)
      const derived1 = pubkey.derive(0).derive(1).derive(200000)
      const derived2 = pubkey.derive('m/0/1/200000')
      derived1.xpubkey.should.equal(derived_0_1_200000)
      derived2.xpubkey.should.equal(derived_0_1_200000)
    })

    it('allows special parameters m, M', () => {
      const expectDerivationSuccess = function (argument) {
        new HDPublicKey(xpubkey).derive(argument).xpubkey.should.equal(xpubkey)
      }
      expectDerivationSuccess('m')
      expectDerivationSuccess('M')
    })

    it("doesn't allow object arguments for derivation", () => {
      expectFail(() => new HDPublicKey(xpubkey).derive({}), hdErrors.InvalidDerivationArgument)
    })

    it('needs first argument for derivation', () => {
      expectFail(() => new HDPublicKey(xpubkey).derive('s'), hdErrors.InvalidPath)
    })

    it("doesn't allow other parameters like m' or M' or \"s\"", () => {
      expectDerivationFail("m'", hdErrors.InvalidIndexCantDeriveHardened)
      expectDerivationFail("M'", hdErrors.InvalidIndexCantDeriveHardened)
      expectDerivationFail('1', hdErrors.InvalidPath)
      expectDerivationFail('S', hdErrors.InvalidPath)
    })

    it("can't derive hardened keys", () => {
      expectFail(() => new HDPublicKey(xpubkey).derive(HDPublicKey.Hardened), hdErrors.InvalidIndexCantDeriveHardened)
    })

    it("can't derive hardened keys via second argument", () => {
      expectFail(() => new HDPublicKey(xpubkey).derive(5, true), hdErrors.InvalidIndexCantDeriveHardened)
    })

    it('validates correct paths', () => {
      let valid

      valid = HDPublicKey.isValidPath('m/123/12')
      valid.should.equal(true)

      valid = HDPublicKey.isValidPath('m')
      valid.should.equal(true)

      valid = HDPublicKey.isValidPath(123)
      valid.should.equal(true)
    })

    it('rejects illegal paths', () => {
      let valid

      valid = HDPublicKey.isValidPath('m/-1/12')
      valid.should.equal(false)

      valid = HDPublicKey.isValidPath("m/0'/12")
      valid.should.equal(false)

      valid = HDPublicKey.isValidPath('m/8000000000/12')
      valid.should.equal(false)

      valid = HDPublicKey.isValidPath('bad path')
      valid.should.equal(false)

      valid = HDPublicKey.isValidPath(-1)
      valid.should.equal(false)

      valid = HDPublicKey.isValidPath(8000000000)
      valid.should.equal(false)

      valid = HDPublicKey.isValidPath(HDPublicKey.Hardened)
      valid.should.equal(false)
    })
  })
})
