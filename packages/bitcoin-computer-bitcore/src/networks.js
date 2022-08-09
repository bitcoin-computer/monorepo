import _ from 'lodash'
import BufferUtil from './util/buffer'
import JSUtil from './util/js'

const networks = []
const networkMaps = {}

/**
 * A network is merely a map containing values that correspond to version
 * numbers for each bitcoin network. Currently only supporting "livenet"
 * (a.k.a. "mainnet") and "testnet".
 * @constructor
 */
function Network() {}

Network.prototype.toString = function toString() {
  return this.name
}

/**
 * @function
 * @member Networks#get
 * Retrieves the network associated with a magic number or string.
 * @param {string|number|Network} arg
 * @param {string|Array} keys - if set, only check if the magic number associated with this name
 *   matches
 * @return Network
 */
function get(arg, keys) {
  if (~networks.indexOf(arg)) {
    return arg
  }
  if (keys) {
    if (!_.isArray(keys)) {
      keys = [keys]
    }

    const index = networks.findIndex((network) => _.some(keys, (key) => network[key] === arg))
    if (index !== -1) {
      return networks[index]
    }

    return undefined
  }
  return networkMaps[arg]
}

/**
 * @function
 * @member Networks#add
 * Will add a custom Network
 * @param {Object} data
 * @param {string} data.name - The name of the network
 * @param {string} data.alias - The aliased name of the network
 * @param {Number} data.pubkeyhash - The publickey hash prefix
 * @param {Number} data.privatekey - The privatekey prefix
 * @param {Number} data.scripthash - The scripthash prefix
 * @param {Number} data.xpubkey - The extended public key magic
 * @param {Number} data.xprivkey - The extended private key magic
 * @param {Number} data.networkMagic - The network magic number
 * @param {Number} data.port - The network port
 * @param {Array}  data.dnsSeeds - An array of dns seeds
 * @return Network
 */
function addNetwork(data) {
  const network = new Network()

  JSUtil.defineImmutable(network, {
    name: data.name,
    alias: data.alias,
    pubkeyhash: data.pubkeyhash,
    privatekey: data.privatekey,
    scripthash: data.scripthash,
    xpubkey: data.xpubkey,
    xprivkey: data.xprivkey,
  })

  if (data.networkMagic) {
    JSUtil.defineImmutable(network, {
      networkMagic: BufferUtil.integerAsBuffer(data.networkMagic),
    })
  }

  if (data.port) {
    JSUtil.defineImmutable(network, {
      port: data.port,
    })
  }

  if (data.dnsSeeds) {
    JSUtil.defineImmutable(network, {
      dnsSeeds: data.dnsSeeds,
    })
  }
  _.each(network, (value) => {
    if (!_.isUndefined(value) && !_.isObject(value)) {
      networkMaps[value] = network
    }
  })

  networks.push(network)

  return network
}

/**
 * @function
 * @member Networks#remove
 * Will remove a custom network
 * @param {Network} network
 */
function removeNetwork(network) {
  for (let i = 0; i < networks.length; i += 1) {
    if (networks[i] === network) {
      networks.splice(i, 1)
    }
  }
  Object.keys(networkMaps).forEach((objectKey) => {
    if (networkMaps[objectKey] === network) {
      delete networkMaps[objectKey]
    }
  })
}

addNetwork({
  name: 'livenet',
  alias: 'mainnet',
  pubkeyhash: 0x00,
  privatekey: 0x80,
  scripthash: 0x05,
  xpubkey: 0x0488b21e,
  xprivkey: 0x0488ade4,
  networkMagic: 0xf9beb4d9,
  port: 8333,
  dnsSeeds: [
    'seed.bitcoin.sipa.be',
    'dnsseed.bluematt.me',
    'dnsseed.bitcoin.dashjr.org',
    'seed.bitcoinstats.com',
    'seed.bitnodes.io',
    'bitseed.xf2.org',
  ],
})

/**
 * @instance
 * @member Networks#livenet
 */
const livenet = get('livenet')

addNetwork({
  name: 'testnet',
  alias: 'regtest',
  pubkeyhash: 0x6f,
  privatekey: 0xef,
  scripthash: 0xc4,
  xpubkey: 0x043587cf,
  xprivkey: 0x04358394,
})

/**
 * @instance
 * @member Networks#testnet
 */
const testnet = get('testnet')

// Add configurable values for testnet/regtest

const TESTNET = {
  PORT: 18333,
  NETWORK_MAGIC: BufferUtil.integerAsBuffer(0x0b110907),
  DNS_SEEDS: [
    'testnet-seed.bitcoin.petertodd.org',
    'testnet-seed.bluematt.me',
    'testnet-seed.alexykot.me',
    'testnet-seed.bitcoin.schildbach.de',
  ],
}

Object.keys(TESTNET).forEach((objectKey) => {
  if (!_.isObject(TESTNET[objectKey])) {
    networkMaps[TESTNET[objectKey]] = testnet
  }
})

const REGTEST = {
  PORT: 18444,
  NETWORK_MAGIC: BufferUtil.integerAsBuffer(0xfabfb5da),
  DNS_SEEDS: [],
}

Object.keys(REGTEST).forEach((objectKey) => {
  if (!_.isObject(REGTEST[objectKey])) {
    networkMaps[REGTEST[objectKey]] = testnet
  }
})

Object.defineProperty(testnet, 'port', {
  enumerable: true,
  configurable: false,
  get() {
    if (this.regtestEnabled) {
      return REGTEST.PORT
    }
    return TESTNET.PORT
  },
})

Object.defineProperty(testnet, 'networkMagic', {
  enumerable: true,
  configurable: false,
  get() {
    if (this.regtestEnabled) {
      return REGTEST.NETWORK_MAGIC
    }
    return TESTNET.NETWORK_MAGIC
  },
})

Object.defineProperty(testnet, 'dnsSeeds', {
  enumerable: true,
  configurable: false,
  get() {
    if (this.regtestEnabled) {
      return REGTEST.DNS_SEEDS
    }
    return TESTNET.DNS_SEEDS
  },
})

/**
 * @function
 * @member Networks#enableRegtest
 * Will enable regtest features for testnet
 */
function enableRegtest() {
  testnet.regtestEnabled = true
}

/**
 * @function
 * @member Networks#disableRegtest
 * Will disable regtest features for testnet
 */
function disableRegtest() {
  testnet.regtestEnabled = false
}

/**
 * @namespace Networks
 */
export default {
  add: addNetwork,
  remove: removeNetwork,
  defaultNetwork: livenet,
  livenet,
  mainnet: livenet,
  testnet,
  get,
  enableRegtest,
  disableRegtest,
}
