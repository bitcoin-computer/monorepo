import chai from 'chai'
import { Bitcoin } from './bitcoin'
import validbase58 from './data/bitcoind/base58_keys_valid.json'
import invalidbase58 from './data/bitcoind/base58_keys_invalid.json'

const should = chai.should()
const { expect } = chai
const { BN } = Bitcoin.crypto
const { Point } = Bitcoin.crypto
const { PrivateKey } = Bitcoin
const { Networks } = Bitcoin
const { Base58Check } = Bitcoin.encoding

describe('PrivateKey', () => {
  const hex = '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a'
  const hex2 = '8080808080808080808080808080808080808080808080808080808080808080'
  const buf = Buffer.from(hex, 'hex')
  const wifTestnet = 'cSdkPxkAjA4HDr5VHgsebAPDEh9Gyub4HK8UJr2DFGGqKKy4K5sG'
  const wifTestnetUncompressed = '92jJzK4tbURm1C7udQXxeCBvXHoHJstDXRxAMouPG1k1XUaXdsu'
  const wifLivenet = 'L2Gkw3kKJ6N24QcDuH4XDqt9cTqsKTVNDGz1CRZhk9cq4auDUbJy'
  const wifLivenetUncompressed = '5JxgQaFM1FMd38cd14e3mbdxsdSa9iM2BV6DHBYsvGzxkTNQ7Un'
  const wifNamecoin = '74pxNKNpByQ2kMow4d9kF6Z77BYeKztQNLq3dSyU4ES1K5KLNiz'

  it('should create a new random private key', () => {
    const a = new PrivateKey()
    should.exist(a)
    should.exist(a.bn)
    const b = PrivateKey()
    should.exist(b)
    should.exist(b.bn)
  })

  it('should create a privatekey from hexa string', () => {
    const a = new PrivateKey(hex2)
    should.exist(a)
    should.exist(a.bn)
  })

  it('should create a new random testnet private key with only one argument', () => {
    const a = new PrivateKey(Networks.testnet)
    should.exist(a)
    should.exist(a.bn)
  })

  it('should create a private key from a custom network WIF string', () => {
    const nmc = {
      name: 'namecoin',
      alias: 'namecoin',
      pubkeyhash: 0x34,
      privatekey: 0xb4,
      // these below aren't the real NMC version numbers
      scripthash: 0x08,
      xpubkey: 0x0278b20e,
      xprivkey: 0x0278ade4,
      networkMagic: 0xf9beb4fe,
      port: 20001,
      dnsSeeds: ['localhost', 'mynet.localhost'],
    }
    Networks.add(nmc)
    const nmcNet = Networks.get('namecoin')
    const a = new PrivateKey(wifNamecoin, nmcNet)
    should.exist(a)
    should.exist(a.bn)
    Networks.remove(nmcNet)
  })

  it('should create a new random testnet private key with empty data', () => {
    const a = new PrivateKey(null, Networks.testnet)
    should.exist(a)
    should.exist(a.bn)
  })

  it('should create a private key from WIF string', () => {
    const a = new PrivateKey('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m')
    should.exist(a)
    should.exist(a.bn)
  })

  it('should create a private key from WIF buffer', () => {
    const a = new PrivateKey(
      Base58Check.decode('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m')
    )
    should.exist(a)
    should.exist(a.bn)
  })

  describe('bitcoind compliance', () => {
    validbase58.forEach((d) => {
      if (d[2].isPrivkey) {
        it(`should instantiate WIF private key ${d[0]} with correct properties`, () => {
          let network = Networks.livenet
          if (d[2].isTestnet) {
            network = Networks.testnet
          }
          const key = new PrivateKey(d[0])
          key.compressed.should.equal(d[2].isCompressed)
          key.network.should.equal(network)
        })
      }
    })
    invalidbase58.forEach((d) => {
      it(`should describe input ${d[0].slice(0, 10)}... as invalid`, () => {
        expect(() => new PrivateKey(d[0])).to.throw(Error)
      })
    })
  })

  describe('instantiation', () => {
    it('should not be able to instantiate private key greater than N', () => {
      expect(() => new PrivateKey(Point.getN())).to.throw('Number must be less than N')
    })

    it('should not be able to instantiate private key because of network mismatch', () => {
      expect(() => new PrivateKey('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m', 'testnet')).to.throw('Private key network mismatch')
    })

    it('should not be able to instantiate private key WIF is too long', () => {
      expect(() => {
        const buf1 = Base58Check.decode('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m')
        const buf2 = Buffer.concat([buf1, Buffer.alloc(0x01)])
        return new PrivateKey(buf2)
      }).to.throw('Length of buffer must be 33 (uncompressed) or 34 (compressed')
    })

    it('should not be able to instantiate private key WIF because of unknown network byte', () => {
      expect(() => {
        const buf1 = Base58Check.decode('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m')
        const buf2 = Buffer.concat([Buffer.from('ff', 'hex'), buf1.slice(1, 33)])
        return new PrivateKey(buf2)
      }).to.throw('Invalid network')
    })

    it('should not be able to instantiate private key WIF because of network mismatch', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new PrivateKey(wifNamecoin, 'testnet')
      }).to.throw('Invalid network')
    })

    it('can be instantiated from a hex string', () => {
      const privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff'
      const pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc'
      const privkey = new PrivateKey(privhex)
      privkey.publicKey.toString().should.equal(pubhex)
    })

    it('should not be able to instantiate because of unrecognized data', () => {
      expect(() => new PrivateKey(new Error())).to.throw('First argument is an unrecognized data type.')
    })

    it('should not be able to instantiate with unknown network', () => {
      expect(() => new PrivateKey(new BN(2), 'unknown')).to.throw('Must specify the network ("livenet" or "testnet")')
    })

    it('should not create a zero private key', () => {
      expect(() => {
        const bn = new BN(0)
        return new PrivateKey(bn)
      }).to.throw(TypeError)
    })

    it('should create a livenet private key', () => {
      const privkey = new PrivateKey(BN.fromBuffer(buf), 'livenet')
      privkey.toWIF().should.equal(wifLivenet)
    })

    it('should create a default network private key', () => {
      // keep the original
      const network = Networks.defaultNetwork
      Networks.defaultNetwork = Networks.livenet
      const a = new PrivateKey(BN.fromBuffer(buf))
      a.network.should.equal(Networks.livenet)
      // change the default
      Networks.defaultNetwork = Networks.testnet
      const b = new PrivateKey(BN.fromBuffer(buf))
      b.network.should.equal(Networks.testnet)
      // restore the default
      Networks.defaultNetwork = network
    })

    it('returns the same instance if a PrivateKey is provided (immutable)', () => {
      const privkey = new PrivateKey()
      new PrivateKey(privkey).should.equal(privkey)
    })
  })

  describe('#json/object', () => {
    it('should input/output json', () => {
      const json = JSON.stringify({
        bn: '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a',
        compressed: false,
        network: 'livenet',
      })
      const key = PrivateKey.fromObject(JSON.parse(json))
      JSON.stringify(key).should.equal(json)
    })

    it('input json should correctly initialize network field', () => {
      ;['livenet', 'testnet', 'mainnet'].forEach((net) => {
        const pk = PrivateKey.fromObject({
          bn: '96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a',
          compressed: false,
          network: net,
        })
        pk.network.should.be.deep.equal(Networks.get(net))
      })
    })

    it('fails on invalid argument', () => {
      expect(() => PrivateKey.fromJSON('¹')).to.throw()
    })

    it('also accepts an object as argument', () => {
      expect(() => PrivateKey.fromObject(new PrivateKey().toObject())).to.not.throw()
    })
  })

  describe('#toString', () => {
    it('should output this address correctly', () => {
      const privkey = PrivateKey.fromWIF(wifLivenetUncompressed)
      privkey.toWIF().should.equal(wifLivenetUncompressed)
    })
  })

  describe('#toAddress', () => {
    it('should output this known livenet address correctly', () => {
      const privkey = PrivateKey.fromWIF('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m')
      const address = privkey.toAddress()
      address.toString().should.equal('1A6ut1tWnUq1SEQLMr4ttDh24wcbJ5o9TT')
    })

    it('should output this known testnet address correctly', () => {
      const privkey = PrivateKey.fromWIF('cR4qogdN9UxLZJXCNFNwDRRZNeLRWuds9TTSuLNweFVjiaE4gPaq')
      const address = privkey.toAddress()
      address.toString().should.equal('mtX8nPZZdJ8d3QNLRJ1oJTiEi26Sj6LQXS')
    })

    it('creates network specific address', () => {
      const pk = PrivateKey.fromWIF('cR4qogdN9UxLZJXCNFNwDRRZNeLRWuds9TTSuLNweFVjiaE4gPaq')
      pk.toAddress(Networks.livenet).network.name.should.equal(Networks.livenet.name)
      pk.toAddress(Networks.testnet).network.name.should.equal(Networks.testnet.name)
    })
  })

  describe('#inspect', () => {
    it('should output known livenet address for console', () => {
      const privkey = PrivateKey.fromWIF('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m')
      privkey
        .inspect()
        .should.equal(
          '<PrivateKey: b9de6e778fe92aa7edb69395556f843f1dce0448350112e14906efc2a80fa61a, network: livenet>'
        )
    })

    it('should output known testnet address for console', () => {
      const privkey = PrivateKey.fromWIF('cR4qogdN9UxLZJXCNFNwDRRZNeLRWuds9TTSuLNweFVjiaE4gPaq')
      privkey
        .inspect()
        .should.equal(
          '<PrivateKey: 67fd2209ce4a95f6f1d421ab3fbea47ada13df11b73b30c4d9a9f78cc80651ac, network: testnet>'
        )
    })

    it('outputs "uncompressed" for uncompressed imported WIFs', () => {
      const privkey = PrivateKey.fromWIF(wifLivenetUncompressed)
      privkey
        .inspect()
        .should.equal(
          '<PrivateKey: 96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a, network: livenet, uncompressed>'
        )
    })
  })

  describe('#getValidationError', () => {
    it('should get an error because private key greater than N', () => {
      const n = Point.getN()
      const a = PrivateKey.getValidationError(n)
      a.message.should.equal('Number must be less than N')
    })

    it('should validate as false because private key greater than N', () => {
      const n = Point.getN()
      const a = PrivateKey.isValid(n)
      a.should.equal(false)
    })

    it('should recognize that undefined is an invalid private key', () => {
      PrivateKey.isValid().should.equal(false)
    })

    it('should validate as true', () => {
      const a = PrivateKey.isValid('L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m')
      a.should.equal(true)
    })
  })

  describe('buffer serialization', () => {
    it('returns an expected value when creating a PrivateKey from a buffer', () => {
      const privkey = new PrivateKey(BN.fromBuffer(buf), 'livenet')
      privkey.toString().should.equal(buf.toString('hex'))
    })

    it('roundtrips correctly when using toBuffer/fromBuffer', () => {
      const privkey = new PrivateKey(BN.fromBuffer(buf))
      const toBuffer = new PrivateKey(privkey.toBuffer())
      const fromBuffer = PrivateKey.fromBuffer(toBuffer.toBuffer())
      fromBuffer.toString().should.equal(privkey.toString())
    })

    it('will output a 31 byte buffer', () => {
      const bn = BN.fromBuffer(
        Buffer.from('9b5a0e8fee1835e21170ce1431f9b6f19b487e67748ed70d8a4462bc031915', 'hex')
      )
      const privkey = new PrivateKey(bn)
      const buffer = privkey.toBufferNoPadding()
      buffer.length.should.equal(31)
    })

    // TODO: enable for v1.0.0 when toBuffer is changed to always be 32 bytes long
    // it('will output a 32 byte buffer', function() {
    //   var bn = BN.fromBuffer(Buffer.from('9b5a0e8fee1835e21170ce1431f9b6f19b487e67748ed70d8a4462bc031915', 'hex'));
    //   var privkey = new PrivateKey(bn);
    //   var buffer = privkey.toBuffer();
    //   buffer.length.should.equal(32);
    // });

    // TODO: enable for v1.0.0 when toBuffer is changed to always be 32 bytes long
    // it('should return buffer with length equal 32', function() {
    //   var bn = BN.fromBuffer(buf.slice(0, 31));
    //   var privkey = new PrivateKey(bn, 'livenet');
    //   var expected = Buffer.concat([ Buffer.from([0]), buf.slice(0, 31) ]);
    //   privkey.toBuffer().toString('hex').should.equal(expected.toString('hex'));
    // });
  })

  describe('#toBigNumber', () => {
    it('should output known BN', () => {
      const a = BN.fromBuffer(buf)
      const privkey = new PrivateKey(a, 'livenet')
      const b = privkey.toBigNumber()
      b.toString('hex').should.equal(a.toString('hex'))
    })
  })

  describe('#fromRandom', () => {
    it('should set bn gt 0 and lt n, and should be compressed', () => {
      const privkey = PrivateKey.fromRandom()
      privkey.bn.gt(new BN(0)).should.equal(true)
      privkey.bn.lt(Point.getN()).should.equal(true)
      privkey.compressed.should.equal(true)
    })
  })

  describe('#fromWIF', () => {
    it('should parse this compressed testnet address correctly', () => {
      const privkey = PrivateKey.fromWIF(wifLivenet)
      privkey.toWIF().should.equal(wifLivenet)
    })
  })

  describe('#toWIF', () => {
    it('should parse this compressed testnet address correctly', () => {
      const privkey = PrivateKey.fromWIF(wifTestnet)
      privkey.toWIF().should.equal(wifTestnet)
    })
  })

  describe('#fromString', () => {
    it('should parse this uncompressed testnet address correctly', () => {
      const privkey = PrivateKey.fromString(wifTestnetUncompressed)
      privkey.toWIF().should.equal(wifTestnetUncompressed)
    })
  })

  describe('#toString', () => {
    it('should parse this uncompressed livenet address correctly', () => {
      const privkey = PrivateKey.fromString(wifLivenetUncompressed)
      privkey
        .toString()
        .should.equal('96c132224121b509b7d0a16245e957d9192609c5637c6228311287b1be21627a')
    })
  })

  describe('#toPublicKey', () => {
    it('should convert this known PrivateKey to known PublicKey', () => {
      const privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff'
      const pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc'
      const privkey = new PrivateKey(new BN(Buffer.from(privhex, 'hex')))
      const pubkey = privkey.toPublicKey()
      pubkey.toString().should.equal(pubhex)
    })

    it('should have a "publicKey" property', () => {
      const privhex = '906977a061af29276e40bf377042ffbde414e496ae2260bbf1fa9d085637bfff'
      const pubhex = '02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc'
      const privkey = new PrivateKey(new BN(Buffer.from(privhex, 'hex')))
      privkey.publicKey.toString().should.equal(pubhex)
    })

    it('should convert this known PrivateKey to known PublicKey and preserve compressed=true', () => {
      const privwif = 'L3T1s1TYP9oyhHpXgkyLoJFGniEgkv2Jhi138d7R2yJ9F4QdDU2m'
      const privkey = new PrivateKey(privwif, 'livenet')
      const pubkey = privkey.toPublicKey()
      pubkey.compressed.should.equal(true)
    })

    it('should convert this known PrivateKey to known PublicKey and preserve compressed=false', () => {
      const privwif = '92jJzK4tbURm1C7udQXxeCBvXHoHJstDXRxAMouPG1k1XUaXdsu'
      const privkey = new PrivateKey(privwif, 'testnet')
      const pubkey = privkey.toPublicKey()
      pubkey.compressed.should.equal(false)
    })
  })

  it('creates an address as expected from WIF, livenet', () => {
    const privkey = new PrivateKey('5J2NYGstJg7aJQEqNwYp4enG5BSfFdKXVTtBLvHicnRGD5kjxi6')
    privkey.publicKey.toAddress().toString().should.equal('135bwugFCmhmNU3SeCsJeTqvo5ViymgwZ9')
  })

  it('creates an address as expected from WIF, testnet', () => {
    const privkey = new PrivateKey('92VYMmwFLXRwXn5688edGxYYgMFsc3fUXYhGp17WocQhU6zG1kd')
    privkey.publicKey.toAddress().toString().should.equal('moiAvLUw16qgrwhFGo1eDnXHC2wPMYiv7Y')
  })
})
