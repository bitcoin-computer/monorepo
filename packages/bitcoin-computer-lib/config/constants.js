const DEFAULT_FEE = parseInt(process.env.BC_DEFAULT_FEE || '', 10) || 2500
const SCRIPT_CHUNK_SIZE = parseInt(process.env.BC_SCRIPT_CHUNK_SIZE || '', 10) || 479
const SIGHASH_ALL = 0x01          // TODO: import from bitcoin-computer-bitcore.Signatures
const FEE_PER_KB = 20000
const PUBLIC_KEY_SIZE = 65
const ANYONE_CAN_SPEND_MNEMONIC = 'replace this seed'
const PASSPHRASE = ''
const ENCODING_LENGTH = 3
const ENCODING_NUMBER_LENGTH = 3
const MAX_PUBKEYS_PER_SCRIPT = 3
const OP_RETURN_SIZE = 80         // maximum number of bytes for the change output
const CHANGE_OUTPUT_MAX_SIZE = 62 // TODO use CTransaction.CHANGE_OUTPUT_MAX_SIZE from bitcore
const MWEB_HEIGHT =  parseInt(process.env.MWEB_HEIGHT || '', 10) || 432

export {
  SCRIPT_CHUNK_SIZE,
  DEFAULT_FEE,
  SIGHASH_ALL,
  FEE_PER_KB,
  PUBLIC_KEY_SIZE,
  ANYONE_CAN_SPEND_MNEMONIC,
  PASSPHRASE,
  ENCODING_LENGTH,
  ENCODING_NUMBER_LENGTH,
  MAX_PUBKEYS_PER_SCRIPT,
  OP_RETURN_SIZE,
  CHANGE_OUTPUT_MAX_SIZE,
  MWEB_HEIGHT
}
