import chai from 'chai'
import { Bitcoin } from '../bitcoin'

const should = chai.should()
const { BN } = Bitcoin.crypto

describe('BN', () => {
  it('should create a bn', () => {
    const bn = new BN(50)
    should.exist(bn)
    bn.toString().should.equal('50')
  })

  it('should parse this number', () => {
    const bn = new BN(999970000)
    bn.toString().should.equal('999970000')
  })

  it('should parse numbers below and at bn.js internal word size', () => {
    let bn = new BN(2 ** 26 - 1)
    bn.toString().should.equal((2 ** 26 - 1).toString())
    bn = new BN(2 ** 26)
    bn.toString().should.equal((2 ** 26).toString())
  })

  describe('#add', () => {
    it('should add two small numbers together', () => {
      const bn1 = new BN(50)
      const bn2 = new BN(75)
      const bn3 = bn1.add(bn2)
      bn3.toString().should.equal('125')
    })
  })

  describe('#sub', () => {
    it('should subtract a small number', () => {
      const bn1 = new BN(50)
      const bn2 = new BN(25)
      const bn3 = bn1.sub(bn2)
      bn3.toString().should.equal('25')
    })
  })

  describe('#gt', () => {
    it('should say 1 is greater than 0', () => {
      const bn1 = new BN(1)
      const bn0 = new BN(0)
      bn1.gt(bn0).should.equal(true)
    })

    it('should say a big number is greater than a small big number', () => {
      const bn1 = new BN('24023452345398529485723980457')
      const bn0 = new BN('34098234283412341234049357')
      bn1.gt(bn0).should.equal(true)
    })

    it('should say a big number is great than a standard number', () => {
      const bn1 = new BN('24023452345398529485723980457')
      const bn0 = new BN(5)
      bn1.gt(bn0).should.equal(true)
    })
  })

  describe('to/from ScriptNumBuffer', () => {
    ;[0, 1, 10, 256, 1000, 65536, 65537, -1, -1000, -65536, -65537].forEach((n) => {
      it(`rountrips correctly for ${n}`, () => {
        BN.fromScriptNumBuffer(new BN(n).toScriptNumBuffer()).toNumber().should.equal(n)
      })
    })
  })

  describe('#fromString', () => {
    it('should make BN from a string', () => {
      BN.fromString('5').toString().should.equal('5')
    })
    it('should work with hex string', () => {
      BN.fromString('7fffff0000000000000000000000000000000000000000000000000000000000', 16)
        .toString(16)
        .should.equal('7fffff0000000000000000000000000000000000000000000000000000000000')
    })
  })

  describe('#toString', () => {
    it('should make a string', () => {
      new BN(5).toString().should.equal('5')
    })
  })

  describe('@fromBuffer', () => {
    it('should work with big endian', () => {
      const bn = BN.fromBuffer(Buffer.from('0001', 'hex'), {
        endian: 'big',
      })
      bn.toString().should.equal('1')
    })

    it('should work with big endian 256', () => {
      const bn = BN.fromBuffer(Buffer.from('0100', 'hex'), {
        endian: 'big',
      })
      bn.toString().should.equal('256')
    })

    it('should work with little endian if we specify the size', () => {
      const bn = BN.fromBuffer(Buffer.from('0100', 'hex'), {
        size: 2,
        endian: 'little',
      })
      bn.toString().should.equal('1')
    })
  })

  describe('#toBuffer', () => {
    it('should create a 4 byte buffer', () => {
      const bn = new BN(1)
      bn.toBuffer({
        size: 4,
      })
        .toString('hex')
        .should.equal('00000001')
    })

    it('should create a 4 byte buffer in little endian', () => {
      const bn = new BN(1)
      bn.toBuffer({
        size: 4,
        endian: 'little',
      })
        .toString('hex')
        .should.equal('01000000')
    })

    it('should create a 2 byte buffer even if you ask for a 1 byte', () => {
      const bn = new BN('ff00', 16)
      bn.toBuffer({
        size: 1,
      })
        .toString('hex')
        .should.equal('ff00')
    })

    it('should create a 4 byte buffer even if you ask for a 1 byte', () => {
      const bn = new BN('ffffff00', 16)
      bn.toBuffer({
        size: 4,
      })
        .toString('hex')
        .should.equal('ffffff00')
    })
  })
})
