import _ from 'lodash'
import chai from 'chai'
import { Bitcoin } from '../bitcoin'

const { expect } = chai
const { UnspentOutput } = Bitcoin.Transaction

describe('UnspentOutput', () => {
  const sampleData1 = {
    address: 'mszYqVnqKoQx4jcTdJXxwKAissE3Jbrrc1',
    txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
    outputIndex: 0,
    script:
      'OP_DUP OP_HASH160 20 0x88d9931ea73d60eaf7e5671efc0552b912911f2a OP_EQUALVERIFY OP_CHECKSIG',
    satoshis: 1020000,
  }
  const sampleData2 = {
    txid: 'e42447187db5a29d6db161661e4bc66d61c3e499690fe5ea47f87b79ca573986',
    vout: 1,
    address: 'mgBCJAsvzgT2qNNeXsoECg2uPKrUsZ76up',
    scriptPubKey: '76a914073b7eae2823efa349e3b9155b8a735526463a0f88ac',
    amount: 0.0108,
  }

  it('roundtrip from raw data', () => {
    expect(new UnspentOutput(sampleData2).toObject()).to.deep.equal(sampleData2)
  })

  it('fails if no tx id is provided', () => {
    expect(() => new UnspentOutput({})).to.throw()
  })

  it('fails if vout is not a number', () => {
    const sample = _.cloneDeep(sampleData2)
    sample.vout = '1'
    expect(() => new UnspentOutput(sample)).to.throw()
  })

  it('displays nicely on the console', () => {
    const expected =
      '<UnspentOutput: a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458:0' +
      ', satoshis: 1020000, address: mszYqVnqKoQx4jcTdJXxwKAissE3Jbrrc1>'
    expect(new UnspentOutput(sampleData1).inspect()).to.equal(expected)
  })

  describe('checking the constructor parameters', () => {
    const notDefined = {
      txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
      outputIndex: 0,
      script:
        'OP_DUP OP_HASH160 20 0x88d9931ea73d60eaf7e5671efc0552b912911f2a OP_EQUALVERIFY OP_CHECKSIG',
    }
    const zero = {
      txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
      outputIndex: 0,
      script:
        'OP_DUP OP_HASH160 20 0x88d9931ea73d60eaf7e5671efc0552b912911f2a OP_EQUALVERIFY OP_CHECKSIG',
      amount: 0,
    }
    it('fails when no amount is defined', () => {
      expect(() => new UnspentOutput(notDefined)).to.throw('Must provide an amount for the output')
    })
    it('does not fail when amount is zero', () => {
      expect(() => new UnspentOutput(zero)).to.not.throw()
    })
  })

  it('toString returns txid:vout', () => {
    const expected = 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458:0'
    expect(new UnspentOutput(sampleData1).toString()).to.equal(expected)
  })

  it('to/from JSON roundtrip', () => {
    const utxo = new UnspentOutput(sampleData2)
    const obj = UnspentOutput.fromObject(utxo.toJSON()).toObject()
    expect(obj).to.deep.equal(sampleData2)
    const str = JSON.stringify(UnspentOutput.fromObject(obj))
    expect(JSON.parse(str)).to.deep.equal(sampleData2)
    const str2 = JSON.stringify(new UnspentOutput(JSON.parse(str)))
    expect(JSON.parse(str2)).to.deep.equal(sampleData2)
  })
})
