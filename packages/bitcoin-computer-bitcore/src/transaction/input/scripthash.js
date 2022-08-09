import $ from '../../util/preconditions'
import BufferUtil from '../../util/buffer'
import Input from './input'
import Output from '../output'
import Script from '../../script/script'
import Sighash from '../sighash'
import Signature from '../../crypto/signature'
import TransactionSignature from '../signature'

class ScriptHashInput extends Input {
  constructor(input, pubkeys, redeemScript) {
    super(input, pubkeys, redeemScript)

    const self = this
    this.publicKeys = pubkeys || input.publicKeys
    this.threshold = 1
    this.redeemScript = redeemScript
    $.checkState(
      Script.buildScriptHashOut(this.redeemScript).equals(this.output.script),
      "Provided redeemScript doesn't hash to the provided output"
    )
    this.publicKeyIndex = {}
    this.publicKeys.forEach((publicKey, index) => {
      self.publicKeyIndex[publicKey.toString()] = index
    })
    // Empty array of signatures
    this.signatures = new Array(this.publicKeys.length)
  }

  toObject(...args) {
    const obj = Input.prototype.toObject.apply(this, args)
    obj.threshold = this.threshold
    obj.publicKeys = this.publicKeys.map((publicKey) => publicKey.toString())
    obj.signatures = this._serializeSignatures()
    return obj
  }

  _deserializeSignatures(signatures) {
    return signatures.map((signature) =>
      signature ? new TransactionSignature(signature) : undefined
    )
  }

  _serializeSignatures() {
    return this.signatures.map((signature) => (signature ? signature.toObject() : undefined))
  }

  getSignatures(transaction, privateKey, index, sigtype) {
    $.checkState(this.output instanceof Output, 'Malformed output found when signing transaction')
    sigtype = sigtype || Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID

    const publicKeysForPrivateKey = this.publicKeys.filter(
      (publicKey) => publicKey.toString() === privateKey.publicKey.toString()
    )
    return publicKeysForPrivateKey.map(
      (publicKey) =>
        new TransactionSignature({
          publicKey,
          prevTxId: this.prevTxId,
          outputIndex: this.outputIndex,
          inputIndex: index,
          signature: Sighash.sign(
            transaction,
            privateKey,
            sigtype,
            index,
            this.output.script,
            this.output.satoshisBN
          ),
          sigtype,
        })
    )
  }

  addSignature(transaction, signature) {
    $.checkState(!this.isFullySigned(), 'All needed signatures have already been added')
    $.checkArgument(
      this.publicKeyIndex[signature.publicKey.toString()] !== undefined,
      'Signature has no matching public key'
    )
    $.checkState(this.isValidSignature(transaction, signature))
    this.signatures[this.publicKeyIndex[signature.publicKey.toString()]] = signature
    this._updateScript()
    return this
  }

  _updateScript() {
    this.setScript(
      Script.buildP2SHMultisigIn(this.publicKeys, this.threshold, this._createSignatures(), {
        cachedMultisig: this.redeemScript,
      })
    )
    return this
  }

  _createSignatures() {
    const definedSignatures = this.signatures.filter((signature) => signature !== undefined)
    return definedSignatures.map((signature) =>
      BufferUtil.concat([
        signature.signature.toDER(),
        BufferUtil.integerAsSingleByteBuffer(signature.sigtype),
      ])
    )
  }

  clearSignatures() {
    this.signatures = new Array(this.publicKeys.length)
    this._updateScript()
  }

  isFullySigned() {
    return this.countSignatures() === this.threshold
  }

  countMissingSignatures() {
    return this.threshold - this.countSignatures()
  }

  countSignatures() {
    return this.signatures.reduce((sum, signature) => sum + !!signature, 0)
  }

  publicKeysWithoutSignature() {
    const self = this
    return this.publicKeys.filter(
      (publicKey) => !self.signatures[self.publicKeyIndex[publicKey.toString()]]
    )
  }

  isValidSignature(transaction, signature) {
    // FIXME: Refactor signature so this is not necessary
    signature.signature.nhashtype = signature.sigtype
    return Sighash.verify(
      transaction,
      signature.signature,
      signature.publicKey,
      signature.inputIndex,
      this.redeemScript,
      this.output.satoshisBN
    )
  }

  _estimateSize() {
    return (
      ScriptHashInput.OPCODES_SIZE +
      this.threshold * ScriptHashInput.SIGNATURE_SIZE +
      this.publicKeys.length * ScriptHashInput.PUBKEY_SIZE
    )
  }
}

ScriptHashInput.OPCODES_SIZE = 7 // serialized size (<=3) + 0 .. N .. M OP_CHECKMULTISIG
ScriptHashInput.SIGNATURE_SIZE = 74 // size (1) + DER (<=72) + sighash (1)
ScriptHashInput.PUBKEY_SIZE = 34 // size (1) + DER (<=33)

export default ScriptHashInput
