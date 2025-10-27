import { Computer, Transaction } from '@bitcoin-computer/lib'
import {
  address,
  bufferUtils,
  networks,
  payments,
  script as bscript,
} from '@bitcoin-computer/nakamotojs'
import { Buffer } from 'buffer'
import { ECPairFactory, ECPairInterface } from 'ecpair'
import * as ecc from '@bitcoin-computer/secp256k1'
import { BIP32Interface } from 'bip32'
import { User } from './user.js'

const ECPair = ECPairFactory(ecc)

export const NotEnoughFundError = 'Not enough funds to create chess game.'

if (typeof global !== 'undefined') global.Buffer = Buffer

type PaymentType = {
  satoshis: bigint
  publicKeyW: string
  publicKeyB: string
}

export class Payment extends Contract {
  constructor({ satoshis, publicKeyW, publicKeyB }: PaymentType) {
    super({
      _satoshis: satoshis,
      _owners: `OP_2 ${publicKeyW} ${publicKeyB} OP_2 OP_CHECKMULTISIG`.replace(/\s+/g, ' '),
    })
  }
}

type WinnerTxWrapperType = {
  publicKeyW: string
  publicKeyB: string
}

export class WinnerTxWrapper extends Contract {
  redeemTxHex!: string
  constructor({ publicKeyW, publicKeyB }: WinnerTxWrapperType) {
    super({
      _owners: [publicKeyW, publicKeyB],
      redeemTxHex: '',
    })
  }
  setRedeemHex(txHex: string) {
    this.redeemTxHex = txHex
  }
}

export class ChessContract extends Contract {
  satoshis!: bigint
  nameW!: string
  nameB!: string
  publicKeyW!: string
  publicKeyB!: string
  sans!: string[]
  fen!: string
  payment!: Payment
  winnerTxWrapper!: WinnerTxWrapper

  constructor(
    satoshis: bigint,
    nameW: string,
    nameB: string,
    publicKeyW: string,
    publicKeyB: string,
  ) {
    super({
      satoshis,
      nameW,
      nameB,
      publicKeyW,
      publicKeyB,
      sans: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      payment: new Payment({ satoshis, publicKeyW, publicKeyB }),
      winnerTxWrapper: new WinnerTxWrapper({ publicKeyW, publicKeyB }),
    })
  }

  setRedeemHex(txHex: string) {
    this.winnerTxWrapper.setRedeemHex(txHex)
  }

  move(from: string, to: string, promotion: string): string {
    // @ts-expect-error type error
    const chessLib = new Chess(this.fen)
    const { san } = chessLib.move({ from, to, promotion })
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
  mod?: string
  userMod?: string

  constructor({
    computer,
    satoshis,
    nameW,
    nameB,
    publicKeyW,
    publicKeyB,
    mod,
    userMod,
  }: {
    computer: Computer
    satoshis?: bigint
    nameW?: string
    nameB?: string
    publicKeyW?: string
    publicKeyB?: string
    mod?: string
    userMod?: string
  }) {
    this.computer = computer
    this.satoshis = satoshis
    this.nameW = nameW
    this.nameB = nameB
    this.publicKeyW = publicKeyW
    this.publicKeyB = publicKeyB
    this.mod = mod
    this.userMod = userMod
  }

  isInitialized(): this is Required<ChessContractHelper> {
    return Object.values(this).every((element) => element !== undefined)
  }

  static fromContract(
    computer: Computer,
    game: ChessContract,
    mod?: string,
    userMod?: string,
  ): ChessContractHelper {
    const { satoshis, nameW, nameB, publicKeyW, publicKeyB } = game
    return new this({
      computer,
      satoshis,
      nameW,
      nameB,
      publicKeyW,
      publicKeyB,
      mod,
      userMod,
    })
  }

  // can we fetch the public key from the server
  getASM(): string {
    return `OP_2 ${this.publicKeyW} ${this.publicKeyB} OP_2 OP_CHECKMULTISIG`.replace(/\s+/g, ' ')
  }

  async validateUser(): Promise<void> {
    const [userRev] = await this.computer.getOUTXOs({
      mod: this.userMod,
      publicKey: this.computer.getPublicKey(),
    })

    if (!userRev) {
      throw new Error('Please create your account to start playing')
    }
  }

  async makeTx(): Promise<Transaction> {
    if (!this.isInitialized()) throw new Error('Chess helper is not initialized')

    await this.validateUser()

    // Create output with non-standard script
    const { tx } = await this.computer.encode({
      exp: `new ChessContract(
        ${this.satoshis}n,
        "${this.nameW}",
        "${this.nameB}",
        "${this.publicKeyW}",
        "${this.publicKeyB}"
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
    const utxos = await this.computer.getUTXOs({ address: addy, verbosity: 1 })
    let paid = 0n
    while (paid < Number(this.satoshis) / 2 && utxos.length > 0) {
      const { rev, satoshis } = utxos.pop()!
      const txId = rev.substring(0, 64)
      const vout = parseInt(rev.substring(65), 10)
      const txHash = bufferUtils.reverseBuffer(Buffer.from(txId, 'hex'))
      tx.addInput(txHash, vout)
      paid += satoshis
    }

    if (paid < this.satoshis) throw new Error(NotEnoughFundError)

    // Add change
    const publicKeyBuffer = this.computer.db.wallet.publicKey
    const { output } = payments.p2pkh({ pubkey: publicKeyBuffer, network: n })
    const changeSatoshis = Number(paid) - Number(this.satoshis) / 2
    tx.addOutput(output!, BigInt(Math.round(changeSatoshis)))

    // Sign
    const { SIGHASH_ALL, SIGHASH_ANYONECANPAY } = Transaction
    await this.computer.sign(tx, { sighashType: SIGHASH_ALL | SIGHASH_ANYONECANPAY })
    return tx
  }

  async completeTx(tx: Transaction): Promise<string> {
    await this.validateUser()
    const decoded = await this.computer.decode(tx)
    const { effect } = await this.computer.encode(decoded)
    const { res: chessContract } = effect as unknown as { res: ChessContract }

    this.satoshis = chessContract.payment._satoshis
    this.nameW = chessContract.nameW
    this.nameB = chessContract.nameB
    this.publicKeyW = chessContract.publicKeyW
    this.publicKeyB = chessContract.publicKeyB

    // Fund
    const fee = await this.computer.db.wallet.estimateFee(tx)
    const txId = await this.computer.send(
      this.satoshis / 2n + 50n * BigInt(fee),
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
    promotion: string,
  ): Promise<{ newChessContract: ChessContract; isGameOver: boolean }> {
    if (chessContract && chessContract.sans.length < 2) {
      const [userRev] = await this.computer.getOUTXOs({
        mod: this.userMod,
        publicKey: this.computer.getPublicKey(),
      })
      if (userRev) {
        const userObj = (await this.computer.sync(userRev)) as User
        const gameId = chessContract._id
        if (!userObj.games.includes(gameId)) {
          await userObj.addGame(gameId)
        }
      }
    }

    const { tx, effect } = (await this.computer.encodeCall({
      target: chessContract,
      property: 'move',
      args: [from, to, promotion],
      mod: this.mod,
    })) as { tx: Transaction; effect: { res: boolean; env: unknown } }
    await this.computer.broadcast(tx)
    const { res: isGameOver, env } = effect
    const { __bc__: newChessContract } = env as { __bc__: ChessContract }
    if (isGameOver) {
      await this.spend(newChessContract)
      console.log('You won!')
    }
    return { newChessContract, isGameOver }
  }

  async spend(chessContract: ChessContract, fee = 10000n): Promise<void> {
    const txId = chessContract._id.split(':')[0]
    return this.spendWithConfirmation(txId, chessContract, fee)
  }

  async spendWithConfirmation(
    txId: string,
    chessContract: ChessContract,
    fee = 10000n,
  ): Promise<void> {
    if (!this.isInitialized()) throw new Error('Chess helper is not initialized')

    const chain = this.computer.getChain()
    const network = this.computer.getNetwork()
    const n = networks.getNetwork(chain, network)
    const { hdPrivateKey } = this.computer.db.wallet
    const { output } = payments.p2pkh({ pubkey: hdPrivateKey.publicKey, ...n })

    // Create redeem tx
    const redeemTx = ChessContractHelper.createRedeemTx(
      txId,
      hdPrivateKey,
      this.satoshis,
      fee,
      output,
      this.getASM(),
      1,
    )
    //  new Transaction()
    const redeemTxHex = redeemTx.toHex()
    await chessContract.setRedeemHex(redeemTxHex)
    return
  }

  static createRedeemTx(
    txId: string,
    hdPrivateKey: BIP32Interface,
    satoshis: bigint,
    fee: bigint,
    output: Buffer | undefined,
    scriptASM: string,
    inputIndex: number,
  ) {
    const redeemTx = new Transaction()
    redeemTx.addInput(Buffer.from(txId, 'hex').reverse(), inputIndex)
    redeemTx.addOutput(output!, BigInt(satoshis) - fee)
    const redeemScript = bscript.fromASM(scriptASM)
    const sigHash = redeemTx.hashForSignature(0, redeemScript, Transaction.SIGHASH_ALL)
    const winnerSig = bscript.signature.encode(hdPrivateKey.sign(sigHash), Transaction.SIGHASH_ALL)

    // Create partial scriptSig with OP_0 (dummy) and winner's signature
    const partialRedeemInput = bscript.compile([Buffer.alloc(0), winnerSig])
    const partialScript = payments.p2sh({
      redeem: { input: partialRedeemInput, output: redeemScript },
    })

    redeemTx.setInputScript(0, partialScript.input!)
    return redeemTx
  }

  static validateAndSignRedeemTx(
    redeemTx: Transaction,
    winnerPublicKey: Buffer,
    validatorKeyPair: ECPairInterface,
    expectedRedeemScript: Buffer,
    network: networks.Network,
    playerWIsTheValidator: boolean = false,
  ) {
    // Verify transaction structure
    if (redeemTx.ins.length !== 1 || redeemTx.outs.length !== 1) {
      throw new Error('Invalid transaction structure')
    }

    // Decompile scriptSig
    const scriptSig = redeemTx.ins[0].script
    const decompiled = bscript.decompile(scriptSig)
    if (!decompiled || decompiled.length !== 3) {
      throw new Error('Invalid scriptSig format')
    }
    const [dummy, winnerSig, providedRedeemScript] = decompiled

    // Verify dummy element
    if (dummy !== 0) {
      throw new Error('Dummy element must be OP_0')
    }

    // Verify redeem script
    if (
      !Buffer.isBuffer(providedRedeemScript) ||
      // @ts-expect-error typeError
      !providedRedeemScript.equals(expectedRedeemScript)
    ) {
      throw new Error('Redeem script does not match expected script')
    }

    // Verify winner's signature
    const sigHash = redeemTx.hashForSignature(0, expectedRedeemScript, Transaction.SIGHASH_ALL)
    const winnerSigDecoded = bscript.signature.decode(winnerSig as Buffer)
    const winnerKeyPair = ECPair.fromPublicKey(winnerPublicKey, { network })
    if (!winnerKeyPair.verify(sigHash, winnerSigDecoded.signature)) {
      throw new Error('Claimant’s signature is invalid')
    }

    // Verify output goes to winner's address
    const outputScript = redeemTx.outs[0].script
    const winnerAddressScript = payments.p2pkh({ pubkey: winnerPublicKey, network }).output
    // @ts-expect-error typeError
    if (!outputScript.equals(winnerAddressScript as Buffer)) {
      throw new Error('Output must go to winner’s address')
    }

    // Validator signs the transaction
    const validatorSig = bscript.signature.encode(
      validatorKeyPair.sign(sigHash),
      Transaction.SIGHASH_ALL,
    )

    // Update scriptSig with both signatures
    // Order of public keys in script should be similar to the order of signatures
    const finalRedeemInput = bscript.compile([
      Buffer.alloc(0),
      playerWIsTheValidator ? validatorSig : winnerSig,
      playerWIsTheValidator ? winnerSig : validatorSig,
    ])
    const finalScript = payments.p2sh({
      redeem: { input: finalRedeemInput, output: expectedRedeemScript },
      network,
    })
    redeemTx.setInputScript(0, finalScript.input as Buffer)

    // Return the fully signed transaction
    return redeemTx
  }
}

export const signRedeemTx = async (
  computer: Computer,
  chessContract: ChessContract,
  txWrapper: WinnerTxWrapper,
) => {
  const winnerPublicKey = chessContract._owners[0] as string
  const network = computer.getNetwork()
  const chain = computer.getChain()
  const NETWORKOBJ = networks.getNetwork(chain, network)

  const { privateKey: currentPlayerPrivateKey } = computer.db.wallet
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
