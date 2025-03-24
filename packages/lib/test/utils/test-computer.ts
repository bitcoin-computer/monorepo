import { Computer } from '@bitcoin-computer/lib'

const localConfig = {
  chain: 'LTC',
  network: 'regtest',
  url: 'http://localhost:1031',
}

const defaultConfig = {
  chain: 'BTC',
  network: 'regtest',
  url: 'https://rltc.node.bitcoincomputer.io',
}

export class TestComputer extends Computer {
  // use localConfig here to run tests with a local Bitcoin Computer node
  constructor(opts = localConfig) {
    const chain = opts.chain
    const network = opts.network
    const url = opts.url

    super({ network, chain, url, cache: true, ...opts })
  }
}
