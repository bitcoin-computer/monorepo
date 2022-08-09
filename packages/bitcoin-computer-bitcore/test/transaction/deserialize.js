import { Bitcoin } from '../bitcoin'
import vectorsValid from '../data/bitcoind/tx_valid.json'
import vectorsInvalid from '../data/bitcoind/tx_invalid.json'

const { Transaction } = Bitcoin

describe('Transaction deserialization', () => {
  describe('valid transaction test case', () => {
    let index = 0
    vectorsValid.forEach((vector) => {
      it(`vector #${index}`, () => {
        if (vector.length > 1) {
          const hexa = vector[1]
          new Transaction(hexa).serialize(true).should.equal(hexa)
          index += 1
        }
      })
    })
  })
  describe('invalid transaction test case', () => {
    let index = 0
    vectorsInvalid.forEach((vector) => {
      it(`invalid vector #${index}`, () => {
        if (vector.length > 1) {
          const hexa = vector[1]
          new Transaction(hexa).serialize(true).should.equal(hexa)
          index += 1
        }
      })
    })
  })
})
