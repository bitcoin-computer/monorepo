import _ from 'lodash'
import elliptic from 'elliptic'
import bnjs from 'bn.js'
import bs58 from 'bs58'
import Address from './address.js'
import Base58 from './encoding/base58.js'
import Base58Check from './encoding/base58check.js'
import Block from './block/block.js'
import BlockHeader from './block/blockheader.js'
import BN from './crypto/bn.js'
import BufferReader from './encoding/bufferreader.js'
import BufferUtil from './util/buffer.js'
import BufferWriter from './encoding/bufferwriter.js'
import ECDSA from './crypto/ecdsa.js'
import errors from './errors/index.js'
import Hash from './crypto/hash.js'
import HDPrivateKey from './hdprivatekey.js'
import HDPublicKey from './hdpublickey.js'
import MerkleBlock from './block/merkleblock.js'
import Message from './message.js'
import Opcode from './opcode.js'
import preconditions from './util/preconditions.js'
import JSUtil from './util/js.js'
import Mnemonic from './mnemonic/index.js'
import Networks from './networks.js'
import PackageInfo from '../package.json'
import Point from './crypto/point.js'
import PrivateKey from './privatekey.js'
import PublicKey from './publickey.js'
import Random from './crypto/random.js'
import Script from './script/script.js'
import ScriptInterpreter from './script/interpreter.js'
import Signature from './crypto/signature.js'
import Transaction from './transaction/transaction.js'
import TransactionInput from './transaction/input/input.js'
import TransactionMultiSigInput from './transaction/input/multisig.js'
import TransactionMultiSigScriptHashInput from './transaction/input/multisigscripthash.js'
import TransactionPublicKeyInput from './transaction/input/publickey.js'
import TransactionPublicKeyHashInput from './transaction/input/publickeyhash.js'
import TransactionScriptHashInput from './transaction/input/scripthash.js'
import TransactionOutput from './transaction/output.js'
import TransactionOutputId from './transaction/output-id.js'
import TransactionSighash from './transaction/sighash.js'
import TransactionSignature from './transaction/signature.js'
import TransactionUnspentOutput from './transaction/unspentoutput.js'
import Unit from './unit.js'
import URI from './uri.js'
import Varint from './encoding/varint.js'

const Bitcoin = {}

// module information
Bitcoin.version = `v${PackageInfo.version}`

// eslint-disable-next-line no-unused-vars
Bitcoin.versionGuard = function (version) {
  // if (version !== undefined) {
  //   var message = 'More than one instance of bitcoincashjs found. ' +
  //     'Please make sure to require bitcoincashjs and check that submodules do' +
  //     ' not also include their own bitcoincashjs dependency.';
  //   throw new Error(message);
  // }
}
Bitcoin.versionGuard(global._bitcoin)
global._bitcoin = Bitcoin.version

// crypto
Bitcoin.crypto = {}
Bitcoin.crypto.BN = BN
Bitcoin.crypto.ECDSA = ECDSA
Bitcoin.crypto.Hash = Hash
Bitcoin.crypto.Random = Random
Bitcoin.crypto.Point = Point
Bitcoin.crypto.Signature = Signature

// encoding
Bitcoin.encoding = {}
Bitcoin.encoding.Base58 = Base58
Bitcoin.encoding.Base58Check = Base58Check
Bitcoin.encoding.BufferReader = BufferReader
Bitcoin.encoding.BufferWriter = BufferWriter
Bitcoin.encoding.Varint = Varint

// utilities
Bitcoin.util = {}
Bitcoin.util.buffer = BufferUtil
Bitcoin.util.js = JSUtil
Bitcoin.util.preconditions = preconditions

// errors thrown by the library
Bitcoin.errors = errors

// main bitcoin library
Bitcoin.Address = Address
Bitcoin.Block = Block
Bitcoin.Block.BlockHeader = BlockHeader
Bitcoin.Block.MerkleBlock = MerkleBlock
Bitcoin.BlockHeader = BlockHeader
Bitcoin.HDPrivateKey = HDPrivateKey
Bitcoin.HDPublicKey = HDPublicKey
Bitcoin.MerkleBlock = MerkleBlock
Bitcoin.Message = Message
Bitcoin.Mnemonic = Mnemonic
Bitcoin.Networks = Networks
Bitcoin.Opcode = Opcode
Bitcoin.PrivateKey = PrivateKey
Bitcoin.PublicKey = PublicKey
Bitcoin.Script = Script
Bitcoin.Script.Interpreter = ScriptInterpreter
Bitcoin.Transaction = Transaction
Bitcoin.Transaction.Input = TransactionInput
Bitcoin.Transaction.Input.MultiSig = TransactionMultiSigInput
Bitcoin.Transaction.Input.MultiSigScriptHash = TransactionMultiSigScriptHashInput
Bitcoin.Transaction.Input.PublicKey = TransactionPublicKeyInput
Bitcoin.Transaction.Input.PublicKeyHash = TransactionPublicKeyHashInput
Bitcoin.Transaction.Input.ScriptHash = TransactionScriptHashInput
Bitcoin.Transaction.Output = TransactionOutput
Bitcoin.Transaction.OutputId = TransactionOutputId
Bitcoin.Transaction.Sighash = TransactionSighash
Bitcoin.Transaction.Signature = TransactionSignature
Bitcoin.Transaction.UnspentOutput = TransactionUnspentOutput
Bitcoin.Unit = Unit
Bitcoin.URI = URI

// dependencies, subject to change
Bitcoin.deps = {}
Bitcoin.deps.bnjs = bnjs
Bitcoin.deps.bs58 = bs58
Bitcoin.deps.Buffer = Buffer
Bitcoin.deps.elliptic = elliptic
Bitcoin.deps._ = _

export { Bitcoin }
