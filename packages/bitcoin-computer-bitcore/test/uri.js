import chai from 'chai'
import { Bitcoin } from './bitcoin'

const { expect } = chai
const { Networks } = Bitcoin
const should = chai.should()
const { URI } = Bitcoin

describe('URI', () => {
  // TODO: Split this and explain tests
  it('parses uri strings correctly (test vector)', () => {
    let uri

    URI.parse.bind(URI, 'badURI').should.throw(TypeError)

    uri = URI.parse('bitcoincash:')
    expect(uri.address).to.equal(undefined)
    expect(uri.amount).to.equal(undefined)
    expect(uri.otherParam).to.equal(undefined)

    uri = URI.parse('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
    uri.address.should.equal('1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
    expect(uri.amount).to.equal(undefined)
    expect(uri.otherParam).to.equal(undefined)

    uri = URI.parse('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=123.22')
    uri.address.should.equal('1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
    uri.amount.should.equal('123.22')
    expect(uri.otherParam).to.equal(undefined)

    uri = URI.parse(
      'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=123.22' +
        '&other-param=something&req-extra=param'
    )
    uri.address.should.equal('1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
    uri.amount.should.equal('123.22')
    uri['other-param'].should.equal('something')
    uri['req-extra'].should.equal('param')
  })

  // TODO: Split this and explain tests
  it('URIs can be validated statically (test vector)', () => {
    URI.isValid('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj').should.equal(true)
    URI.isValid('bitcoincash:mkYY5NRvikVBY1EPtaq9fAFgquesdjqECw').should.equal(true)

    URI.isValid('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=1.2').should.equal(true)
    URI.isValid(
      'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=1.2&other=param'
    ).should.equal(true)
    URI.isValid('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=1.2&req-other=param', [
      'req-other',
    ]).should.equal(true)
    URI.isValid(
      'bitcoincash:mmrqEBJxUCf42vdb3oozZtyz5mKr3Vb2Em?amount=0.1&' +
        'r=https%3A%2F%2Ftest.bitpay.com%2Fi%2F6DKgf8cnJC388irbXk5hHu'
    ).should.equal(true)

    URI.isValid('bitcoincash:').should.equal(false)
    URI.isValid('bitcoincash:badUri').should.equal(false)
    URI.isValid('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfk?amount=bad').should.equal(false)
    URI.isValid(
      'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfk?amount=1.2&req-other=param'
    ).should.equal(false)
    URI.isValid(
      'bitcoincash:?r=https%3A%2F%2Ftest.bitpay.com%2Fi%2F6DKgf8cnJC388irbXk5hHu'
    ).should.equal(false)
  })

  it('fails on creation with no params', () => {
    ;(function () {
      return new URI()
    }.should.throw(TypeError))
  })

  it('do not need new keyword', () => {
    const uri = URI('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
    uri.should.be.instanceof(URI)
  })

  describe('instantiation from bitcoin uri', () => {
    let uri

    it('parses address', () => {
      uri = new URI('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
      uri.address.should.be.instanceof(Bitcoin.Address)
      uri.network.should.equal(Networks.livenet)
    })

    it('parses amount', () => {
      uri = URI.fromString('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=123.22')
      uri.address.toString().should.equal('1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
      uri.amount.should.equal(12322000000)
      expect(uri.otherParam).to.equal(undefined)
    })

    it('parses a testnet address', () => {
      uri = new URI('bitcoincash:mkYY5NRvikVBY1EPtaq9fAFgquesdjqECw')
      uri.address.should.be.instanceof(Bitcoin.Address)
      uri.network.should.equal(Networks.testnet)
    })

    it('stores unknown parameters as "extras"', () => {
      uri = new URI('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=1.2&other=param')
      uri.address.should.be.instanceof(Bitcoin.Address)
      expect(uri.other).to.equal(undefined)
      uri.extras.other.should.equal('param')
    })

    it('throws error when a required feature is not supported', () => {
      ;(function () {
        return new URI(
          'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=1.2&other=param&req-required=param'
        )
      }.should.throw(Error))
    })

    it('has no false negative when checking supported features', () => {
      uri = new URI(
        'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=1.2&other=param&' +
          'req-required=param',
        ['req-required']
      )
      uri.address.should.be.instanceof(Bitcoin.Address)
      uri.amount.should.equal(120000000)
      uri.extras.other.should.equal('param')
      uri.extras['req-required'].should.equal('param')
    })
  })

  // TODO: Split this and explain tests
  it('should create instance from object', () => {
    let uri

    uri = new URI({
      address: '1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj',
    })
    uri.address.should.be.instanceof(Bitcoin.Address)
    uri.network.should.equal(Networks.livenet)

    uri = new URI({
      address: 'mkYY5NRvikVBY1EPtaq9fAFgquesdjqECw',
    })
    uri.address.should.be.instanceof(Bitcoin.Address)
    uri.network.should.equal(Networks.testnet)

    uri = new URI({
      address: '1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj',
      amount: 120000000,
      other: 'param',
    })
    uri.address.should.be.instanceof(Bitcoin.Address)
    uri.amount.should.equal(120000000)
    expect(uri.other).to.equal(undefined)
    uri.extras.other.should.equal('param')
    ;(function () {
      return new URI({
        address: '1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj',
        'req-required': 'param',
      })
    }.should.throw(Error))

    uri = new URI(
      {
        address: '1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj',
        amount: 120000000,
        other: 'param',
        'req-required': 'param',
      },
      ['req-required']
    )
    uri.address.should.be.instanceof(Bitcoin.Address)
    uri.amount.should.equal(120000000)
    uri.extras.other.should.equal('param')
    uri.extras['req-required'].should.equal('param')
  })

  it('should support double slash scheme', () => {
    const uri = new URI('bitcoincash://1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
    uri.address.toString().should.equal('1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
  })

  it('should input/output String', () => {
    const str =
      'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?' +
      'message=Donation%20for%20project%20xyz&label=myLabel&other=xD'
    URI.fromString(str).toString().should.equal(str)
  })

  it('should input/output JSON', () => {
    const json = JSON.stringify({
      address: '1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj',
      message: 'Donation for project xyz',
      label: 'myLabel',
      other: 'xD',
    })
    JSON.stringify(URI.fromObject(JSON.parse(json))).should.equal(json)
  })

  it('should support numeric amounts', () => {
    const uri = new URI('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=12.10001')
    expect(uri.amount).to.be.equal(1210001000)
  })

  it('should support extra arguments', () => {
    const uri = new URI(
      'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?' +
        'message=Donation%20for%20project%20xyz&label=myLabel&other=xD'
    )

    should.exist(uri.message)
    uri.message.should.equal('Donation for project xyz')

    should.exist(uri.label)
    uri.label.should.equal('myLabel')

    should.exist(uri.extras.other)
    uri.extras.other.should.equal('xD')
  })

  it('should generate a valid URI', () => {
    new URI({
      address: '1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj',
    })
      .toString()
      .should.equal('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')

    new URI({
      address: '1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj',
      amount: 110001000,
      message: 'Hello World',
      something: 'else',
    })
      .toString()
      .should.equal(
        'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj?amount=1.10001&message=Hello%20World&something=else'
      )
  })

  it('should be case insensitive to protocol', () => {
    const uri1 = new URI('bItcOincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')
    const uri2 = new URI('bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj')

    uri1.address.toString().should.equal(uri2.address.toString())
  })

  it('writes correctly the "r" parameter on string serialization', () => {
    const originalString =
      'bitcoincash:mmrqEBJxUCf42vdb3oozZtyz5mKr3Vb2Em?amount=0.1&' +
      'r=https%3A%2F%2Ftest.bitpay.com%2Fi%2F6DKgf8cnJC388irbXk5hHu'
    const uri = new URI(originalString)
    uri.toString().should.equal(originalString)
  })

  it('displays nicely on the console (#inspect)', () => {
    const uri = 'bitcoincash:1DP69gMMvSuYhbnxsi4EJEFufUAbDrEQfj'
    const instance = new URI(uri)
    instance.inspect().should.equal(`<URI: ${uri}>`)
  })

  it("fails early when fromString isn't provided a string", () => {
    expect(() => URI.fromString(1)).to.throw()
  })

  it("fails early when fromJSON isn't provided a valid JSON string", () => {
    expect(() => URI.fromJSON('¹')).to.throw()
  })
})
