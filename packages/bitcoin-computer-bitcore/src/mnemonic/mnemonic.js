import _ from 'lodash'
import unorm from 'unorm'
import $ from '../util/preconditions'
import BN from '../crypto/bn'
import errors from '../errors'
import Hash from '../crypto/hash'
import HDPrivateKey from '../hdprivatekey'
import pbkdf2 from './pbkdf2'
import Random from '../crypto/random'
import Words from './words'

/**
 * This is an immutable class that represents a BIP39 Mnemonic code.
 * See BIP39 specification for more info: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
 * A Mnemonic code is a a group of easy to remember words used for the generation
 * of deterministic wallets. A Mnemonic can be used to generate a seed using
 * an optional passphrase, for later generate a HDPrivateKey.
 *
 * @example
 * // generate a random mnemonic
 * var mnemonic = new Mnemonic();
 * var phrase = mnemonic.phrase;
 *
 * // use a different language
 * var mnemonic = new Mnemonic(Mnemonic.Words.SPANISH);
 * var xprivkey = mnemonic.toHDPrivateKey();
 *
 * @param {*=} data - a seed, phrase, or entropy to initialize (can be skipped)
 * @param {Array=} wordlist - the wordlist to generate mnemonics from
 * @returns {Mnemonic} A new instance of Mnemonic
 * @constructor
 */
// eslint-disable-next-line consistent-return
const Mnemonic = function (data, wordlist) {
  if (!(this instanceof Mnemonic)) {
    return new Mnemonic(data, wordlist)
  }

  if (_.isArray(data)) {
    wordlist = data
    data = null
  }

  // handle data overloading
  let ent
  let phrase
  let seed
  if (Buffer.isBuffer(data)) {
    seed = data
  } else if (_.isString(data)) {
    phrase = unorm.nfkd(data)
  } else if (_.isNumber(data)) {
    ent = data
  } else if (data) {
    throw new errors.InvalidArgument('data', 'Must be a Buffer, a string or an integer')
  }
  ent = ent || 128

  // check and detect wordlist
  wordlist = wordlist || Mnemonic._getDictionary(phrase)
  if (phrase && !wordlist) {
    throw new errors.UnknownWordlist(phrase)
  }
  wordlist = wordlist || Mnemonic.Words.ENGLISH

  if (seed) {
    phrase = Mnemonic._entropy2mnemonic(seed, wordlist)
  }

  // validate phrase and ent
  if (phrase && !Mnemonic.isValid(phrase, wordlist)) {
    throw new errors.InvalidMnemonic(phrase)
  }
  if (ent % 32 !== 0 || ent < 128) {
    throw new errors.InvalidArgument('ENT', 'Values must be ENT > 128 and ENT % 32 == 0')
  }

  phrase = phrase || Mnemonic._mnemonic(ent, wordlist)

  Object.defineProperty(this, 'wordlist', {
    configurable: false,
    value: wordlist,
  })

  Object.defineProperty(this, 'phrase', {
    configurable: false,
    value: phrase,
  })
}

Mnemonic.Words = Words

/**
 * Will return a boolean if the mnemonic is valid
 *
 * @example
 *
 * const valid = Mnemonic.isValid(
 *   'lab rescue lunch elbow recall phrase perfect donkey biology guess moment husband',
 * );
 * // true
 *
 * @param {String} mnemonic - The mnemonic string
 * @param {String} [wordlist] - The wordlist used
 * @returns {boolean}
 */
Mnemonic.isValid = function (mnemonic, wordlist) {
  let i
  mnemonic = unorm.nfkd(mnemonic)
  wordlist = wordlist || Mnemonic._getDictionary(mnemonic)

  if (!wordlist) {
    return false
  }

  const words = mnemonic.split(' ')
  let bin = ''
  for (i = 0; i < words.length; i += 1) {
    const ind = wordlist.indexOf(words[i])
    if (ind < 0) return false
    bin += `00000000000${ind.toString(2)}`.slice(-11)
  }

  const cs = bin.length / 33
  const hashBits = bin.slice(-cs)
  const nonhashBits = bin.slice(0, bin.length - cs)
  const buf = Buffer.alloc(nonhashBits.length / 8)
  for (i = 0; i < nonhashBits.length / 8; i += 1) {
    buf.writeUInt8(parseInt(bin.slice(i * 8, (i + 1) * 8), 2), i)
  }
  const expectedHashBits = Mnemonic._entropyChecksum(buf)
  return expectedHashBits === hashBits
}

/**
 * Internal function to check if a mnemonic belongs to a wordlist.
 *
 * @param {String} mnemonic - The mnemonic string
 * @param {String} wordlist - The wordlist
 * @returns {boolean}
 */
Mnemonic._belongsToWordlist = function (mnemonic, wordlist) {
  const words = unorm.nfkd(mnemonic).split(' ')
  for (let i = 0; i < words.length; i += 1) {
    const ind = wordlist.indexOf(words[i])
    if (ind < 0) return false
  }
  return true
}

/**
 * Internal function to detect the wordlist used to generate the mnemonic.
 *
 * @param {String} mnemonic - The mnemonic string
 * @returns {Array} the wordlist or null
 */
Mnemonic._getDictionary = function (mnemonic) {
  if (!mnemonic) return null

  const dicts = Object.keys(Mnemonic.Words)
  for (let i = 0; i < dicts.length; i += 1) {
    const key = dicts[i]
    if (Mnemonic._belongsToWordlist(mnemonic, Mnemonic.Words[key])) {
      return Mnemonic.Words[key]
    }
  }
  return null
}

/**
 * Will generate a seed based on the mnemonic and optional passphrase.
 *
 * @param {String} [passphrase]
 * @returns {Buffer}
 */
Mnemonic.prototype.toSeed = function (passphrase) {
  passphrase = passphrase || ''
  return Mnemonic.pbkdf2(unorm.nfkd(this.phrase), unorm.nfkd(`mnemonic${passphrase}`), 2048, 64)
}

/**
 * Will generate a Mnemonic object based on a seed.
 *
 * @param {Buffer} [seed]
 * @param {string} [wordlist]
 * @returns {Mnemonic}
 */
Mnemonic.fromSeed = function (seed, wordlist) {
  $.checkArgument(Buffer.isBuffer(seed), 'seed must be a Buffer.')
  $.checkArgument(
    _.isArray(wordlist) || _.isString(wordlist),
    'wordlist must be a string or an array.'
  )
  return new Mnemonic(seed, wordlist)
}

/**
 *
 * Generates a HD Private Key from a Mnemonic.
 * Optionally receive a passphrase and bitcoin network.
 *
 * @param {String=} [passphrase]
 * @param {Network|String|number=} [network] - The network: 'livenet' or 'testnet'
 * @returns {HDPrivateKey}
 */
Mnemonic.prototype.toHDPrivateKey = function (passphrase, network) {
  const seed = this.toSeed(passphrase)
  return HDPrivateKey.fromSeed(seed, network)
}

/**
 * Will return a the string representation of the mnemonic
 *
 * @returns {String} Mnemonic
 */
Mnemonic.prototype.toString = function () {
  return this.phrase
}

/**
 * Will return a string formatted for the console
 *
 * @returns {String} Mnemonic
 */
Mnemonic.prototype.inspect = function () {
  return `<Mnemonic: ${this.toString()} >`
}

/**
 * Internal function to generate a random mnemonic
 *
 * @param {Number} ENT - Entropy size, defaults to 128
 * @param {Array} wordlist - Array of words to generate the mnemonic
 * @returns {String} Mnemonic string
 */
Mnemonic._mnemonic = function (ENT, wordlist) {
  const buf = Random.getRandomBuffer(ENT / 8)
  return Mnemonic._entropy2mnemonic(buf, wordlist)
}

/**
 * Internal function to generate mnemonic based on entropy
 *
 * @param {Number} entropy - Entropy buffer
 * @param {Array} wordlist - Array of words to generate the mnemonic
 * @returns {String} Mnemonic string
 */
Mnemonic._entropy2mnemonic = function (entropy, wordlist) {
  let bin = ''
  let i
  for (i = 0; i < entropy.length; i += 1) {
    bin += `00000000${entropy[i].toString(2)}`.slice(-8)
  }

  bin += Mnemonic._entropyChecksum(entropy)
  if (bin.length % 11 !== 0) {
    throw new errors.InvalidEntropy(bin)
  }
  const mnemonic = []
  for (i = 0; i < bin.length / 11; i += 1) {
    const wi = parseInt(bin.slice(i * 11, (i + 1) * 11), 2)
    mnemonic.push(wordlist[wi])
  }
  let ret
  if (wordlist === Mnemonic.Words.JAPANESE) {
    ret = mnemonic.join('\u3000')
  } else {
    ret = mnemonic.join(' ')
  }
  return ret
}

/**
 * Internal function to create checksum of entropy
 *
 * @param entropy
 * @returns {string} Checksum of entropy length / 32
 * @private
 */
Mnemonic._entropyChecksum = function (entropy) {
  const hash = Hash.sha256(entropy)
  const bits = entropy.length * 8
  const cs = bits / 32

  let hashbits = new BN(hash.toString('hex'), 16).toString(2)

  // zero pad the hash bits
  while (hashbits.length % 256 !== 0) {
    hashbits = `0${hashbits}`
  }

  const checksum = hashbits.slice(0, cs)

  return checksum
}

Mnemonic.pbkdf2 = pbkdf2

export default Mnemonic
