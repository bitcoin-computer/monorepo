/* eslint-disable no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai'
import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'
import { Computer } from '@bitcoin-computer/lib'
import dotenv from 'dotenv'
import { Counter } from '../src/main'

// If you want to connect to your local Bitcoin Computer Node, create a .env file
// in the monorepo root level and add the following line:
// BCN_URL=http://localhost:1031

dotenv.config({ path: '../../.env' })

const url = process.env.BCN_URL

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

describe('Bitcoin Computer', () => {
  it('should export a function', () => {
    expect(Computer).not.to.be.undefined
    expect(typeof Computer).eq('function')
  })

  it('should create a computer object', () => {
    const computer = new Computer({ url })
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
    const computer = new Computer({ url })

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
    const computer = new Computer({ url })

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
