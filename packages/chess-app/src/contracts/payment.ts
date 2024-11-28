import { Computer, Transaction } from "@bitcoin-computer/lib"
import { address, bufferUtils, script as bscript, networks, payments, opcodes } from "@bitcoin-computer/nakamotojs"
import { fromASM, toASM } from "@bitcoin-computer/nakamotojs/src/script"
import { Buffer } from 'buffer'

global.Buffer = Buffer

type PaymentType = { 
  amount: number, 
  publicKeyW: string, 
  secretHexW: string, 
  publicKeyB: string, 
  secretHexB: string
}

export class Payment extends Contract {
  constructor({ amount, publicKeyW, secretHexW, publicKeyB, secretHexB }: PaymentType) {
    super({
      _amount: amount,
      _owners: `OP_IF
        ${publicKeyW} OP_CHECKSIGVERIFY
        OP_HASH256 ${secretHexW} OP_EQUAL
      OP_ELSE
        ${publicKeyB} OP_CHECKSIGVERIFY
        OP_HASH256 ${secretHexB} OP_EQUAL
      OP_ENDIF`.replace(/\s+/g, ' ')
    })
  }
}

export class PaymentHelper {
  computer: Computer
  mod?: string
  amount: number
  publicKeyW: string
  secretHexW: string
  publicKeyB: string
  secretHexB: string

  constructor(
    computer: Computer,
    amount: number,
    publicKeyW: string,
    secretHexW: string,
    publicKeyB: string,
    secretHexB: string,
    mod?: string
  ) {
    this.computer = computer
    this.mod = mod
    this.amount = amount
    this.publicKeyW = publicKeyW
    this.secretHexW = secretHexW
    this.publicKeyB = publicKeyB
    this.secretHexB = secretHexB
  }

  async deploy(): Promise<string> {
    this.mod = await this.computer.deploy(`export ${Payment}`)
    return this.mod
  }

  getASM(): string {
    return `OP_IF
      ${this.publicKeyW} OP_CHECKSIGVERIFY
      OP_HASH256 ${this.secretHexW} OP_EQUAL
    OP_ELSE
      ${this.publicKeyB} OP_CHECKSIGVERIFY
      OP_HASH256 ${this.secretHexB} OP_EQUAL
    OP_ENDIF`.replace(/\s+/g, ' ')
  }

  async makeTx(): Promise<Transaction> {
    // Create output with non-standard script
    const { tx } = await this.computer.encode({
      exp: `new Payment({
        "amount": ${this.amount},
        publicKeyW: "${this.publicKeyW}",
        secretHexW: "${this.secretHexW}",
        publicKeyB: "${this.publicKeyB}",
        secretHexB: "${this.secretHexB}"
      })`,
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
    redeemTx.addInput(Buffer.from(txId, 'hex').reverse(), 0)
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