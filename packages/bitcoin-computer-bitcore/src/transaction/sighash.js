import _ from 'lodash'
import $ from '../util/preconditions'
import BN from '../crypto/bn'
import BufferReader from '../encoding/bufferreader'
import BufferUtil from '../util/buffer'
import BufferWriter from '../encoding/bufferwriter'
import ECDSA from '../crypto/ecdsa'
import Hash from '../crypto/hash'
import Input from './input/input'
import Output from './output'
import Script from '../script/script'
import Signature from '../crypto/signature'
import Transaction from './transaction'

const SIGHASH_SINGLE_BUG = '0000000000000000000000000000000000000000000000000000000000000001'
const BITS_64_ON = 'ffffffffffffffff'
const ENABLE_SIGHASH_FORKID = true

class Sighash {
  static sighashForForkId(transaction, sighashType, inputNumber, subscript, satoshisBN) {
    const input = transaction.inputs[inputNumber]
    $.checkArgument(
      satoshisBN instanceof BN,
      'For ForkId=0 signatures, satoshis or complete input must be provided'
    )

    function GetPrevoutHash(tx) {
      const writer = new BufferWriter()

      _.each(tx.inputs, (txIn) => {
        writer.writeReverse(txIn.prevTxId)
        writer.writeUInt32LE(txIn.outputIndex)
      })

      const buf = writer.toBuffer()
      const ret = Hash.sha256sha256(buf)
      return ret
    }

    function GetSequenceHash(tx) {
      const writer = new BufferWriter()

      _.each(tx.inputs, (txIn) => {
        writer.writeUInt32LE(txIn.sequenceNumber)
      })

      const buf = writer.toBuffer()
      const ret = Hash.sha256sha256(buf)
      return ret
    }

    function GetOutputsHash(tx, n) {
      const writer = new BufferWriter()

      if (_.isUndefined(n)) {
        _.each(tx.outputs, (output) => {
          output.toBufferWriter(writer)
        })
      } else {
        tx.outputs[n].toBufferWriter(writer)
      }

      const buf = writer.toBuffer()
      const ret = Hash.sha256sha256(buf)
      return ret
    }

    let hashPrevouts = BufferUtil.emptyBuffer(32)
    let hashSequence = BufferUtil.emptyBuffer(32)
    let hashOutputs = BufferUtil.emptyBuffer(32)

    if (!(sighashType & Signature.SIGHASH_ANYONECANPAY)) {
      hashPrevouts = GetPrevoutHash(transaction)
    }

    if (
      !(sighashType & Signature.SIGHASH_ANYONECANPAY) &&
      (sighashType & 31) !== Signature.SIGHASH_SINGLE &&
      (sighashType & 31) !== Signature.SIGHASH_NONE
    ) {
      hashSequence = GetSequenceHash(transaction)
    }

    if (
      (sighashType & 31) !== Signature.SIGHASH_SINGLE &&
      (sighashType & 31) !== Signature.SIGHASH_NONE
    ) {
      hashOutputs = GetOutputsHash(transaction)
    } else if (
      (sighashType & 31) === Signature.SIGHASH_SINGLE &&
      inputNumber < transaction.outputs.length
    ) {
      hashOutputs = GetOutputsHash(transaction, inputNumber)
    }

    const writer = new BufferWriter()

    // Version
    writer.writeInt32LE(transaction.version)

    // Input prevouts/nSequence (none/all, depending on flags)
    writer.write(hashPrevouts)
    writer.write(hashSequence)

    //  outpoint (32-byte hash + 4-byte little endian)
    writer.writeReverse(input.prevTxId)
    writer.writeUInt32LE(input.outputIndex)

    // scriptCode of the input (serialized as scripts inside CTxOuts)
    writer.writeVarintNum(subscript.toBuffer().length)
    writer.write(subscript.toBuffer())

    // value of the output spent by this input (8-byte little endian)
    writer.writeUInt64LEBN(satoshisBN)

    // nSequence of the input (4-byte little endian)
    const { sequenceNumber } = input
    writer.writeUInt32LE(sequenceNumber)

    // Outputs (none/one/all, depending on flags)
    writer.write(hashOutputs)

    // Locktime
    writer.writeUInt32LE(transaction.nLockTime)

    // sighashType
    writer.writeUInt32LE(sighashType >>> 0)

    const buf = writer.toBuffer()
    let ret = Hash.sha256sha256(buf)
    ret = new BufferReader(ret).readReverse()
    return ret
  }

  /**
   * Returns a buffer of length 32 bytes with the hash that needs to be signed
   * for OP_CHECKSIG.
   *
   * @name Signing.sighash
   * @param {Transaction} transaction the transaction to sign
   * @param {number} sighashType the type of the hash
   * @param {number} inputNumber the input index for the signature
   * @param {Script} subscript the script that will be signed
   * @param {satoshisBN} sed in ForkId signatures. If not provided, outputs's amount is used.
   *
   */
  static sighash(transaction, sighashType, inputNumber, subscript, satoshisBN) {
    // Copy transaction
    const txcopy = Transaction.shallowCopy(transaction)

    // Copy script
    subscript = new Script(subscript)

    if (sighashType & Signature.SIGHASH_FORKID && ENABLE_SIGHASH_FORKID) {
      return Sighash.sighashForForkId(txcopy, sighashType, inputNumber, subscript, satoshisBN)
    }

    // For no ForkId sighash, separators need to be removed.
    subscript.removeCodeseparators()

    let i
    for (i = 0; i < txcopy.inputs.length; i += 1) {
      // Blank signatures for other inputs
      txcopy.inputs[i] = new Input(txcopy.inputs[i]).setScript(Script.empty())
    }

    txcopy.inputs[inputNumber] = new Input(txcopy.inputs[inputNumber]).setScript(subscript)

    if (
      (sighashType & 31) === Signature.SIGHASH_NONE ||
      (sighashType & 31) === Signature.SIGHASH_SINGLE
    ) {
      // clear all sequenceNumbers
      for (i = 0; i < txcopy.inputs.length; i += 1) {
        if (i !== inputNumber) {
          txcopy.inputs[i].sequenceNumber = 0
        }
      }
    }

    if ((sighashType & 31) === Signature.SIGHASH_NONE) {
      txcopy.outputs = []
    } else if ((sighashType & 31) === Signature.SIGHASH_SINGLE) {
      // The SIGHASH_SINGLE bug.
      // https://bitcointalk.org/index.php?topic=260595.0
      if (inputNumber >= txcopy.outputs.length) {
        return Buffer.from(SIGHASH_SINGLE_BUG, 'hex')
      }

      txcopy.outputs.length = inputNumber + 1

      for (i = 0; i < inputNumber; i += 1) {
        txcopy.outputs[i] = new Output({
          satoshis: BN.fromBuffer(Buffer.from(BITS_64_ON, 'hex')),
          script: Script.empty(),
        })
      }
    }

    if (sighashType & Signature.SIGHASH_ANYONECANPAY) {
      txcopy.inputs = [txcopy.inputs[inputNumber]]
    }

    const buf = new BufferWriter().write(txcopy.toBuffer()).writeInt32LE(sighashType).toBuffer()
    let ret = Hash.sha256sha256(buf)
    ret = new BufferReader(ret).readReverse()
    return ret
  }

  /**
   * Create a signature
   *
   * @name Signing.sign
   * @param {Transaction} transaction
   * @param {PrivateKey} privateKey
   * @param {number} sighash
   * @param {number} inputIndex
   * @param {Script} subscript
   * @param {satoshisBN} input's amount
   * @return {Signature}
   */
  static sign(transaction, privateKey, sighashType, inputIndex, subscript, satoshisBN) {
    const hashbuf = Sighash.sighash(transaction, sighashType, inputIndex, subscript, satoshisBN)
    const sig = ECDSA.sign(hashbuf, privateKey, 'little').set({
      nhashtype: sighashType,
    })
    return sig
  }

  /**
   * Verify a signature
   *
   * @name Signing.verify
   * @param {Transaction} transaction
   * @param {Signature} signature
   * @param {PublicKey} publicKey
   * @param {number} inputIndex
   * @param {Script} subscript
   * @param {satoshisBN} input's amount
   * @return {boolean}
   */
  static verify(transaction, signature, publicKey, inputIndex, subscript, satoshisBN) {
    $.checkArgument(!_.isUndefined(transaction))
    $.checkArgument(!_.isUndefined(signature) && !_.isUndefined(signature.nhashtype))
    const hashbuf = Sighash.sighash(
      transaction,
      signature.nhashtype,
      inputIndex,
      subscript,
      satoshisBN
    )
    return ECDSA.verify(hashbuf, signature, publicKey, 'little')
  }
}

/**
 * @namespace Signing
 */
export default Sighash
