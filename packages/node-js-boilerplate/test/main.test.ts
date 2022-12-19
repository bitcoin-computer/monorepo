/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import chai, { expect } from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { Counter } from '../src/main'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

describe('Bitcoin Computer', () => {
  it('should export a function', () => {
    expect(Computer).not.to.be.undefined
    expect(typeof Computer).eq('function')
  })

  it('should create a computer object', () => {
    const computer = new Computer({ mnemonic: 'replace this seed' })

    expect(computer).not.to.be.undefined
    expect(typeof computer).eq('object')
  })

  it('should create a Javascript object', () => {
    expect(Counter).not.to.be.undefined
    expect(typeof Counter).eq('function')

    const counter = new Counter()

    expect(counter.n).eq(0)
  })

  it('should create a smart object', async () => {
    const computer = new Computer({
      mnemonic: 'replace this seed',

      // uncomment to run locally
      // url: 'http://127.0.0.1:3000',
      // network: 'regtest',
    })

    const counter = await computer.new(Counter)
    // @ts-ignore
    expect(counter).to.matchPattern({
      n: 0,
      _id: _.isString,
      _rev: _.isString,
      _root: _.isString,
    })
  })

  it('should update a smart object', async () => {
    const computer = new Computer({
      mnemonic: 'replace this seed',
      // uncomment to run locally
      // url: 'http://127.0.0.1:3000',
      // network: 'regtest',
    })

    const counter = await computer.new(Counter)
    await counter.inc()
    // @ts-ignore
    expect(counter).to.matchPattern({
      n: 1,
      _id: _.isString,
      _rev: _.isString,
      _root: _.isString,
    })
  })
})
