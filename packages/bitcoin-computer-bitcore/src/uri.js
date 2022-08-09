import _ from 'lodash'
import URL from 'url'
import Address from './address'
import Unit from './unit'

/**
 * Bitcore URI
 *
 * Instantiate an URI from a bitcoin cash URI String or an Object. An URI instance
 * can be created with a bitcoin cash uri string or an object. All instances of
 * URI are valid, the static method isValid allows checking before instantiation.
 *
 * All standard parameters can be found as members of the class, the address
 * is represented using an {Address} instance and the amount is represented in
 * satoshis. Any other non-standard parameters can be found under the extra member.
 *
 * @example
 * ```javascript
 *
 * var uri = new URI('bitcoincash:12A1MyfXbW6RhdRAZEqofac5jCQQjwEPBu?amount=1.2');
 * console.log(uri.address, uri.amount);
 * ```
 *
 * @param {string|Object} data - A bitcoin cash URI string or an Object
 * @param {Array.<string>=} knownParams - Required non-standard params
 * @throws {TypeError} Invalid bitcoin address
 * @throws {TypeError} Invalid amount
 * @throws {Error} Unknown required argument
 * @returns {URI} A new valid and frozen instance of URI
 * @constructor
 */
// eslint-disable-next-line consistent-return
const URI = function (data, knownParams) {
  // #weirdstuff refactor
  if (!(this instanceof URI)) {
    return new URI(data, knownParams)
  }

  this.extras = {}
  this.knownParams = knownParams || []
  this.address = null
  this.network = null
  this.amount = null
  this.message = null

  if (typeof data === 'string') {
    const params = URI.parse(data)
    if (params.amount) {
      params.amount = this._parseAmount(params.amount)
    }
    this._fromObject(params)
  } else if (typeof data === 'object') {
    this._fromObject(data)
  } else {
    throw new TypeError('Unrecognized data format.')
  }
}

/**
 * Instantiate a URI from a String
 *
 * @param {string} str - JSON string or object of the URI
 * @returns {URI} A new instance of a URI
 */
URI.fromString = function fromString(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string')
  }
  return new URI(str)
}

/**
 * Instantiate a URI from an Object
 *
 * @param {Object} data - object of the URI
 * @returns {URI} A new instance of a URI
 */
URI.fromObject = function fromObject(json) {
  return new URI(json)
}

/**
 * Check if an bitcoin cash URI string is valid
 *
 * @example
 * ```javascript
 *
 * var valid = URI.isValid('bitcoincash:12A1MyfXbW6RhdRAZEqofac5jCQQjwEPBu');
 * // true
 * ```
 *
 * @param {string|Object} data - A bitcoin cash URI string or an Object
 * @param {Array.<string>=} knownParams - Required non-standard params
 * @returns {boolean} Result of uri validation
 */
URI.isValid = function (arg, knownParams) {
  try {
    // #weirdstuff refactor
    // eslint-disable-next-line no-new
    new URI(arg, knownParams)
  } catch (err) {
    return false
  }
  return true
}

/**
 * Convert a bitcoin cash URI string into a simple object.
 *
 * @param {string} uri - A bitcoin cash URI string
 * @throws {TypeError} Invalid bitcoin cash URI
 * @returns {Object} An object with the parsed params
 */
URI.parse = function (uri) {
  const info = URL.parse(uri, true)

  if (info.protocol !== 'bitcoincash:') {
    throw new TypeError('Invalid bitcoin cash URI')
  }

  // workaround to host insensitiveness
  const group = /[^:]*:\/?\/?([^?]*)/.exec(uri)
  info.query.address = (group && group[1]) || undefined

  return info.query
}

URI.Members = ['address', 'amount', 'message', 'label', 'r']

/**
 * Internal function to load the URI instance with an object.
 *
 * @param {Object} obj - Object with the information
 * @throws {TypeError} Invalid bitcoin address
 * @throws {TypeError} Invalid amount
 * @throws {Error} Unknown required argument
 */
URI.prototype._fromObject = function (obj) {
  if (!Address.isValid(obj.address)) {
    throw new TypeError('Invalid bitcoin address')
  }

  this.address = new Address(obj.address)
  this.network = this.address.network
  this.amount = obj.amount

  Object.keys(obj).forEach((key) => {
    if (key !== 'address' && key !== 'amount') {
      if (/^req-/.exec(key) && this.knownParams.indexOf(key) === -1) {
        throw Error(`Unknown required argument ${key}`)
      }

      const destination = URI.Members.indexOf(key) > -1 ? this : this.extras
      destination[key] = obj[key]
    }
  })
}

/**
 * Internal function to transform a BTC string amount into satoshis
 *
 * @param {string} amount - Amount BTC string
 * @throws {TypeError} Invalid amount
 * @returns {Object} Amount represented in satoshis
 */
URI.prototype._parseAmount = function (amount) {
  amount = Number(amount)
  if (Number.isNaN(amount)) {
    throw new TypeError('Invalid amount')
  }
  return Unit.fromBTC(amount).toSatoshis()
}

URI.prototype.toJSON = function toObject() {
  const json = {}
  for (let i = 0; i < URI.Members.length; i += 1) {
    const m = URI.Members[i]
    if (Object.keys(this).findIndex((key) => key === m) !== 1 && typeof this[m] !== 'undefined') {
      json[m] = this[m].toString()
    }
  }
  _.extend(json, this.extras)
  return json
}
URI.prototype.toObject = URI.prototype.toJSON

/**
 * Will return a the string representation of the URI
 *
 * @returns {string} Bitcoin cash URI string
 */
URI.prototype.toString = function () {
  const query = {}
  if (this.amount) {
    query.amount = Unit.fromSatoshis(this.amount).toBTC()
  }
  if (this.message) {
    query.message = this.message
  }
  if (this.label) {
    query.label = this.label
  }
  if (this.r) {
    query.r = this.r
  }
  _.extend(query, this.extras)

  return URL.format({
    protocol: 'bitcoincash:',
    host: this.address,
    query,
  })
}

/**
 * Will return a string formatted for the console
 *
 * @returns {string} Bitcoin cash URI
 */
URI.prototype.inspect = function () {
  return `<URI: ${this.toString()}>`
}

export default URI
