import { Computer, Transaction } from '@bitcoin-computer/lib'
import {
  address,
  bufferUtils,
  networks,
  payments,
  script as bscript,
  opcodes,
  script,
} from '@bitcoin-computer/nakamotojs'
import { Buffer } from 'buffer'
import axios from 'axios'
import { VITE_API_BASE_URL } from './config.js'

export const NotEnoughFundError = 'Not enough funds to create chess game.'

const { fromASM, toASM } = script

const getSecret = async (id: string): Promise<string | null> => {
  const { data } = await axios.get<string>(`${VITE_API_BASE_URL}/secret/${id}`)
  return data
}

if (typeof global !== 'undefined') global.Buffer = Buffer

type PaymentType = {
  satoshis: bigint
  publicKeyW: string
  secretHashW: string
  publicKeyB: string
  secretHashB: string
}

export class Payment extends Contract {
  constructor({ satoshis, publicKeyW, publicKeyB, secretHashW, secretHashB }: PaymentType) {
    super({
      _satoshis: satoshis,
      _owners: `OP_IF
        ${publicKeyW} OP_CHECKSIGVERIFY
        OP_HASH256 ${secretHashW} OP_EQUAL
      OP_ELSE
        ${publicKeyB} OP_CHECKSIGVERIFY
        OP_HASH256 ${secretHashB} OP_EQUAL
      OP_ENDIF`.replace(/\s+/g, ' '),
    })
  }
}

export class ChessContract extends Contract {
  satoshis!: bigint
  nameW!: string
  nameB!: string
  publicKeyW!: string
  publicKeyB!: string
  secretHashW!: string
  secretHashB!: string
  sans!: string[]
  fen!: string
  payment!: Payment

  constructor(
    satoshis: bigint,
    nameW: string,
    nameB: string,
    publicKeyW: string,
    publicKeyB: string,
    secretHashW: string,
    secretHashB: string,
  ) {
    super({
      satoshis,
      nameW,
      nameB,
      publicKeyW,
      publicKeyB,
      secretHashW,
      secretHashB,
      sans: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      payment: new Payment({ satoshis, publicKeyW, secretHashW, publicKeyB, secretHashB }),
    })
  }

  move(from: string, to: string): string {
    // @ts-expect-error type error
    const chessLib = new Chess(this.fen)
    const { san } = chessLib.move({ from, to, promotion: 'q' })
    this.sans.push(san)
    this.fen = chessLib.fen()

    if (!chessLib.isGameOver()) {
      if (this._owners[0] === this.publicKeyW) {
        this._owners = [this.publicKeyB]
      } else {
        this._owners = [this.publicKeyW]
      }
    }
    return chessLib.isGameOver()
  }

  isGameOver(): boolean {
    // @ts-expect-error type error
    return new Chess(this.fen).isGameOver()
  }
}

export class ChessContractHelper {
  computer: Computer
  satoshis?: bigint
  nameW?: string
  nameB?: string
  publicKeyW?: string
  publicKeyB?: string
  secretHashW?: string
  secretHashB?: string
  mod?: string

  constructor({
    computer,
    satoshis,
    nameW,
    nameB,
    publicKeyW,
    publicKeyB,
    secretHashW,
    secretHashB,
    mod,
  }: {
    computer: Computer
    satoshis?: bigint
    nameW?: string
    nameB?: string
    publicKeyW?: string
    publicKeyB?: string
    secretHashW?: string
    secretHashB?: string
    mod?: string
  }) {
    this.computer = computer
    this.satoshis = satoshis
    this.nameW = nameW
    this.nameB = nameB
    this.publicKeyW = publicKeyW
    this.publicKeyB = publicKeyB
    this.secretHashW = secretHashW
    this.secretHashB = secretHashB
    this.mod = mod
  }

  isInitialized(): this is Required<ChessContractHelper> {
    return Object.values(this).every((element) => element !== undefined)
  }

  static fromContract(computer: Computer, game: ChessContract, mod?: string): ChessContractHelper {
    const { satoshis, nameW, nameB, publicKeyW, publicKeyB, secretHashW, secretHashB } = game
    return new this({
      computer,
      satoshis,
      nameW,
      nameB,
      publicKeyW,
      publicKeyB,
      secretHashW,
      secretHashB,
      mod,
    })
  }

  getASM(): string {
    return `OP_IF
      ${this.publicKeyW} OP_CHECKSIGVERIFY
      OP_HASH256 ${this.secretHashW} OP_EQUAL
    OP_ELSE
      ${this.publicKeyB} OP_CHECKSIGVERIFY
      OP_HASH256 ${this.secretHashB} OP_EQUAL
    OP_ENDIF`.replace(/\s+/g, ' ')
  }

  async makeTx(): Promise<Transaction> {
    if (!this.isInitialized()) throw new Error('Chess helper is not initialized')

    // Create output with non-standard script
    const { tx } = await this.computer.encode({
      exp: `new ChessContract(
        ${this.satoshis}n,
        "${this.nameW}",
        "${this.nameB}",
        "${this.publicKeyW}",
        "${this.publicKeyB}",
        "${this.secretHashW}",
        "${this.secretHashB}"
      )`,
      mod: this.mod,
      fund: false,
      sign: false,
    })

    // Fund with this.satoshis / 2
    const chain = this.computer.getChain()
    const network = this.computer.getNetwork()
    const n = networks.getNetwork(chain, network)
    const addy = address.fromPublicKey(this.computer.db.wallet.publicKey, 'p2pkh', n)
    const utxos = await this.computer.db.wallet.restClient.getFormattedUtxos(addy)
    let paid = 0n
    while (paid < Number(this.satoshis) / 2 && utxos.length > 0) {
      const { txId, vout, satoshis } = utxos.pop()!
      const txHash = bufferUtils.reverseBuffer(Buffer.from(txId, 'hex'))
      tx.addInput(txHash, vout)
      paid += satoshis
    }

    if (paid < this.satoshis) throw new Error(NotEnoughFundError)

    // Add change
    const fee = await this.computer.db.wallet.estimateFee(tx)
    const publicKeyBuffer = this.computer.db.wallet.publicKey
    const { output } = payments.p2pkh({ pubkey: publicKeyBuffer, network: n })
    const changeSatoshis = Number(paid) - Number(this.satoshis) / 2 - 5 * fee // todo: optimize the fee
    tx.addOutput(output!, BigInt(Math.round(changeSatoshis)))

    // Sign
    const { SIGHASH_ALL, SIGHASH_ANYONECANPAY } = Transaction
    await this.computer.sign(tx, { sighashType: SIGHASH_ALL | SIGHASH_ANYONECANPAY })
    return tx
  }

  async completeTx(tx: Transaction): Promise<string> {
    const decoded = await this.computer.decode(tx)
    const { effect } = await this.computer.encode(decoded)
    const { res: chessContract } = effect as unknown as { res: ChessContract }

    this.satoshis = chessContract.payment._satoshis
    this.nameW = chessContract.nameW
    this.nameB = chessContract.nameB
    this.publicKeyW = chessContract.publicKeyW
    this.publicKeyB = chessContract.publicKeyB
    this.secretHashW = chessContract.secretHashW
    this.secretHashB = chessContract.secretHashB

    // Fund
    const fee = await this.computer.db.wallet.estimateFee(tx)
    const txId = await this.computer.send(
      this.satoshis / 2n + 5n * BigInt(fee),
      this.computer.getAddress(),
    )
    const txHash = bufferUtils.reverseBuffer(Buffer.from(txId, 'hex'))
    tx.addInput(txHash, 0)

    // Sign and broadcast
    await this.computer.sign(tx)
    return this.computer.broadcast(tx)
  }

  async move(
    chessContract: ChessContract,
    from: string,
    to: string,
  ): Promise<{ newChessContract: ChessContract; isGameOver: boolean }> {
    const { tx, effect } = (await this.computer.encodeCall({
      target: chessContract,
      property: 'move',
      args: [from, to],
      mod: this.mod,
    })) as { tx: Transaction; effect: { res: boolean; env: unknown } }
    await this.computer.broadcast(tx)
    const { res: isGameOver, env } = effect
    const { __bc__: newChessContract } = env as { __bc__: ChessContract }
    if (isGameOver) {
      const spendingTxId = await this.spend(newChessContract)
      console.log('You won!', spendingTxId)
    }
    return { newChessContract, isGameOver }
  }

  async spend(chessContract: ChessContract, fee = 10000n): Promise<string> {
    const txId = chessContract._id.split(':')[0]
    const spendingPath = chessContract._owners[0] === this.publicKeyW ? 0 : 1
    const secret = await getSecret(chessContract._id)
    if (!secret) throw new Error('Something went wrong when trying to spend.')
    return this.spendWithSecret(txId, secret, spendingPath, fee)
  }

  async spendWithSecret(
    txId: string,
    secret: string,
    spendingPath: number,
    fee = 10000n,
  ): Promise<string> {
    if (!this.isInitialized()) throw new Error('Chess helper is not initialized')

    const chain = this.computer.getChain()
    const network = this.computer.getNetwork()
    const n = networks.getNetwork(chain, network)
    const { hdPrivateKey } = this.computer.db.wallet

    // Create redeem script
    const asmFromBuf = (sigHash: Buffer) => [
      Buffer.from(secret),
      bscript.signature.encode(hdPrivateKey.sign(sigHash), Transaction.SIGHASH_ALL),
      spendingPath === 0 ? opcodes.OP_TRUE : opcodes.OP_FALSE,
    ]

    // Create redeem tx
    const redeemTx = new Transaction()
    redeemTx.addInput(Buffer.from(txId, 'hex').reverse(), 1)
    const { output } = payments.p2pkh({ pubkey: hdPrivateKey.publicKey, ...n })
    redeemTx.addOutput(output!, BigInt(this.satoshis) - fee)
    const redeemScript = bscript.fromASM(this.getASM())
    const sigHash = redeemTx.hashForSignature(0, redeemScript, Transaction.SIGHASH_ALL)
    const inScript = fromASM(toASM(asmFromBuf(sigHash)))
    const script = payments.p2sh({
      redeem: { input: inScript, output: redeemScript },
    })
    redeemTx.setInputScript(0, script.input!)
    return this.computer.broadcast(redeemTx)
  }
}
