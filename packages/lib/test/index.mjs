import { Computer, Contract } from '../dist/bc-lib.browser.min.mjs'

class Counter extends Contract {
  constructor() {
    super({ n: 0 })
  }

  inc() {
    this.n += 1
  }
}

const computer = new Computer({
  mnemonic: 'drip audit speed belt gallery tribe bus poet used scrub view spike',
  network: 'regtest',
  url: 'http://localhost:1031',
})

await computer.faucet(1e6)
const counter = await computer.new(Counter)
document.getElementById('count').innerHTML = counter.n

await counter.inc()
document.getElementById('count').innerHTML = counter.n
