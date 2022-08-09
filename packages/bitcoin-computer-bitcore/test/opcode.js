import _ from 'lodash'
import chai from 'chai'
import { Bitcoin } from './bitcoin'

const should = chai.should()
const { expect } = chai
const { Opcode } = Bitcoin

describe('Opcode', () => {
  it('should create a new Opcode', () => {
    const opcode = new Opcode(5)
    should.exist(opcode)
  })

  it('should convert to a string with this handy syntax', () => {
    Opcode(0).toString().should.equal('OP_0')
    Opcode(96).toString().should.equal('OP_16')
    Opcode(97).toString().should.equal('OP_NOP')
  })

  it('should convert to a number with this handy syntax', () => {
    Opcode('OP_0').toNumber().should.equal(0)
    Opcode('OP_16').toNumber().should.equal(96)
    Opcode('OP_NOP').toNumber().should.equal(97)
  })

  describe('#fromNumber', () => {
    it('should work for 0', () => {
      Opcode.fromNumber(0).num.should.equal(0)
    })
    it('should fail for non-number', () => {
      Opcode.fromNumber.bind(null, 'a string').should.throw('Invalid Argument')
    })
  })

  describe('#set', () => {
    it('should work for object', () => {
      Opcode(42).num.should.equal(42)
    })
    it('should fail for empty-object', () => {
      expect(() => {
        Opcode()
      }).to.throw(TypeError)
    })
  })

  describe('#toNumber', () => {
    it('should work for 0', () => {
      Opcode.fromNumber(0).toNumber().should.equal(0)
    })
  })

  describe('#buffer', () => {
    it('should correctly input/output a buffer', () => {
      const buf = Buffer.from('a6', 'hex')
      Opcode.fromBuffer(buf).toBuffer().should.deep.equal(buf)
    })
  })

  describe('#fromString', () => {
    it('should work for OP_0', () => {
      Opcode.fromString('OP_0').num.should.equal(0)
    })
    it('should fail for invalid string', () => {
      Opcode.fromString.bind(null, 'OP_SATOSHI').should.throw('Invalid opcodestr')
      Opcode.fromString.bind(null, 'BANANA').should.throw('Invalid opcodestr')
    })
    it('should fail for non-string', () => {
      Opcode.fromString.bind(null, 123).should.throw('Invalid Argument')
    })
  })

  describe('#toString', () => {
    it('should work for OP_0', () => {
      Opcode.fromString('OP_0').toString().should.equal('OP_0')
    })

    it('should not work for non-opcode', () => {
      expect(() => {
        Opcode('OP_NOTACODE').toString()
      }).to.throw('Opcode does not have a string representation')
    })
  })

  describe('@map', () => {
    it('should have a map containing 117 elements', () => {
      _.size(Opcode.map).should.equal(117)
    })
  })

  describe('@reverseMap', () => {
    it('should exist and have op 185', () => {
      should.exist(Opcode.reverseMap)
      Opcode.reverseMap[185].should.equal('OP_NOP10')
    })
  })
  const smallints = [
    Opcode('OP_0'),
    Opcode('OP_1'),
    Opcode('OP_2'),
    Opcode('OP_3'),
    Opcode('OP_4'),
    Opcode('OP_5'),
    Opcode('OP_6'),
    Opcode('OP_7'),
    Opcode('OP_8'),
    Opcode('OP_9'),
    Opcode('OP_10'),
    Opcode('OP_11'),
    Opcode('OP_12'),
    Opcode('OP_13'),
    Opcode('OP_14'),
    Opcode('OP_15'),
    Opcode('OP_16'),
  ]

  describe('@smallInt', () => {
    const testSmallInt = function (n, op) {
      Opcode.smallInt(n).toString().should.equal(op.toString())
    }

    for (let i = 0; i < smallints.length; i++) {
      const op = smallints[i]
      it(`should work for small int ${op}`, testSmallInt.bind(null, i, op))
    }

    it('with not number', () => {
      Opcode.smallInt.bind(null, '2').should.throw('Invalid Argument')
    })

    it('with n equal -1', () => {
      Opcode.smallInt.bind(null, -1).should.throw('Invalid Argument')
    })

    it('with n equal 17', () => {
      Opcode.smallInt.bind(null, 17).should.throw('Invalid Argument')
    })
  })
  describe('@isSmallIntOp', () => {
    const testIsSmallInt = function (op) {
      Opcode.isSmallIntOp(op).should.equal(true)
    }
    for (let i = 0; i < smallints.length; i++) {
      const op = smallints[i]
      it(`should work for small int ${op}`, testIsSmallInt.bind(null, op))
    }

    it('should work for non-small ints', () => {
      Opcode.isSmallIntOp(Opcode('OP_RETURN')).should.equal(false)
      Opcode.isSmallIntOp(Opcode('OP_CHECKSIG')).should.equal(false)
      Opcode.isSmallIntOp(Opcode('OP_IF')).should.equal(false)
      Opcode.isSmallIntOp(Opcode('OP_NOP')).should.equal(false)
    })
  })

  describe('#inspect', () => {
    it('should output opcode by name, hex, and decimal', () => {
      Opcode.fromString('OP_NOP').inspect().should.equal('<Opcode: OP_NOP, hex: 61, decimal: 97>')
    })
  })
})
