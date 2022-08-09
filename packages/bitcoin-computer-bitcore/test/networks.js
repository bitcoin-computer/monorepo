import chai from 'chai'
import { Bitcoin } from './bitcoin'

const { expect } = chai
const should = chai.should()
const networks = Bitcoin.Networks

describe('Networks', () => {
  let customnet

  it('should contain all Networks', () => {
    should.exist(networks.livenet)
    should.exist(networks.testnet)
    should.exist(networks.defaultNetwork)
  })

  it('will enable/disable regtest Network', () => {
    networks.enableRegtest()
    networks.testnet.networkMagic.should.deep.equal(Buffer.from('fabfb5da', 'hex'))
    networks.testnet.port.should.equal(18444)
    networks.testnet.dnsSeeds.should.deep.equal([])
    networks.testnet.regtestEnabled.should.equal(true)

    networks.disableRegtest()
    networks.testnet.networkMagic.should.deep.equal(Buffer.from('0b110907', 'hex'))
    networks.testnet.port.should.equal(18333)
    networks.testnet.dnsSeeds.should.deep.equal([
      'testnet-seed.bitcoin.petertodd.org',
      'testnet-seed.bluematt.me',
      'testnet-seed.alexykot.me',
      'testnet-seed.bitcoin.schildbach.de',
    ])
  })

  it('will get network based on string "regtest" value', () => {
    const network = networks.get('regtest')
    network.should.equal(networks.testnet)
  })

  it('should be able to define a custom Network', () => {
    const custom = {
      name: 'customnet',
      alias: 'mynet',
      pubkeyhash: 0x10,
      privatekey: 0x90,
      scripthash: 0x08,
      xpubkey: 0x0278b20e,
      xprivkey: 0x0278ade4,
      networkMagic: 0xe7beb4d4,
      port: 20001,
      dnsSeeds: ['localhost', 'mynet.localhost'],
    }
    networks.add(custom)
    customnet = networks.get('customnet')
    Object.keys(custom).forEach((key) => {
      if (key !== 'networkMagic') {
        customnet[key].should.equal(custom[key])
      } else {
        const expected = Buffer.from('e7beb4d4', 'hex')
        customnet[key].should.deep.equal(expected)
      }
    })
  })

  it('can remove a custom network', () => {
    networks.remove(customnet)
    const net = networks.get('customnet')
    should.equal(net, undefined)
  })

  it('should not set a network map for an undefined value', () => {
    const custom = {
      name: 'somenet',
      pubkeyhash: 0x13,
      privatekey: 0x93,
      scripthash: 0x11,
      xpubkey: 0x0278b20f,
      xprivkey: 0x0278ade5,
      networkMagic: 0xe7beb4d5,
      port: 20008,
      dnsSeeds: ['somenet.localhost'],
    }
    networks.add(custom)
    const network = networks.get(undefined)
    should.not.exist(network)
    networks.remove(custom)
  })

  const constants = ['name', 'alias', 'pubkeyhash', 'scripthash', 'xpubkey', 'xprivkey']

  constants.forEach((key) => {
    it(`should have constant ${key} for livenet and testnet`, () => {
      Object.prototype.hasOwnProperty.call(networks.testnet, key).should.equal(true)
      Object.prototype.hasOwnProperty.call(networks.livenet, key).should.equal(true)
    })
  })

  it('tests only for the specified key', () => {
    expect(networks.get(0x6f, 'pubkeyhash')).to.equal(networks.testnet)
    expect(networks.get(0x6f, 'privatekey')).to.equal(undefined)
  })

  it('can test for multiple keys', () => {
    expect(networks.get(0x6f, ['pubkeyhash', 'scripthash'])).to.equal(networks.testnet)
    expect(networks.get(0xc4, ['pubkeyhash', 'scripthash'])).to.equal(networks.testnet)
    expect(networks.get(0x6f, ['privatekey', 'port'])).to.equal(undefined)
  })

  it('converts to string using the "name" property', () => {
    networks.livenet.toString().should.equal('livenet')
  })

  it('network object should be immutable', () => {
    expect(networks.testnet.name).to.equal('testnet')
    const fn = function () {
      networks.testnet.name = 'livenet'
    }
    expect(fn).to.throw(TypeError)
  })
})
