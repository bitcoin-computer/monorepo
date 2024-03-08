/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import { Counter } from '../src/main'

const { expect } = chai
chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

const opts = {
  mnemonic: 'replace this seed',
  url: 'http://127.0.0.1:1031',
  network: 'regtest' as any,
}

describe('Bitcoin Computer', () => {
  it('should export a function', () => {
    expect(Computer).not.to.be.undefined
    expect(typeof Computer).eq('function')
  })

  it('should create a computer object', () => {
    /**
     * To run the tests with the Bitcoin Computer testnet node remove the opts argument.
     */
    const computer = new Computer(opts)

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
    const computer = new Computer(opts)

    // @ts-ignore
    await computer.faucet(1e7)
    const counter = await computer.new(Counter)
    // @ts-ignore
    expect(counter).to.matchPattern({
      n: 0,
      _id: _.isString,
      _rev: _.isString,
      _root: _.isString,
      _amount: _.isNumber,
      _owners: _.isArray,
    })
  })

  it('should update a smart object', async () => {
    const computer = new Computer(opts)

    // @ts-ignore
    await computer.faucet(1e7)
    const counter = await computer.new(Counter)
    await counter.inc()
    // @ts-ignore
    expect(counter).to.matchPattern({
      n: 1,
      _id: _.isString,
      _rev: _.isString,
      _root: _.isString,
      _amount: _.isNumber,
      _owners: _.isArray,
    })
  })
})
