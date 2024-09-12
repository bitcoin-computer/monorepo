const { Computer, Contract } = require('@bitcoin-computer/lib')

async function run() {
  const computer = new Computer({
    chain: 'LTC',
    network: 'regtest',
    url: 'https://rltc.node.bitcoincomputer.io',
  })
  await computer.faucet(2 * 1e8)
  console.log('balance: ', await computer.getBalance())

  class Counter extends Contract {
    constructor(n) {
      super({ n })
    }
    inc() {
      this.n += 1
    }
    dec() {
      this.n -= 1
    }
  }

  const counter = await computer.new(Counter, [5])
  console.log(`counter: ${counter.n}`)
  await counter.inc()
  console.log(`counter: ${counter.n}`)
  await counter.dec()
  console.log(`counter: ${counter.n}`)
}

run()
