import { Computer, Transaction } from "@bitcoin-computer/lib"
import { address, bufferUtils, networks, payments, script as bscript, opcodes} from "@bitcoin-computer/nakamotojs"
import { script } from "@bitcoin-computer/nakamotojs"
import { Buffer } from 'buffer'

const { fromASM, toASM } = script

if (typeof global !== 'undefined') global.Buffer = Buffer

type PaymentType = { 
  amount: number, 
  publicKeyW: string, 
  secretHashW: string, 
  publicKeyB: string, 
  secretHashB: string
}

export class Payment extends Contract {
  constructor({ amount, publicKeyW, publicKeyB, secretHashW, secretHashB }: PaymentType) {
    super({
      _amount: amount,
      _owners: `OP_IF
        ${publicKeyW} OP_CHECKSIGVERIFY
        OP_HASH256 ${secretHashW} OP_EQUAL
      OP_ELSE
        ${publicKeyB} OP_CHECKSIGVERIFY
        OP_HASH256 ${secretHashB} OP_EQUAL
      OP_ENDIF`.replace(/\s+/g, ' ')
    })
  }
}

export class ChessGame extends Contract {
  amount!: number
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
    amount: number,
    nameW: string,
    nameB: string,
    publicKeyW: string,
    publicKeyB: string,
    secretHashW: string,
    secretHashB: string
  ) {
    super({
      amount,
      nameW,
      nameB,
      publicKeyW,
      publicKeyB,
      secretHashW,
      secretHashB,
      sans: [],
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      payment: new Payment({ amount, publicKeyW, secretHashW, publicKeyB, secretHashB })
    })
  }

  addFirstPlayer(pubKey: string) {
    this.publicKeyW = pubKey
  }

  addSecondPlayer(pubKey: string) {
    this.publicKeyB = pubKey
  }

  move(san: string) {
    this.sans.push(san)
    // @ts-expect-error type error
    const game = new Chess(this.fen)
    game.move(san)
    this.fen = game.fen()
    if (this._owners[0] === this.publicKeyW) {
      this._owners = [this.publicKeyB]
    } else {
      this._owners = [this.publicKeyW]
    }
  }

  changeOwner() {
    if (this._owners[0] === this.publicKeyW) {
      this._owners = [this.publicKeyB]
    } else {
      this._owners = [this.publicKeyW]
    }
  }

  isGameOver() {
    // @ts-expect-error type error
    return new Chess(this.fen).isGameOver()
  }

  getSans() {
    return this.sans
  }

  getFen() {
    return this.fen
  }
}

export class ChessGameHelper {
  computer: Computer
  nameW: string
  nameB: string
  amount: number
  publicKeyW: string
  publicKeyB: string
  secretHashW: string
  secretHashB: string
  mod?: string
  
  constructor(
    computer: Computer,
    nameW = '',
    nameB = '',
    amount = 0,
    publicKeyW = '',
    publicKeyB = '',
    secretHashW = '',
    secretHashB = '',
    mod?: string
  ) {
    this.computer = computer
    this.nameW = nameW
    this.nameB = nameB
    this.amount = amount
    this.publicKeyW = publicKeyW
    this.publicKeyB = publicKeyB
    this.secretHashW = secretHashW
    this.secretHashB = secretHashB
    this.mod = mod
  }

  static fromGame(game: ChessGame, computer: Computer, mod?: string) {
    return new this(computer,
      game.nameW,
      game.nameB,
      game.amount,
      game.publicKeyW,
      game.publicKeyB,
      game.secretHashW,
      game.secretHashB,
      mod
    )
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
    // Create output with non-standard script
    const { tx } = await this.computer.encode({
      exp: `new ChessGame(
        ${this.amount},
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

    // Fund with this.amount / 2
    const chain = this.computer.getChain()
    const network = this.computer.getNetwork()
    const n = networks.getNetwork(chain, network)
    const addy = address.fromPublicKey(this.computer.wallet.publicKey, 'p2pkh', n)
    const utxos = await this.computer.wallet.restClient.getFormattedUtxos(addy)
    let paid = 0
    while (paid < this.amount / 2 && utxos.length > 0) {
      const { txId, vout, satoshis } = utxos.pop()!
      const txHash = bufferUtils.reverseBuffer(Buffer.from(txId, 'hex'))
      tx.addInput(txHash, vout)
      paid += satoshis
    }

    if (paid < this.amount) throw new Error('Not enough funds to create chess game.')

    // Add change
    const fee = await this.computer.wallet.estimateFee(tx)
    const publicKeyBuffer = this.computer.wallet.publicKey
    const { output } = payments.p2pkh({ pubkey: publicKeyBuffer, network: n })
    const changeAmount = (paid - (this.amount / 2)) - (5 * fee) // todo: optimize the fee
    tx.addOutput(output, changeAmount)
    
    // Sign
    const { SIGHASH_ALL, SIGHASH_ANYONECANPAY } = Transaction
    await this.computer.sign(tx, { sighashType: SIGHASH_ALL | SIGHASH_ANYONECANPAY })
    return tx
  }

  async completeTx(tx: Transaction): Promise<string> {
    // Fund
    const fee = await this.computer.wallet.estimateFee(tx)
    const txId = await this.computer.send((this.amount / 2) + (5 * fee), this.computer.getAddress())
    const txHash = bufferUtils.reverseBuffer(Buffer.from(txId, 'hex'))
    tx.addInput(txHash, 0)

    // Sign and broadcast
    await this.computer.sign(tx)
    return this.computer.broadcast(tx)
  }

  async spend(txId: string, secret: string, spendingPath: number, fee = 10000): Promise<string> {
    const chain = this.computer.getChain()
    const network = this.computer.getNetwork()
    const n = networks.getNetwork(chain, network)
    const { hdPrivateKey } = this.computer.wallet

    // Create redeem script
    const asmFromBuf = (sigHash: Buffer) => [
      Buffer.from(secret),
      bscript.signature.encode(hdPrivateKey.sign(sigHash), Transaction.SIGHASH_ALL),
      spendingPath === 0 ? opcodes.OP_TRUE : opcodes.OP_FALSE
    ]

    // Create redeem tx
    const redeemTx = new Transaction()
    redeemTx.addInput(Buffer.from(txId, 'hex').reverse(), 1)
    const { output } = payments.p2pkh({ pubkey: hdPrivateKey.publicKey, ...n })
    redeemTx.addOutput(output, this.amount - fee)
    const redeemScript = bscript.fromASM(this.getASM())
    const sigHash = redeemTx.hashForSignature(0, redeemScript, Transaction.SIGHASH_ALL)
    const inScript = fromASM(toASM(asmFromBuf(sigHash)))
    const script = payments.p2sh({
      redeem: { input: inScript, output: redeemScript }
    })
    redeemTx.setInputScript(0, script.input!)
    return this.computer.broadcast(redeemTx)
  }
}
