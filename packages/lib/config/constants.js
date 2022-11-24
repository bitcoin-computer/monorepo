const DEFAULT_FEE = parseInt(process.env.BC_DEFAULT_FEE || '', 10) || 2500
const SCRIPT_CHUNK_SIZE = parseInt(process.env.BC_SCRIPT_CHUNK_SIZE || '', 10) || 479
const SIGHASH_ALL = 0x01          // TODO: import from bitcoin-computer-bitcore.Signatures
const AVG_TX_SIZE = 500 // in bytes
const PUBLIC_KEY_SIZE = 65
const PASSPHRASE = ''
const ENCODING_LENGTH = 3
const ENCODING_NUMBER_LENGTH = 3
const MAX_PUBKEYS_PER_SCRIPT = 3
const OP_RETURN_SIZE = 80         // maximum number of bytes for the change output
const CHANGE_OUTPUT_MAX_SIZE = 62 // TODO use CTransaction.CHANGE_OUTPUT_MAX_SIZE from bitcore
const MWEB_HEIGHT =  parseInt(process.env.MWEB_HEIGHT || '', 10) || 432
// We set FEE_PER_KB big enought to avoid fee rate rejections
const FEE_PER_KB = 10000
const WITNESS_SCALE_FACTOR = 4

export {
  SCRIPT_CHUNK_SIZE,
  DEFAULT_FEE,
  SIGHASH_ALL,
  AVG_TX_SIZE,
  PUBLIC_KEY_SIZE,
  PASSPHRASE,
  ENCODING_LENGTH,
  ENCODING_NUMBER_LENGTH,
  MAX_PUBKEYS_PER_SCRIPT,
  OP_RETURN_SIZE,
  CHANGE_OUTPUT_MAX_SIZE,
  MWEB_HEIGHT,
  FEE_PER_KB,
  WITNESS_SCALE_FACTOR,
}
