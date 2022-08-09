import _ from 'lodash'
import $ from '../../util/preconditions'
import BufferUtil from '../../util/buffer'
import Input from './input'
import Output from '../output'
import Script from '../../script/script'
import Sighash from '../sighash'
import Signature from '../../crypto/signature'
import TransactionSignature from '../signature'

class MultiSigScriptHashInput extends Input {
  constructor(input, pubkeys, threshold, signatures, redeemScript, nestedWitness, opts) {
    super(input, pubkeys, threshold, signatures, redeemScript, nestedWitness, opts)

    const self = this
    opts = opts || {};
    pubkeys = pubkeys || input.publicKeys
    this.threshold = threshold || input.threshold
    signatures = signatures || input.signatures
    this.nestedWitness = !!nestedWitness
    if (opts.noSorting) {
      this.publicKeys = pubkeys
    } else  {
      this.publicKeys = _.sortBy(pubkeys, (publicKey) => publicKey.toString('hex'))
    }
    this.redeemScript = redeemScript || Script.buildMultisigOut(this.publicKeys, this.threshold)

    if (this.nestedWitness) {
      const nested = Script.buildWitnessMultisigOutFromScript(this.redeemScript)
      $.checkState(Script.buildScriptHashOut(nested).equals(this.output.script),
        'Provided public keys don\'t hash to the provided output (nested witness)')
      this.setScript(nested)
    }
    // $.checkState(
    //   Script.buildScriptHashOut(this.redeemScript).equals(this.output.script),
    //   'RedeemScript does not hash to the provided output'
    // )
    this.publicKeyIndex = {}
    this.publicKeys.forEach((publicKey, index) => {
      self.publicKeyIndex[publicKey.toString()] = index
    })
    // Empty array of signatures
    this.signatures = signatures
      ? this._deserializeSignatures(signatures)
      : new Array(this.publicKeys.length)
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

  // eslint-disable-next-line max-len
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
            this.redeemScript,
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
    $.checkState(this.isValidSignature(transaction, signature), 'Signature invalid')
    this.signatures[this.publicKeyIndex[signature.publicKey.toString()]] = signature
    this._updateScript()
    return this
  }

  _updateScript() {
    const scriptSig = Script.buildP2SHMultisigIn(this.publicKeys, this.threshold, this._createSignatures(), {
      cachedMultisig: this.redeemScript,
    })
    if (this.nestedWitness) {
      this.setWitnesses([scriptSig.toBuffer()])
    } else {
      this.setScript(scriptSig)
    }
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
    return this.publicKeys.filter(
      (publicKey) => !this.signatures[this.publicKeyIndex[publicKey.toString()]]
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
      MultiSigScriptHashInput.OPCODES_SIZE +
      this.threshold * MultiSigScriptHashInput.SIGNATURE_SIZE +
      this.publicKeys.length * MultiSigScriptHashInput.PUBKEY_SIZE
    )
  }
}

MultiSigScriptHashInput.OPCODES_SIZE = 7 // serialized size (<=3) + 0 .. N .. M OP_CHECKMULTISIG
MultiSigScriptHashInput.SIGNATURE_SIZE = 74 // size (1) + DER (<=72) + sighash (1)
MultiSigScriptHashInput.PUBKEY_SIZE = 34 // size (1) + DER (<=33)

export default MultiSigScriptHashInput
