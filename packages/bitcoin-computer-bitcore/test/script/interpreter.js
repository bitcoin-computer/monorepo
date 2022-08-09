import chai from 'chai'
import { Bitcoin } from '../bitcoin'
import scriptValid from '../data/bitcoind/script_valid.json'
import scriptInvalid from '../data/bitcoind/script_invalid.json'
import txValid from '../data/bitcoind/tx_valid.json'
import txInvalid from '../data/bitcoind/tx_invalid.json'

const should = chai.should()
const { Interpreter } = Bitcoin.Script
const { Transaction } = Bitcoin
const { PrivateKey } = Bitcoin
const { Script } = Bitcoin
const { BN } = Bitcoin.crypto
const { BufferWriter } = Bitcoin.encoding
const { Opcode } = Bitcoin

// the script string format used in bitcoind data tests
Script.fromBitcoindString = function (str) {
  const bw = new BufferWriter()
  const tokens = str.split(' ')
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token === '') {
      continue
    }

    let opstr
    let opcodenum
    let tbuf
    if (token[0] === '0' && token[1] === 'x') {
      const hex = token.slice(2)
      bw.write(Buffer.from(hex, 'hex'))
    } else if (token[0] === "'") {
      const tstr = token.slice(1, token.length - 1)
      const cbuf = Buffer.from(tstr)
      tbuf = Script().add(cbuf).toBuffer()
      bw.write(tbuf)
    } else if (typeof Opcode[`OP_${token}`] !== 'undefined') {
      opstr = `OP_${token}`
      opcodenum = Opcode[opstr]
      bw.writeUInt8(opcodenum)
    } else if (typeof Opcode[token] === 'number') {
      opstr = token
      opcodenum = Opcode[opstr]
      bw.writeUInt8(opcodenum)
    } else if (!Number.isNaN(parseInt(token, 10))) {
      const script = Script().add(new BN(token).toScriptNumBuffer())
      tbuf = script.toBuffer()
      bw.write(tbuf)
    } else {
      throw new Error('Could not determine type of script value')
    }
  }
  const buf = bw.concat()
  return this.fromBuffer(buf)
}

describe('Interpreter', () => {
  it('should make a new interp', () => {
    const interp = new Interpreter()
    ;(interp instanceof Interpreter).should.equal(true)
    interp.stack.length.should.equal(0)
    interp.altstack.length.should.equal(0)
    interp.pc.should.equal(0)
    interp.pbegincodehash.should.equal(0)
    interp.nOpCount.should.equal(0)
    interp.vfExec.length.should.equal(0)
    interp.errstr.should.equal('')
    interp.flags.should.equal(0)
  })

  describe('@castToBool', () => {
    it('should cast these bufs to bool correctly', () => {
      Interpreter.castToBool(
        new BN(0).toSM({
          endian: 'little',
        })
      ).should.equal(false)
      Interpreter.castToBool(Buffer.from('0080', 'hex')).should.equal(false) // negative 0
      Interpreter.castToBool(
        new BN(1).toSM({
          endian: 'little',
        })
      ).should.equal(true)
      Interpreter.castToBool(
        new BN(-1).toSM({
          endian: 'little',
        })
      ).should.equal(true)

      const buf = Buffer.from('00', 'hex')
      const bool =
        BN.fromSM(buf, {
          endian: 'little',
        }).cmp(BN.Zero) !== 0
      Interpreter.castToBool(buf).should.equal(bool)
    })
  })

  describe('#verify', () => {
    it('should verify these trivial scripts', () => {
      let verified
      const si = Interpreter()
      verified = si.verify(Script('OP_1'), Script('OP_1'))
      verified.should.equal(true)
      verified = Interpreter().verify(Script('OP_1'), Script('OP_0'))
      verified.should.equal(false)
      verified = Interpreter().verify(Script('OP_0'), Script('OP_1'))
      verified.should.equal(true)
      verified = Interpreter().verify(Script('OP_CODESEPARATOR'), Script('OP_1'))
      verified.should.equal(true)
      verified = Interpreter().verify(Script(''), Script('OP_DEPTH OP_0 OP_EQUAL'))
      verified.should.equal(true)
      verified = Interpreter().verify(
        Script('OP_1 OP_2'),
        Script('OP_2 OP_EQUALVERIFY OP_1 OP_EQUAL')
      )
      verified.should.equal(true)
      verified = Interpreter().verify(Script('9 0x000000000000000010'), Script(''))
      verified.should.equal(true)
      verified = Interpreter().verify(Script('OP_1'), Script('OP_15 OP_ADD OP_16 OP_EQUAL'))
      verified.should.equal(true)
      verified = Interpreter().verify(Script('OP_0'), Script('OP_IF OP_VER OP_ELSE OP_1 OP_ENDIF'))
      verified.should.equal(true)
    })

    it('should verify these simple transaction', () => {
      // first we create a transaction
      const privateKey = new PrivateKey('cSBnVM4xvxarwGQuAfQFwqDg9k5tErHUHzgWsEfD4zdwUasvqRVY')
      const { publicKey } = privateKey
      const fromAddress = publicKey.toAddress()
      const toAddress = 'mrU9pEmAx26HcbKVrABvgL7AwA5fjNFoDc'
      const scriptPubkey = Script.buildPublicKeyHashOut(fromAddress)
      const utxo = {
        address: fromAddress,
        txId: 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458',
        outputIndex: 0,
        script: scriptPubkey,
        satoshis: 100000,
      }
      const tx = new Transaction().from(utxo).to(toAddress, 100000).sign(privateKey, 1)

      // we then extract the signature from the first input
      const inputIndex = 0
      const { signature } = tx.getSignatures(privateKey, 1)[inputIndex]

      const scriptSig = Script.buildPublicKeyHashIn(publicKey, signature)
      const flags = Interpreter.SCRIPT_VERIFY_P2SH | Interpreter.SCRIPT_VERIFY_STRICTENC
      const verified = Interpreter().verify(scriptSig, scriptPubkey, tx, inputIndex, flags)
      verified.should.equal(true)
    })

    it('should set values on interpreter', () => {
      const script = Script('OP_1')
      const tx = new Transaction()
      const stack = []
      stack.push(Interpreter.true)
      const altstack = []
      altstack.push(Interpreter.false)
      const vfExec = []
      vfExec.push(true)
      const interp = Interpreter({
        script,
        tx,
        nin: 9,
        stack,
        altstack,
        pc: 99,
        pbegincodehash: 88,
        nOpCount: 77,
        vfExec,
        errstr: 'testing',
        flags: Interpreter.SCRIPT_VERIFY_STRICTENC,
      })
      interp.script.should.equal(script)
      interp.tx.should.equal(tx)
      interp.nin.should.equal(9)
      interp.stack.should.equal(stack)
      interp.altstack.should.equal(altstack)
      interp.pc.should.equal(99)
      interp.pbegincodehash.should.equal(88)
      interp.nOpCount.should.equal(77)
      interp.vfExec[0].should.equal(true)
      interp.errstr.should.equal('testing')
      interp.flags.should.equal(Interpreter.SCRIPT_VERIFY_STRICTENC)
    })
  })

  const getFlags = function getFlags(flagstr) {
    let flags = 0
    if (flagstr.indexOf('NONE') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_NONE
    }
    if (flagstr.indexOf('P2SH') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_P2SH
    }
    if (flagstr.indexOf('STRICTENC') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_STRICTENC
    }
    if (flagstr.indexOf('DERSIG') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_DERSIG
    }
    if (flagstr.indexOf('LOW_S') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_LOW_S
    }
    if (flagstr.indexOf('NULLDUMMY') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_NULLDUMMY
    }
    if (flagstr.indexOf('SIGPUSHONLY') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_SIGPUSHONLY
    }
    if (flagstr.indexOf('MINIMALDATA') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_MINIMALDATA
    }
    if (flagstr.indexOf('DISCOURAGE_UPGRADABLE_NOPS') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_DISCOURAGE_UPGRADABLE_NOPS
    }
    if (flagstr.indexOf('CHECKLOCKTIMEVERIFY') !== -1) {
      flags |= Interpreter.SCRIPT_VERIFY_CHECKLOCKTIMEVERIFY
    }
    return flags
  }

  const testFixture = function (vector, expected) {
    const scriptSig = Script.fromBitcoindString(vector[0])
    const scriptPubkey = Script.fromBitcoindString(vector[1])
    const flags = getFlags(vector[2])

    const hashbuf = Buffer.alloc(32)
    hashbuf.fill(0)
    const credtx = new Transaction()
    credtx.uncheckedAddInput(
      new Transaction.Input({
        prevTxId: '0000000000000000000000000000000000000000000000000000000000000000',
        outputIndex: 0xffffffff,
        sequenceNumber: 0xffffffff,
        script: Script('OP_0 OP_0'),
      })
    )
    credtx.addOutput(
      new Transaction.Output({
        script: scriptPubkey,
        satoshis: 0,
      })
    )
    const idbuf = credtx.id

    const spendtx = new Transaction()
    spendtx.uncheckedAddInput(
      new Transaction.Input({
        prevTxId: idbuf.toString('hex'),
        outputIndex: 0,
        sequenceNumber: 0xffffffff,
        script: scriptSig,
      })
    )
    spendtx.addOutput(
      new Transaction.Output({
        script: new Script(),
        satoshis: 0,
      })
    )

    const interp = new Interpreter()
    const verified = interp.verify(scriptSig, scriptPubkey, spendtx, 0, flags)
    verified.should.equal(expected)
  }
  describe('bitcoind script evaluation fixtures', () => {
    const testAllFixtures = function (set, expected) {
      let c = 0
      set.forEach((vector) => {
        if (vector.length === 1) {
          return
        }
        c += 1
        const descstr = vector[3]
        const fullScriptString = `${vector[0]} ${vector[1]}`
        const comment = descstr ? ` (${descstr})` : ''
        it(
          `should pass script_${expected ? '' : 'in'}valid ` +
            `vector #${c}: ${fullScriptString}${comment}`,
          () => {
            testFixture(vector, expected)
          }
        )
      })
    }
    testAllFixtures(scriptValid, true)
    testAllFixtures(scriptInvalid, false)
  })
  describe('bitcoind transaction evaluation fixtures', () => {
    const testTxs = function (set, expected) {
      let c = 0
      set.forEach((vector) => {
        if (vector.length === 1) {
          return
        }
        c += 1
        const cc = c // copy to local
        it(`should pass tx_${expected ? '' : 'in'}valid vector ${cc}`, () => {
          const inputs = vector[0]
          const txhex = vector[1]
          const flags = getFlags(vector[2])

          const map = {}
          inputs.forEach((input) => {
            const txid = input[0]
            let txoutnum = input[1]
            const scriptPubKeyStr = input[2]
            if (txoutnum === -1) {
              txoutnum = 0xffffffff // bitcoind casts -1 to an unsigned int
            }
            map[`${txid}:${txoutnum}`] = Script.fromBitcoindString(scriptPubKeyStr)
          })

          const tx = new Transaction(txhex)
          let allInputsVerified = true
          tx.inputs.forEach((txin, j) => {
            if (txin.isNull()) {
              return
            }
            const scriptSig = txin.script
            const txidhex = txin.prevTxId.toString('hex')
            const txoutnum = txin.outputIndex
            const scriptPubkey = map[`${txidhex}:${txoutnum}`]
            should.exist(scriptPubkey)
            ;(scriptSig !== undefined).should.equal(true)
            const interp = new Interpreter()
            const verified = interp.verify(scriptSig, scriptPubkey, tx, j, flags)
            if (!verified) {
              allInputsVerified = false
            }
          })
          let txVerified = tx.verify()
          txVerified = txVerified === true
          allInputsVerified = allInputsVerified && txVerified
          allInputsVerified.should.equal(expected)
        })
      })
    }
    testTxs(txValid, true)
    testTxs(txInvalid, false)
  })
})
