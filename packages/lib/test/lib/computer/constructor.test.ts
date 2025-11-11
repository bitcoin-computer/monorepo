import { Computer } from '@bitcoin-computer/lib'
import { chain, expect, network, url } from '../../utils/index.js'

describe('constructor', () => {
  // Default configuration
  it('Should connects to a remote node by default', () => {
    const computer = new Computer()
    expect(computer.getChain()).eq('LTC')
    expect(computer.getNetwork()).eq('regtest')
    expect(computer.getUrl()).eq('https://rltc.node.bitcoincomputer.io')
  })

  // Local configuration
  it('Should connect to a local node', async () => {
    const computer = new Computer({ chain, network, url })
    expect(computer.getChain()).eq('LTC')
    expect(computer.getNetwork()).eq('regtest')
    expect(computer.getUrl()).eq('http://127.0.0.1:1031')
  })

  // Custom configuration
  it('Should connect to custom parameters', async () => {
    const computer = new Computer({
      chain: 'BTC',
      network: 'mainnet',
      url: 'your-node-url',
      path: "m/44'/0'/0'/0",
      passphrase: 'hi',
      mode: 'prod',
    })
    expect(computer.getChain()).eq('BTC')
    expect(computer.getNetwork()).eq('mainnet')
    expect(computer.getUrl()).eq('your-node-url')
    expect(computer.getPath()).eq("m/44'/0'/0'/0")
    expect(computer.getPassphrase()).eq('hi')
  })
})
