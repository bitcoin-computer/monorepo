import _ from 'lodash'
import $ from '../util/preconditions'
import BN from '../crypto/bn'
import BufferUtil from '../util/buffer'
import BufferWriter from '../encoding/bufferwriter'
import errors from '../errors'
import JSUtil from '../util/js'
import Script from '../script/script'

const MAX_SAFE_INTEGER = 0x1fffffffffffff

class Output {
  constructor(args) {
    if (_.isObject(args)) {
      this.satoshis = args.satoshis
      if (BufferUtil.isBuffer(args.script)) {
        this._scriptBuffer = args.script
      } else {
        let script
        if (_.isString(args.script) && JSUtil.isHexa(args.script)) {
          script = Buffer.from(args.script, 'hex')
        } else {
          ;({ script } = args)
        }
        this.setScript(script)
      }
    } else {
      throw new TypeError('Unrecognized argument for Output')
    }
  }

  get script() {
    if (this._script) {
      return this._script
    }
    this.setScriptFromBuffer(this._scriptBuffer)
    return this._script
  }

  get satoshis() {
    return this._satoshis
  }

  set satoshis(num) {
    if (num instanceof BN) {
      this._satoshisBN = num
      this._satoshis = num.toNumber()
    } else if (_.isString(num)) {
      this._satoshis = parseInt(num, 10)
      this._satoshisBN = BN.fromNumber(this._satoshis)
    } else {
      $.checkArgument(JSUtil.isNaturalNumber(num), 'Output satoshis is not a natural number')
      this._satoshisBN = BN.fromNumber(num)
      this._satoshis = num
    }
    $.checkState(JSUtil.isNaturalNumber(this._satoshis), 'Output satoshis is not a natural number')
  }

  get satoshisBN() {
    return this._satoshisBN
  }

  set satoshisBN(num) {
    this._satoshisBN = num
    this._satoshis = num.toNumber()
    $.checkState(JSUtil.isNaturalNumber(this._satoshis), 'Output satoshis is not a natural number')
  }

  static fromObject(data) {
    return new Output(data)
  }

  static fromBufferReader(br) {
    const obj = {}
    obj.satoshis = br.readUInt64LEBN()
    const size = br.readVarintNum()
    if (size !== 0) {
      obj.script = br.read(size)
    } else {
      obj.script = Buffer.from([])
    }
    return new Output(obj)
  }

  invalidSatoshis() {
    if (this._satoshis > MAX_SAFE_INTEGER) {
      return 'transaction txout satoshis greater than max safe integer'
    }
    if (this._satoshis !== this._satoshisBN.toNumber()) {
      return 'transaction txout satoshis has corrupted value'
    }
    if (this._satoshis < 0) {
      return 'transaction txout negative'
    }
    return false
  }

  toJSON() {
    const obj = {
      satoshis: this.satoshis,
    }
    obj.script = this._scriptBuffer.toString('hex')
    return obj
  }

  toObject() {
    return this.toJSON()
  }

  setScriptFromBuffer(buff) {
    this._scriptBuffer = buff
    try {
      this._script = Script.fromBuffer(this._scriptBuffer)
      this._script._isOutput = true
    } catch (e) {
      if (e instanceof errors.Script.InvalidBuffer) {
        this._script = null
      } else {
        throw e
      }
    }
  }

  setScript(script) {
    if (script instanceof Script) {
      this._scriptBuffer = script.toBuffer()
      this._script = script
      this._script._isOutput = true
    } else if (_.isString(script)) {
      this._script = Script.fromString(script)
      this._scriptBuffer = this._script.toBuffer()
      this._script._isOutput = true
    } else if (BufferUtil.isBuffer(script)) {
      this.setScriptFromBuffer(script)
    } else {
      throw new TypeError('Invalid argument type: script')
    }
    return this
  }

  inspect() {
    let scriptStr
    if (this.script) {
      scriptStr = this.script.inspect()
    } else {
      scriptStr = this._scriptBuffer.toString('hex')
    }
    return `<Output (${this.satoshis} sats) ${scriptStr}>`
  }

  toBufferWriter(writer) {
    if (!writer) {
      writer = new BufferWriter()
    }
    writer.writeUInt64LEBN(this._satoshisBN)
    const script = this._scriptBuffer
    writer.writeVarintNum(script.length)
    writer.write(script)
    return writer
  }
}

export default Output
