import { Bitcoin } from '../bitcoin'

const JSUtil = Bitcoin.util.js

describe('js utils', () => {
  describe('isValidJSON', () => {
    const hexa = '8080808080808080808080808080808080808080808080808080808080808080'
    const json = '{"key": ["value", "value2"]}'

    it('does not mistake an integer as valid json object', () => {
      const valid = JSUtil.isValidJSON(hexa)
      valid.should.equal(false)
    })

    it('correctly validates a json object', () => {
      const valid = JSUtil.isValidJSON(json)
      valid.should.equal(true)
    })

    it('correctly validates an array json object', () => {
      const valid = JSUtil.isValidJSON(json)
      valid.should.equal(true)
    })
  })

  describe('isNaturalNumber', () => {
    it('false for float', () => {
      const a = JSUtil.isNaturalNumber(0.1)
      a.should.equal(false)
    })

    it('false for string float', () => {
      const a = JSUtil.isNaturalNumber('0.1')
      a.should.equal(false)
    })

    it('false for string integer', () => {
      const a = JSUtil.isNaturalNumber('1')
      a.should.equal(false)
    })

    it('false for negative integer', () => {
      const a = JSUtil.isNaturalNumber(-1)
      a.should.equal(false)
    })

    it('false for negative integer string', () => {
      const a = JSUtil.isNaturalNumber('-1')
      a.should.equal(false)
    })

    it('false for infinity', () => {
      const a = JSUtil.isNaturalNumber(Infinity)
      a.should.equal(false)
    })

    it('false for NaN', () => {
      const a = JSUtil.isNaturalNumber(NaN)
      a.should.equal(false)
    })

    it('true for zero', () => {
      const a = JSUtil.isNaturalNumber(0)
      a.should.equal(true)
    })

    it('true for positive integer', () => {
      const a = JSUtil.isNaturalNumber(1000)
      a.should.equal(true)
    })
  })
})
