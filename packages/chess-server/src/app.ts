/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express'
import { Computer, Transaction } from '@bitcoin-computer/lib'
import cors from 'cors'
import { Chess, ChessContractHelper } from '@bitcoin-computer/chess-contracts'
import { script as bscript, networks } from '@bitcoin-computer/nakamotojs'
import { ECPairFactory } from 'ecpair'
import * as ecc from '@bitcoin-computer/secp256k1'
const ECPair = ECPairFactory(ecc)

const app = express()
const PORT = 4000
// Move this to .env
const operatorMnemonic = `witness ball town vast limit abstract proof clay castle lens year protect`
const computer = new Computer({
  chain: 'LTC',
  network: 'regtest',
  url: 'http://127.0.0.1:1031',
  mnemonic: operatorMnemonic
})

app.use(cors())
app.use(express.json())

app.post('/claim-win/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  const { redeemTxHex } = req.body
  try {
    const [rev] = await computer.query({ ids: [id + ':0'] })
    const contract = (await computer.sync(rev)) as any
    const game = new Chess(contract.fen)
    if (!game.isGameOver()) {
      res.status(400).json({ message: 'Cannot claim as the game is not over!' })
      return
    }

    const winnerPublicKey = contract._owners[0] as string
    const network = computer.getNetwork()
    const chain = computer.getChain()
    const NETWORKOBJ = networks.getNetwork(chain, network)
    const { privateKey: operatorPrivateKey } = computer.wallet
    const operatorKeyPair = ECPair.fromPrivateKey(operatorPrivateKey, { network: NETWORKOBJ })

    const redeemTx = Transaction.fromHex(redeemTxHex)
    const expectedRedeemScript = bscript.fromASM(
      `OP_2 ${contract.publicKeyW.toString('hex')} ${contract.publicKeyB.toString('hex')} ${computer.wallet.publicKey.toString('hex')} OP_3 OP_CHECKMULTISIG`
    )

    // Validate and sign the transaction
    const signedRedeemTx = ChessContractHelper.validateAndSignRedeemTx(
      redeemTx,
      Buffer.from(winnerPublicKey, 'hex'),
      operatorKeyPair,
      expectedRedeemScript,
      NETWORKOBJ
    )

    // Broadcast the fully signed transaction
    const finalTxId = await computer.broadcast(signedRedeemTx)
    res.status(200).json(finalTxId)
    return
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
