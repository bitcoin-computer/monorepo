import { Computer } from 'bitcoin-computer-lib'
import Counter from '../src/main'

describe('Bitcoin Computer', () => {
  it('should export a function', () => {
    expect(Computer).toBeDefined()
    expect(typeof Computer).toBe('function')
  })

  it('should create a computer object', () => {
    const computer = new Computer({ seed: 'replace this seed' })

    expect(computer).toBeDefined()
    expect(typeof computer).toBe('object')
  })

  it('should create a Javascript object', () => {
    expect(Counter).toBeDefined()
    expect(typeof Counter).toBe('function')

    const counter = new Counter()
    expect(counter).toEqual({
      n: 0,
    })
  })

  it('should create a smart object', async () => {
    const computer = new Computer({
      seed: 'replace this seed',

      // uncomment to run locally
      // url: 'http://127.0.0.1:3000',
      // network: 'regtest'
    })

    const counter = await computer.new(Counter)
    expect(counter).toEqual({
      n: 0,
      _id: expect.any(String),
      _rev: expect.any(String),
      _root: expect.any(String),
    })
  }, 20000)

  it('should update a smart object', async () => {
    const computer = new Computer({
      seed: 'replace this seed',
      // uncomment to run locally
      // url: 'http://127.0.0.1:3000',
      // network: 'regtest'
    })

    const counter = await computer.new(Counter)
    await counter.inc()
    expect(counter).toEqual({
      n: 1,
      _id: expect.any(String),
      _rev: expect.any(String),
      _root: expect.any(String),
    })
  }, 20000)
})
