import $ from '../../util/preconditions'
import BufferUtil from '../../util/buffer'
import Hash from '../../crypto/hash'
import Input from './input'
import Output from '../output'
import Script from '../../script/script'
import Sighash from '../sighash'
import Signature from '../../crypto/signature'
import TransactionSignature from '../signature'

/**
 * Represents a special kind of input of PayToPublicKeyHash kind.
 */
class PublicKeyHashInput extends Input {
  /**
   * @param {Transaction} transaction - the transaction to be signed
   * @param {PrivateKey} privateKey - the private key with which to sign the transaction
   * @param {number} index - the index of the input in the transaction input vector
   * @param {number=} sigtype - the type of signature, defaults to Signature.SIGHASH_ALL
   * @param {Buffer=} hashData - the precalculated hash of the public key associated with the
   *   privateKey provided
   * @return {Array} of objects that can be
   */
  // eslint-disable-next-line max-len
  getSignatures(transaction, privateKey, index, sigtype, hashData) {
    $.checkState(this.output instanceof Output, 'Malformed output found when signing transaction')
    hashData = hashData || Hash.sha256ripemd160(privateKey.publicKey.toBuffer())
    sigtype = sigtype || Signature.SIGHASH_ALL | Signature.SIGHASH_FORKID

    if (BufferUtil.equals(hashData, this.output.script.getPublicKeyHash())) {
      return [
        new TransactionSignature({
          publicKey: privateKey.toPublicKey(),
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
   * @return {PublicKeyHashInput} this, for chaining
   */
  addSignature(transaction, signature) {
    $.checkState(this.isValidSignature(transaction, signature), 'Signature invalid')
    const script = Script.buildPublicKeyHashIn(
      signature.publicKey,
      signature.signature.toDER(),
      signature.sigtype
    )
    this.setScript(script)
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
    return this.script.isPublicKeyHashIn()
  }

  _estimateSize() {
    return PublicKeyHashInput.SCRIPT_MAX_SIZE
  }
}

PublicKeyHashInput.SCRIPT_MAX_SIZE = 73 + 34 // sigsize (1 + 72) + pubkey (1 + 33)

export default PublicKeyHashInput
