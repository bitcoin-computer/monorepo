import chai from 'chai'
import { Bitcoin } from '../bitcoin'

const { expect } = chai
const { errors } = Bitcoin
const BufferUtil = Bitcoin.util.buffer

describe('buffer utils', () => {
  describe('equals', () => {
    it('recognizes these two equal buffers', () => {
      const bufferA = Buffer.from([1, 2, 3])
      const bufferB = Buffer.from('010203', 'hex')
      BufferUtil.equal(bufferA, bufferB).should.equal(true)
    })
    it('no false positive: returns false with two different buffers', () => {
      const bufferA = Buffer.from([1, 2, 3])
      const bufferB = Buffer.from('010204', 'hex')
      BufferUtil.equal(bufferA, bufferB).should.equal(false)
    })
    it('coverage: quickly realizes a difference in size and returns false', () => {
      const bufferA = Buffer.from([1, 2, 3])
      const bufferB = Buffer.from([])
      BufferUtil.equal(bufferA, bufferB).should.equal(false)
    })
    it('"equals" is an an alias for "equal"', () => {
      const bufferA = Buffer.from([1, 2, 3])
      const bufferB = Buffer.from([1, 2, 3])
      BufferUtil.equal(bufferA, bufferB).should.equal(true)
      BufferUtil.equals(bufferA, bufferB).should.equal(true)
    })
  })

  describe('fill', () => {
    it('checks arguments', () => {
      expect(() => {
        BufferUtil.fill('something')
      }).to.throw(errors.InvalidArgumentType)
      expect(() => {
        BufferUtil.fill(Buffer.from([0, 0, 0]), 'invalid')
      }).to.throw(errors.InvalidArgumentType)
    })
    it('works correctly for a small buffer', () => {
      const buffer = BufferUtil.fill(Buffer.alloc(10), 6)
      for (let i = 0; i < 10; i++) {
        buffer[i].should.equal(6)
      }
    })
  })

  describe('isBuffer', () => {
    it('has no false positive', () => {
      expect(BufferUtil.isBuffer(1)).to.equal(false)
    })
    it('has no false negative', () => {
      expect(BufferUtil.isBuffer(Buffer.alloc(0))).to.equal(true)
    })
  })

  describe('emptyBuffer', () => {
    it('creates a buffer filled with zeros', () => {
      const buffer = BufferUtil.emptyBuffer(10)
      expect(buffer.length).to.equal(10)
      for (let i = 0; i < 10; i++) {
        expect(buffer[i]).to.equal(0)
      }
    })
    it('checks arguments', () => {
      expect(() => {
        BufferUtil.emptyBuffer('invalid')
      }).to.throw(errors.InvalidArgumentType)
    })
  })

  describe('single byte buffer <=> integer', () => {
    it('integerAsSingleByteBuffer should return a buffer of length 1', () => {
      expect(BufferUtil.integerAsSingleByteBuffer(100)[0]).to.equal(100)
    })
    it('should check the type', () => {
      expect(() => {
        BufferUtil.integerAsSingleByteBuffer('invalid')
      }).to.throw(errors.InvalidArgumentType)
      expect(() => {
        BufferUtil.integerFromSingleByteBuffer('invalid')
      }).to.throw(errors.InvalidArgumentType)
    })
    it('works correctly for edge cases', () => {
      expect(BufferUtil.integerAsSingleByteBuffer(255)[0]).to.equal(255)
      expect(BufferUtil.integerAsSingleByteBuffer(-1)[0]).to.equal(255)
    })
    it('does a round trip', () => {
      expect(
        BufferUtil.integerAsSingleByteBuffer(
          BufferUtil.integerFromSingleByteBuffer(Buffer.from([255]))
        )[0]
      ).to.equal(255)
    })
  })

  describe('4byte buffer integer <=> integer', () => {
    it('integerAsBuffer should return a buffer of length 4', () => {
      expect(BufferUtil.integerAsBuffer(100).length).to.equal(4)
    })
    it('is little endian', () => {
      expect(BufferUtil.integerAsBuffer(100)[3]).to.equal(100)
    })
    it('should check the type', () => {
      expect(() => {
        BufferUtil.integerAsBuffer('invalid')
      }).to.throw(errors.InvalidArgumentType)
      expect(() => {
        BufferUtil.integerFromBuffer('invalid')
      }).to.throw(errors.InvalidArgumentType)
    })
    it('works correctly for edge cases', () => {
      expect(BufferUtil.integerAsBuffer(4294967295)[0]).to.equal(255)
      expect(BufferUtil.integerAsBuffer(4294967295)[3]).to.equal(255)
      expect(BufferUtil.integerAsBuffer(-1)[0]).to.equal(255)
      expect(BufferUtil.integerAsBuffer(-1)[3]).to.equal(255)
    })
    it('does a round trip', () => {
      expect(BufferUtil.integerFromBuffer(BufferUtil.integerAsBuffer(10000))).to.equal(10000)
    })
  })

  describe('buffer to hex', () => {
    it('returns an expected value in hexa', () => {
      expect(BufferUtil.bufferToHex(Buffer.from([255, 0, 128]))).to.equal('ff0080')
    })
    it('checks the argument type', () => {
      expect(() => {
        BufferUtil.bufferToHex('invalid')
      }).to.throw(errors.InvalidArgumentType)
    })
    it('round trips', () => {
      const original = Buffer.from([255, 0, 128])
      const hexa = BufferUtil.bufferToHex(original)
      const back = BufferUtil.hexToBuffer(hexa)
      expect(BufferUtil.equal(original, back)).to.equal(true)
    })
  })

  describe('reverse', () => {
    it('reverses a buffer', () => {
      // http://bit.ly/1J2Ai4x
      const original = Buffer.from([255, 0, 128])
      const reversed = BufferUtil.reverse(original)
      original[0].should.equal(reversed[2])
      original[1].should.equal(reversed[1])
      original[2].should.equal(reversed[0])
    })
  })
})
