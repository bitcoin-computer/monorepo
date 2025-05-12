import { Computer } from '@bitcoin-computer/lib'
import { script as bscript, networks } from '@bitcoin-computer/nakamotojs'
import { ECPairFactory } from 'ecpair'
import * as ecc from '@bitcoin-computer/secp256k1'
import { Transaction } from '@bitcoin-computer/lib'
import { Buffer } from 'buffer'
import {
  ChessContract,
  ChessContractHelper,
  WinnerTxWrapper,
} from '@bitcoin-computer/chess-contracts'
const ECPair = ECPairFactory(ecc)

export const signRedeemTx = async (
  computer: Computer,
  chessContract: ChessContract,
  txWrapper: WinnerTxWrapper,
) => {
  const winnerPublicKey = chessContract._owners[0] as string
  const network = computer.getNetwork()
  const chain = computer.getChain()
  const NETWORKOBJ = networks.getNetwork(chain, network)

  const { privateKey: currentPlayerPrivateKey } = computer.wallet
  const currentPlayerKeyPair = ECPair.fromPrivateKey(currentPlayerPrivateKey, {
    network: NETWORKOBJ,
  })

  const redeemTx = Transaction.fromHex(txWrapper.redeemTxHex)

  const expectedRedeemScript = bscript.fromASM(
    `OP_2 ${chessContract.publicKeyW} ${chessContract.publicKeyB} OP_2 OP_CHECKMULTISIG`,
  )

  const playerWIsTheValidator = computer.getPublicKey() === chessContract.publicKeyW

  // Validate and sign the transaction
  const signedRedeemTx = ChessContractHelper.validateAndSignRedeemTx(
    redeemTx,
    Buffer.from(winnerPublicKey, 'hex'),
    currentPlayerKeyPair,
    expectedRedeemScript,
    NETWORKOBJ,
    playerWIsTheValidator,
  )

  return signedRedeemTx
}
