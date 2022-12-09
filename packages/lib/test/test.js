import { expect } from 'chai'
import { Computer, Contract } from '../src/bitcoin-computer-lib.es'

describe('Should work with chai', () => {
  it('Should be able to import the bitcoin computer', () => {
    const computer = new Computer()
    expect(computer).to.be.an('object')
  })

  it('Should create an smart object with a determined class', async () => {

    const computer1 = new Computer()
    const computer2 = new Computer()

    // Generate coinbase output for computer2
    const res = await computer2.rpcCall('generatetoaddress', `1 ${computer2.getAddress()}`)
    expect(res.result.length).to.be.equal(1)

    // Generate 100 blocks for computer1, so computer2 can spend the coinbase output
    await computer2.rpcCall('generatetoaddress', `100 ${computer1.getAddress()}`)
    
    class Counter extends Contract {
      constructor() {
        super()
        this.count = 0
      }
      inc() {
        this.count += 1
      }
    }
    const counter = await computer2.new(Counter,[])
    expect(counter).to.be.an('object')
    expect(counter.count).eq(0)

    await counter.inc()
    expect(counter.count).eq(1)

  })

})