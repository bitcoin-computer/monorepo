import $ from '../../util/preconditions'
import Input from './input'
import Output from '../output'
import Script from '../../script/script'
import Sighash from '../sighash'
import Signature from '../../crypto/signature'
import TransactionSignature from '../signature'

/**
 * Represents a special kind of input of PayToPublicKey kind.
 */
class PublicKeyInput extends Input {
  /**
   * @param {Transaction} transaction - the transaction to be signed
   * @param {PrivateKey} privateKey - the private key with which to sign the transaction
   * @param {number} index - the index of the input in the transaction input vector
   * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
   * @return {Array} of objects that can be
   */
  getSignatures(transaction, privateKey, index, sigtype) {
    $.checkState(this.output instanceof Output, 'Malformed output found when signing transaction')
    sigtype = sigtype || Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID
    const publicKey = privateKey.toPublicKey()
    if (publicKey.toString() === this.output.script.getPublicKey().toString('hex')) {
      return [
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
        }),
      ]
    }
    return []
  }

  /**
   * Add the provided signature
   *
   * @param {Object} signature
   * @param {PublicKey} signature.publicKey
   * @param {Signature} signature.signature
   * @param {number=} signature.sigtype
   * @return {PublicKeyInput} this, for chaining
   */
  addSignature(transaction, signature) {
    $.checkState(this.isValidSignature(transaction, signature), 'Signature invalid')
    this.setScript(Script.buildPublicKeyIn(signature.signature.toDER(), signature.sigtype))
    return this
  }

  /**
   * Clear the input's signature
   * @return {PublicKeyHashInput} this, for chaining
   */
  clearSignatures() {
    this.setScript(Script.empty())
    return this
  }

  /**
   * Query whether the input is signed
   * @return {boolean}
   */
  isFullySigned() {
    return this.script.isPublicKeyIn()
  }

  _estimateSize() {
    return PublicKeyInput.SCRIPT_MAX_SIZE
  }
}

PublicKeyInput.SCRIPT_MAX_SIZE = 73 // sigsize (1 + 72)

export default PublicKeyInput
