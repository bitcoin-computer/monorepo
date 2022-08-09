import chai from 'chai'
import { Bitcoin } from '../bitcoin'

const should = chai.should()
const { BN } = Bitcoin.crypto
const { BufferReader } = Bitcoin.encoding
const { BufferWriter } = Bitcoin.encoding
const { Varint } = Bitcoin.encoding

describe('Varint', () => {
  it('should make a new varint', () => {
    const buf = Buffer.from('00', 'hex')
    let varint = new Varint(buf)
    should.exist(varint)
    varint.buf.toString('hex').should.equal('00')
    varint = Varint(buf)
    should.exist(varint)
    varint.buf.toString('hex').should.equal('00')

    // various ways to use the constructor
    Varint(Varint(0).toBuffer()).toNumber().should.equal(0)
    Varint(0).toNumber().should.equal(0)
    Varint(new BN(0)).toNumber().should.equal(0)
  })

  describe('#set', () => {
    it('should set a buffer', () => {
      const buf = Buffer.from('00', 'hex')
      const varint = Varint().set({ buf })
      varint.buf.toString('hex').should.equal('00')
      varint.set({})
      varint.buf.toString('hex').should.equal('00')
    })
  })

  describe('#fromString', () => {
    it('should set a buffer', () => {
      const buf = BufferWriter().writeVarintNum(5).concat()
      const varint = Varint().fromString(buf.toString('hex'))
      varint.toNumber().should.equal(5)
    })
  })

  describe('#toString', () => {
    it('should return a buffer', () => {
      const buf = BufferWriter().writeVarintNum(5).concat()
      const varint = Varint().fromString(buf.toString('hex'))
      varint.toString().should.equal('05')
    })
  })

  describe('#fromBuffer', () => {
    it('should set a buffer', () => {
      const buf = BufferWriter().writeVarintNum(5).concat()
      const varint = Varint().fromBuffer(buf)
      varint.toNumber().should.equal(5)
    })
  })

  describe('#fromBufferReader', () => {
    it('should set a buffer reader', () => {
      const buf = BufferWriter().writeVarintNum(5).concat()
      const br = BufferReader(buf)
      const varint = Varint().fromBufferReader(br)
      varint.toNumber().should.equal(5)
    })
  })

  describe('#fromBN', () => {
    it('should set a number', () => {
      const varint = Varint().fromBN(new BN(5))
      varint.toNumber().should.equal(5)
    })
  })

  describe('#fromNumber', () => {
    it('should set a number', () => {
      const varint = Varint().fromNumber(5)
      varint.toNumber().should.equal(5)
    })
  })

  describe('#toBuffer', () => {
    it('should return a buffer', () => {
      const buf = BufferWriter().writeVarintNum(5).concat()
      const varint = Varint(buf)
      varint.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })
  })

  describe('#toBN', () => {
    it('should return a buffer', () => {
      const varint = Varint(5)
      varint.toBN().toString().should.equal(new BN(5).toString())
    })
  })

  describe('#toNumber', () => {
    it('should return a buffer', () => {
      const varint = Varint(5)
      varint.toNumber().should.equal(5)
    })
  })
})
