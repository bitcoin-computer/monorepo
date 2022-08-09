import chai from 'chai'
import { Bitcoin } from '../bitcoin'

const should = chai.should()
const { BufferWriter } = Bitcoin.encoding
const { BufferReader } = Bitcoin.encoding
const { BN } = Bitcoin.crypto

describe('BufferReader', () => {
  it('should make a new BufferReader', () => {
    let br = new BufferReader()
    should.exist(br)
    br = BufferReader()
    should.exist(br)
  })

  it('should create a new bufferreader with a buffer', () => {
    const buf = Buffer.alloc(0)
    const br = new BufferReader(buf)
    should.exist(br)
    Buffer.isBuffer(br.buf).should.equal(true)
  })
  it('should fail for invalid object', () => {
    const fail = function () {
      return new BufferReader(5)
    }
    fail.should.throw('Unrecognized argument for BufferReader')
  })

  describe('#set', () => {
    it('should set pos', () => {
      should.exist(
        BufferReader().set({
          pos: 1,
        }).pos
      )
    })
  })

  describe('#eof', () => {
    it('should return true for a blank br', () => {
      const br = new BufferReader(Buffer.from([]))
      br.finished().should.equal(true)
    })
  })

  describe('read', () => {
    it('should return the same buffer', () => {
      const buf = Buffer.from([0])
      const br = new BufferReader(buf)
      br.readAll().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should return a buffer of this length', () => {
      const buf = Buffer.alloc(10)
      buf.fill(0)
      const br = new BufferReader(buf)
      const buf2 = br.read(2)
      buf2.length.should.equal(2)
      br.finished().should.equal(false)
      br.pos.should.equal(2)
    })

    it('should work with 0 length', () => {
      const buf = Buffer.alloc(10)
      buf.fill(1)
      const br = new BufferReader(buf)
      const buf2 = br.read(0)
      buf2.length.should.equal(0)
      br.finished().should.equal(false)
      buf2.toString('hex').should.equal('')
    })
  })

  describe('readVarLengthBuffer', () => {
    it('returns correct buffer', () => {
      const buf = Buffer.from(
        '73010000003766404f00000000b305434f00000000f203' +
          '0000f1030000001027000048ee00000064000000004653656520626974636f696' +
          'e2e6f72672f666562323020696620796f7520686176652074726f75626c652063' +
          '6f6e6e656374696e6720616674657220323020466562727561727900473045022' +
          '1008389df45f0703f39ec8c1cc42c13810ffcae14995bb648340219e353b63b53' +
          'eb022009ec65e1c1aaeec1fd334c6b684bde2b3f573060d5b70c3a46723326e4e' +
          '8a4f1',
        'hex'
      )
      const br = new BufferReader(buf)
      const b1 = br.readVarLengthBuffer()
      b1.toString('hex').should.equal(
        '010000003766404f00000000b305434f000' +
          '00000f2030000f1030000001027000048ee000000640000000046536565206269' +
          '74636f696e2e6f72672f666562323020696620796f7520686176652074726f756' +
          '26c6520636f6e6e656374696e6720616674657220323020466562727561727900'
      )
      const b2 = br.readVarLengthBuffer()
      b2.toString('hex').should.equal(
        '30450221008389df45f0703f39ec8c1cc42' +
          'c13810ffcae14995bb648340219e353b63b53eb022009ec65e1c1aaeec1fd334c' +
          '6b684bde2b3f573060d5b70c3a46723326e4e8a4f1'
      )
    })
    it('fails on length too big', () => {
      const buf = Buffer.from('0a00', 'hex')
      const br = new BufferReader(buf)
      br.readVarLengthBuffer.bind(br).should.throw('Invalid length while reading varlength buffer')
    })
  })

  describe('#readUInt8', () => {
    it('should return 1', () => {
      const buf = Buffer.alloc(1)
      buf.writeUInt8(1, 0)
      const br = new BufferReader(buf)
      br.readUInt8().should.equal(1)
    })
  })

  describe('#readUInt16BE', () => {
    it('should return 1', () => {
      const buf = Buffer.alloc(2)
      buf.writeUInt16BE(1, 0)
      const br = new BufferReader(buf)
      br.readUInt16BE().should.equal(1)
    })
  })

  describe('#readUInt16LE', () => {
    it('should return 1', () => {
      const buf = Buffer.alloc(2)
      buf.writeUInt16LE(1, 0)
      const br = new BufferReader(buf)
      br.readUInt16LE().should.equal(1)
    })
  })

  describe('#readUInt32BE', () => {
    it('should return 1', () => {
      const buf = Buffer.alloc(4)
      buf.writeUInt32BE(1, 0)
      const br = new BufferReader(buf)
      br.readUInt32BE().should.equal(1)
    })
  })

  describe('#readUInt32LE', () => {
    it('should return 1', () => {
      const buf = Buffer.alloc(4)
      buf.writeUInt32LE(1, 0)
      const br = new BufferReader(buf)
      br.readUInt32LE().should.equal(1)
    })
  })

  describe('#readUInt64BEBN', () => {
    it('should return 1', () => {
      const buf = Buffer.alloc(8)
      buf.fill(0)
      buf.writeUInt32BE(1, 4)
      const br = new BufferReader(buf)
      br.readUInt64BEBN().toNumber().should.equal(1)
    })

    it('should return 2^64', () => {
      const buf = Buffer.alloc(8)
      buf.fill(0xff)
      const br = new BufferReader(buf)
      br.readUInt64BEBN()
        .toNumber()
        .should.equal(2 ** 64)
    })
  })

  describe('#readUInt64LEBN', () => {
    it('should return 1', () => {
      const buf = Buffer.alloc(8)
      buf.fill(0)
      buf.writeUInt32LE(1, 0)
      const br = new BufferReader(buf)
      br.readUInt64LEBN().toNumber().should.equal(1)
    })

    it('should return 10BTC', () => {
      const tenbtc = 10 * 1e8
      const tenbtcBuffer = Buffer.from('00ca9a3b00000000', 'hex')
      const br = new BufferReader(tenbtcBuffer)
      br.readUInt64LEBN().toNumber().should.equal(tenbtc)
    })

    it('should return 2^30', () => {
      const buf = Buffer.alloc(8)
      buf.fill(0)
      buf.writeUInt32LE(2 ** 30, 0)
      const br = new BufferReader(buf)
      br.readUInt64LEBN()
        .toNumber()
        .should.equal(2 ** 30)
    })

    it('should return 2^32 + 1', () => {
      const num = 2 ** 32 + 1
      const numBuffer = Buffer.from('0100000001000000', 'hex')
      const br = new BufferReader(numBuffer)
      br.readUInt64LEBN().toNumber().should.equal(num)
    })

    it('should return max number of satoshis', () => {
      const maxSatoshis = 21000000 * 1e8
      const maxSatoshisBuffer = Buffer.from('0040075af0750700', 'hex')
      const br = new BufferReader(maxSatoshisBuffer)
      br.readUInt64LEBN().toNumber().should.equal(maxSatoshis)
    })

    it('should return 2^53 - 1', () => {
      const maxSafe = 2 ** 53 - 1
      const maxSafeBuffer = Buffer.from('ffffffffffff1f00', 'hex')
      const br = new BufferReader(maxSafeBuffer)
      br.readUInt64LEBN().toNumber().should.equal(maxSafe)
    })

    it('should return 2^53', () => {
      const bn = new BN('20000000000000', 16)
      const bnBuffer = Buffer.from('0000000000002000', 'hex')
      const br = new BufferReader(bnBuffer)
      const readbn = br.readUInt64LEBN()
      readbn.cmp(bn).should.equal(0)
    })

    it('should return 0', () => {
      const buf = Buffer.alloc(8)
      buf.fill(0)
      const br = new BufferReader(buf)
      br.readUInt64LEBN().toNumber().should.equal(0)
    })

    it('should return 2^64', () => {
      const buf = Buffer.alloc(8)
      buf.fill(0xff)
      const br = new BufferReader(buf)
      br.readUInt64LEBN()
        .toNumber()
        .should.equal(2 ** 64)
    })
  })

  describe('#readVarintBuf', () => {
    it('should read a 1 byte varint', () => {
      const buf = Buffer.from([50])
      const br = new BufferReader(buf)
      br.readVarintBuf().length.should.equal(1)
    })

    it('should read a 3 byte varint', () => {
      const buf = Buffer.from([253, 253, 0])
      const br = new BufferReader(buf)
      br.readVarintBuf().length.should.equal(3)
    })

    it('should read a 5 byte varint', () => {
      const buf = Buffer.from([254, 0, 0, 0, 0])
      buf.writeUInt32LE(50000, 1)
      const br = new BufferReader(buf)
      br.readVarintBuf().length.should.equal(5)
    })

    it('should read a 9 byte varint', () => {
      const buf = BufferWriter()
        .writeVarintBN(new BN((2 ** 54).toString()))
        .concat()
      const br = new BufferReader(buf)
      br.readVarintBuf().length.should.equal(9)
    })
  })

  describe('#readVarintNum', () => {
    it('should read a 1 byte varint', () => {
      const buf = Buffer.from([50])
      const br = new BufferReader(buf)
      br.readVarintNum().should.equal(50)
    })

    it('should read a 3 byte varint', () => {
      const buf = Buffer.from([253, 253, 0])
      const br = new BufferReader(buf)
      br.readVarintNum().should.equal(253)
    })

    it('should read a 5 byte varint', () => {
      const buf = Buffer.from([254, 0, 0, 0, 0])
      buf.writeUInt32LE(50000, 1)
      const br = new BufferReader(buf)
      br.readVarintNum().should.equal(50000)
    })

    it('should throw an error on a 9 byte varint over the javascript uint precision limit', () => {
      const buf = BufferWriter()
        .writeVarintBN(new BN((2 ** 54).toString()))
        .concat()
      const br = new BufferReader(buf)
      ;(function () {
        br.readVarintNum()
      }.should.throw('number too large to retain precision - use readVarintBN'))
    })

    it('should not throw an error on a 9 byte varint not over the javascript uint precision limit', () => {
      const buf = BufferWriter()
        .writeVarintBN(new BN((2 ** 53).toString()))
        .concat()
      const br = new BufferReader(buf)
      ;(function () {
        br.readVarintNum()
      }.should.not.throw('number too large to retain precision - use readVarintBN'))
    })
  })

  describe('#readVarintBN', () => {
    it('should read a 1 byte varint', () => {
      const buf = Buffer.from([50])
      const br = new BufferReader(buf)
      br.readVarintBN().toNumber().should.equal(50)
    })

    it('should read a 3 byte varint', () => {
      const buf = Buffer.from([253, 253, 0])
      const br = new BufferReader(buf)
      br.readVarintBN().toNumber().should.equal(253)
    })

    it('should read a 5 byte varint', () => {
      const buf = Buffer.from([254, 0, 0, 0, 0])
      buf.writeUInt32LE(50000, 1)
      const br = new BufferReader(buf)
      br.readVarintBN().toNumber().should.equal(50000)
    })

    it('should read a 9 byte varint', () => {
      const buf = Buffer.concat([Buffer.from([255]), Buffer.from('ffffffffffffffff', 'hex')])
      const br = new BufferReader(buf)
      br.readVarintBN()
        .toNumber()
        .should.equal(2 ** 64)
    })
  })

  describe('#reverse', () => {
    it('should reverse this [0, 1]', () => {
      const buf = Buffer.from([0, 1])
      const br = new BufferReader(buf)
      br.reverse().readAll().toString('hex').should.equal('0100')
    })
  })
})
