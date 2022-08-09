import chai from 'chai'
import { Bitcoin } from '../bitcoin'
import bip39Vectors from '../data/mnemonics.json'

const should = chai.should()
const { Mnemonic } = Bitcoin
const { errors } = Bitcoin

describe('Mnemonic', function () {
  this.timeout(30000)

  it('should initialize the class', () => {
    should.exist(Mnemonic)
  })

  describe('# Mnemonic', () => {
    describe('Constructor', () => {
      it('does not require new keyword', () => {
        const mnemonic = Mnemonic()
        mnemonic.should.be.instanceof(Mnemonic)
      })

      it('should fail with invalid data', () => {
        ;(function () {
          return new Mnemonic({})
        }.should.throw(errors.InvalidArgument))
      })

      it('should fail with unknown word list', () => {
        ;(function () {
          return new Mnemonic(
            'pilots foster august tomorrow kit daughter unknown awesome model town village master'
          )
        }.should.throw(errors.UnknownWordlist))
      })

      it('should fail with invalid mnemonic', () => {
        ;(function () {
          return new Mnemonic(
            'monster foster august tomorrow kit daughter unknown awesome model town village pilot'
          )
        }.should.throw(errors.InvalidMnemonic))
      })

      it('should fail with invalid ENT', () => {
        ;(function () {
          return new Mnemonic(64)
        }.should.throw(errors.InvalidArgument))
      })

      it('constructor defaults to english worldlist', () => {
        const mnemonic = new Mnemonic()
        mnemonic.wordlist.should.equal(Mnemonic.Words.ENGLISH)
      })

      it('allow using different worldlists', () => {
        const mnemonic = new Mnemonic(Mnemonic.Words.SPANISH)
        mnemonic.wordlist.should.equal(Mnemonic.Words.SPANISH)
      })

      it('constructor honor both length and wordlist', () => {
        const mnemonic = new Mnemonic(32 * 7, Mnemonic.Words.SPANISH)
        mnemonic.phrase.split(' ').length.should.equal(21)
        mnemonic.wordlist.should.equal(Mnemonic.Words.SPANISH)
      })

      it('constructor should detect standard wordlist', () => {
        const mnemonic = new Mnemonic(
          'afirmar diseño hielo fideo etapa ogro cambio fideo toalla pomelo número buscar'
        )
        mnemonic.wordlist.should.equal(Mnemonic.Words.SPANISH)
      })
    })

    it('english wordlist is complete', () => {
      Mnemonic.Words.ENGLISH.length.should.equal(2048)
      Mnemonic.Words.ENGLISH[0].should.equal('abandon')
    })

    it('spanish wordlist is complete', () => {
      Mnemonic.Words.SPANISH.length.should.equal(2048)
      Mnemonic.Words.SPANISH[0].should.equal('ábaco')
    })

    it('japanese wordlist is complete', () => {
      Mnemonic.Words.JAPANESE.length.should.equal(2048)
      Mnemonic.Words.JAPANESE[0].should.equal('あいこくしん')
    })

    it('chinese wordlist is complete', () => {
      Mnemonic.Words.CHINESE.length.should.equal(2048)
      Mnemonic.Words.CHINESE[0].should.equal('的')
    })

    it('french wordlist is complete', () => {
      Mnemonic.Words.FRENCH.length.should.equal(2048)
      Mnemonic.Words.FRENCH[0].should.equal('abaisser')
    })

    it('italian wordlist is complete', () => {
      Mnemonic.Words.ITALIAN.length.should.equal(2048)
      Mnemonic.Words.ITALIAN[0].should.equal('abaco')
    })

    it('allows use different phrase lengths', () => {
      let mnemonic

      mnemonic = new Mnemonic(32 * 4)
      mnemonic.phrase.split(' ').length.should.equal(12)

      mnemonic = new Mnemonic(32 * 5)
      mnemonic.phrase.split(' ').length.should.equal(15)

      mnemonic = new Mnemonic(32 * 6)
      mnemonic.phrase.split(' ').length.should.equal(18)

      mnemonic = new Mnemonic(32 * 7)
      mnemonic.phrase.split(' ').length.should.equal(21)

      mnemonic = new Mnemonic(32 * 8)
      mnemonic.phrase.split(' ').length.should.equal(24)
    })

    it('validates a phrase', () => {
      const valid = Mnemonic.isValid(
        'afirmar diseño hielo fideo etapa ogro cambio fideo toalla pomelo número buscar'
      )
      valid.should.equal(true)

      const invalid = Mnemonic.isValid(
        'afirmar diseño hielo fideo etapa ogro cambio fideo hielo pomelo número buscar'
      )
      invalid.should.equal(false)

      const invalid2 = Mnemonic.isValid(
        'afirmar diseño hielo fideo etapa ogro cambio fideo hielo pomelo número oneInvalidWord'
      )
      invalid2.should.equal(false)

      const invalid3 = Mnemonic.isValid('totally invalid phrase')
      invalid3.should.equal(false)

      const valid2 = Mnemonic.isValid(
        'caution opprimer époque belote devenir ficeler filleul caneton apologie nectar frapper fouiller'
      )
      valid2.should.equal(true)
    })

    it('has a toString method', () => {
      const mnemonic = new Mnemonic()
      mnemonic.toString().should.equal(mnemonic.phrase)
    })

    it('has a toString method', () => {
      const mnemonic = new Mnemonic()
      mnemonic.inspect().should.have.string('<Mnemonic:')
    })

    it('derives a seed without a passphrase', () => {
      const mnemonic = new Mnemonic()
      const seed = mnemonic.toSeed()
      should.exist(seed)
    })

    it('derives a seed using a passphrase', () => {
      const mnemonic = new Mnemonic()
      const seed = mnemonic.toSeed('my passphrase')
      should.exist(seed)
    })

    it('derives an extended private key', () => {
      const mnemonic = new Mnemonic()
      const pk = mnemonic.toHDPrivateKey()
      should.exist(pk)
    })

    it('Mnemonic.fromSeed should fail with invalid wordlist', () => {
      ;(function () {
        return Mnemonic.fromSeed(Buffer.alloc(1))
      }.should.throw(errors.InvalidArgument))
    })

    it('Mnemonic.fromSeed should fail with invalid seed', () => {
      ;(function () {
        return Mnemonic.fromSeed()
      }.should.throw(errors.InvalidArgument))
    })

    it('Constructor should fail with invalid seed', () => {
      ;(function () {
        return new Mnemonic(Buffer.alloc(1))
      }.should.throw(errors.InvalidEntropy))
    })

    // To add new vectors for different languages:
    // 1. Add and implement the wordlist so it appears in Mnemonic.Words
    // 2. Add the vectors and make sure the key is lowercase of the key for Mnemonic.Words
    const vectorWordlists = {}

    Object.keys(Mnemonic.Words).forEach((key) => {
      vectorWordlists[key.toLowerCase()] = Mnemonic.Words[key]
    })

    const testVector = function (v, lang) {
      it(`should pass test vector for ${lang} #${v}`, () => {
        const wordlist = vectorWordlists[lang]
        const vector = bip39Vectors[lang][v]
        const code = vector[1]
        const mnemonic = vector[2]
        const seed = vector[3]
        const mnemonic1 = Mnemonic.fromSeed(Buffer.from(code, 'hex'), wordlist).phrase
        mnemonic1.should.equal(mnemonic)

        const m = new Mnemonic(mnemonic)
        const seed1 = m.toSeed(vector[0])
        seed1.toString('hex').should.equal(seed)

        Mnemonic.isValid(mnemonic, wordlist).should.equal(true)
      })
    }

    Object.keys(bip39Vectors).forEach((key) => {
      for (let v = 0; v < bip39Vectors[key].length; v++) {
        testVector(v, key)
      }
    })
  })
})
