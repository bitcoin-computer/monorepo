import _ from 'lodash'
import $ from '../util/preconditions'
import BufferUtil from '../util/buffer'
import errors from '../errors'
import JSUtil from '../util/js'
import PublicKey from '../publickey'
import Signature from '../crypto/signature'

/**
 * @desc
 * Wrapper around Signature with fields related to signing a transaction specifically
 *
 * @param {Object|string|TransactionSignature} arg
 * @constructor
 */
class TransactionSignature extends Signature {
  constructor(arg) {
    super(arg)
    if (arg instanceof TransactionSignature) {
      return arg
    }
    if (_.isObject(arg)) {
      return this._fromObject(arg)
    }
    throw new errors.InvalidArgument('TransactionSignatures must be instantiated from an object')
  }

  _fromObject(arg) {
    TransactionSignature._checkObjectArgs(arg)
    this.publicKey = new PublicKey(arg.publicKey)
    this.prevTxId = BufferUtil.isBuffer(arg.prevTxId)
      ? arg.prevTxId
      : Buffer.from(arg.prevTxId, 'hex')
    this.outputIndex = arg.outputIndex
    this.inputIndex = arg.inputIndex
    if (arg.signature instanceof Signature) {
      this.signature = arg.signature
    } else if (BufferUtil.isBuffer(arg.signature)) {
      this.signature = Signature.fromBuffer(arg.signature)
    } else {
      this.signature = Signature.fromString(arg.signature)
    }
    this.sigtype = arg.sigtype
    return this
  }

  static _checkObjectArgs(arg) {
    $.checkArgument(PublicKey(arg.publicKey), 'publicKey')
    $.checkArgument(!_.isUndefined(arg.inputIndex), 'inputIndex')
    $.checkArgument(!_.isUndefined(arg.outputIndex), 'outputIndex')
    $.checkState(_.isNumber(arg.inputIndex), 'inputIndex must be a number')
    $.checkState(_.isNumber(arg.outputIndex), 'outputIndex must be a number')
    $.checkArgument(arg.signature, 'signature')
    $.checkArgument(arg.prevTxId, 'prevTxId')
    $.checkState(
      arg.signature instanceof Signature ||
        BufferUtil.isBuffer(arg.signature) ||
        JSUtil.isHexa(arg.signature),
      'signature must be a buffer or hexa value'
    )
    $.checkState(
      BufferUtil.isBuffer(arg.prevTxId) || JSUtil.isHexa(arg.prevTxId),
      'prevTxId must be a buffer or hexa value'
    )
    $.checkArgument(arg.sigtype, 'sigtype')
    $.checkState(_.isNumber(arg.sigtype), 'sigtype must be a number')
  }

  /**
   * Serializes a transaction to a plain JS object
   * @return {Object}
   */
  toJSON() {
    return {
      publicKey: this.publicKey.toString(),
      prevTxId: this.prevTxId.toString('hex'),
      outputIndex: this.outputIndex,
      inputIndex: this.inputIndex,
      signature: this.signature.toString(),
      sigtype: this.sigtype,
    }
  }

  toObject() {
    return this.toJSON()
  }

  /**
   * Builds a TransactionSignature from an object
   * @param {Object} object
   * @return {TransactionSignature}
   */
  static fromObject(object) {
    $.checkArgument(object)
    return new TransactionSignature(object)
  }
}

export default TransactionSignature
