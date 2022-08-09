import chai from 'chai'
import { Bitcoin } from './bitcoin'

const should = chai.should()
const { expect } = chai
const { errors } = Bitcoin
const { Unit } = Bitcoin

describe('Unit', () => {
  it('can be created from a number and unit', () => {
    expect(() => new Unit(1.2, 'BTC')).to.not.throw()
  })

  it('can be created from a number and exchange rate', () => {
    expect(() => new Unit(1.2, 350)).to.not.throw()
  })

  it('no "new" is required for creating an instance', () => {
    expect(() => Unit(1.2, 'BTC')).to.not.throw()

    expect(() => Unit(1.2, 350)).to.not.throw()
  })

  it('has property accesors "BTC", "mBTC", "uBTC", "bits", and "satoshis"', () => {
    const unit = new Unit(1.2, 'BTC')
    unit.BTC.should.equal(1.2)
    unit.mBTC.should.equal(1200)
    unit.uBTC.should.equal(1200000)
    unit.bits.should.equal(1200000)
    unit.satoshis.should.equal(120000000)
  })

  it('a string amount is allowed', () => {
    let unit

    unit = Unit.fromBTC('1.00001')
    unit.BTC.should.equal(1.00001)

    unit = Unit.fromMilis('1.00001')
    unit.mBTC.should.equal(1.00001)

    unit = Unit.fromMillis('1.00001')
    unit.mBTC.should.equal(1.00001)

    unit = Unit.fromBits('100')
    unit.bits.should.equal(100)

    unit = Unit.fromSatoshis('8999')
    unit.satoshis.should.equal(8999)

    unit = Unit.fromFiat('43', 350)
    unit.BTC.should.equal(0.12285714)
  })

  it('should have constructor helpers', () => {
    let unit

    unit = Unit.fromBTC(1.00001)
    unit.BTC.should.equal(1.00001)

    unit = Unit.fromMilis(1.00001)
    unit.mBTC.should.equal(1.00001)

    unit = Unit.fromBits(100)
    unit.bits.should.equal(100)

    unit = Unit.fromSatoshis(8999)
    unit.satoshis.should.equal(8999)

    unit = Unit.fromFiat(43, 350)
    unit.BTC.should.equal(0.12285714)
  })

  it('converts to satoshis correctly', () => {
    let unit

    unit = Unit.fromBTC(1.3)
    unit.mBTC.should.equal(1300)
    unit.bits.should.equal(1300000)
    unit.satoshis.should.equal(130000000)

    unit = Unit.fromMilis(1.3)
    unit.BTC.should.equal(0.0013)
    unit.bits.should.equal(1300)
    unit.satoshis.should.equal(130000)

    unit = Unit.fromBits(1.3)
    unit.BTC.should.equal(0.0000013)
    unit.mBTC.should.equal(0.0013)
    unit.satoshis.should.equal(130)

    unit = Unit.fromSatoshis(3)
    unit.BTC.should.equal(0.00000003)
    unit.mBTC.should.equal(0.00003)
    unit.bits.should.equal(0.03)
  })

  it('takes into account floating point problems', () => {
    const unit = Unit.fromBTC(0.00000003)
    unit.mBTC.should.equal(0.00003)
    unit.bits.should.equal(0.03)
    unit.satoshis.should.equal(3)
  })

  it('exposes unit codes', () => {
    should.exist(Unit.BTC)
    Unit.BTC.should.equal('BTC')

    should.exist(Unit.mBTC)
    Unit.mBTC.should.equal('mBTC')

    should.exist(Unit.bits)
    Unit.bits.should.equal('bits')

    should.exist(Unit.satoshis)
    Unit.satoshis.should.equal('satoshis')
  })

  it('exposes a method that converts to different units', () => {
    const unit = new Unit(1.3, 'BTC')
    unit.to(Unit.BTC).should.equal(unit.BTC)
    unit.to(Unit.mBTC).should.equal(unit.mBTC)
    unit.to(Unit.bits).should.equal(unit.bits)
    unit.to(Unit.satoshis).should.equal(unit.satoshis)
  })

  it('exposes shorthand conversion methods', () => {
    const unit = new Unit(1.3, 'BTC')
    unit.toBTC().should.equal(unit.BTC)
    unit.toMilis().should.equal(unit.mBTC)
    unit.toMillis().should.equal(unit.mBTC)
    unit.toBits().should.equal(unit.bits)
    unit.toSatoshis().should.equal(unit.satoshis)
  })

  it('can convert to fiat', () => {
    let unit = new Unit(1.3, 350)
    unit.atRate(350).should.equal(1.3)
    unit.to(350).should.equal(1.3)

    unit = Unit.fromBTC(0.0123)
    unit.atRate(10).should.equal(0.12)
  })

  it('toString works as expected', () => {
    const unit = new Unit(1.3, 'BTC')
    should.exist(unit.toString)
    unit.toString().should.be.a('string')
  })

  it('can be imported and exported from/to JSON', () => {
    const json = JSON.stringify({ amount: 1.3, code: 'BTC' })
    const unit = Unit.fromObject(JSON.parse(json))
    JSON.stringify(unit).should.deep.equal(json)
  })

  it('importing from invalid JSON fails quickly', () => {
    expect(() => Unit.fromJSON('¹')).to.throw()
  })

  it('inspect method displays nicely', () => {
    const unit = new Unit(1.3, 'BTC')
    unit.inspect().should.equal('<Unit: 130000000 satoshis>')
  })

  it('fails when the unit is not recognized', () => {
    expect(() => new Unit(100, 'USD')).to.throw(errors.Unit.UnknownCode)
    expect(() => new Unit(100, 'BTC').to('USD')).to.throw(errors.Unit.UnknownCode)
  })

  it('fails when the exchange rate is invalid', () => {
    expect(() => new Unit(100, -123)).to.throw(errors.Unit.InvalidRate)
    expect(() => new Unit(100, 'BTC').atRate(-123)).to.throw(errors.Unit.InvalidRate)
  })
})
