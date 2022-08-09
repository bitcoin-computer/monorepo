import chai from 'chai'
import { Bitcoin } from '../bitcoin'

const { expect } = chai
const { OutputId } = Bitcoin.Transaction

const DUMMY_TXID = 'b18d0e8bd48c62124f5db85e2d5b3d288e23f72937f513bb009299607f253089'

describe('OutputId', () => {
  describe('new', () => {
    it('should create a new object from txid and string', () => {
      const outputId = new OutputId(DUMMY_TXID, 4)
      expect(outputId.txId).to.equal(DUMMY_TXID)
      expect(outputId.outputIndex).to.equal(4)
    })

    it('should fail if txid is not properly formatted', () => {
      expect(() => new OutputId('', 0)).to.throw()
      expect(() => new OutputId('1Nh7uHdvY6fNwtQtM1G5EZAFPLC33B59rB', 0)).to.throw()
      expect(() => new OutputId('abcdef0123456789', 0)).to.throw()
    })

    it('should fail if output index is outside range', () => {
      expect(() => new OutputId(DUMMY_TXID, -1)).to.throw()
      expect(() => new OutputId(DUMMY_TXID, 5000000000)).to.throw()
    })
  })

  describe('toString', () => {
    it('should serialize to colon format', () => {
      const outputId = new OutputId(DUMMY_TXID, 4)
      expect(outputId.toString()).to.equal(`${DUMMY_TXID}:4`)
    })
  })

  describe('fromString', () => {
    it('should parse colon format', () => {
      const outputId = OutputId.fromString(`${DUMMY_TXID}:4`)
      expect(outputId.txId).to.equal(DUMMY_TXID)
      expect(outputId.outputIndex).to.equal(4)
    })

    it('should fail to parse incorrect formats', () => {
      expect(() => OutputId.fromString('')).to.throw()
      expect(() => OutputId.fromString(':')).to.throw()
      expect(() => OutputId.fromString(DUMMY_TXID)).to.throw()
      expect(() => OutputId.fromString(':4')).to.throw()
      expect(() => OutputId.fromString(`${DUMMY_TXID}:`)).to.throw()
      expect(() => OutputId.fromString(`${DUMMY_TXID}:4:0`)).to.throw()
    })
  })

  describe('get', () => {
    it('txid should return the same as txId', () => {
      const outputId = new OutputId(DUMMY_TXID, 4)
      expect(outputId.txid).to.equal(DUMMY_TXID)
    })

    it('vout should return the same as outputIndex', () => {
      const outputId = new OutputId(DUMMY_TXID, 4)
      expect(outputId.vout).to.equal(4)
    })
  })

  describe('equals', () => {
    it('should be equal when txid and output id are same', () => {
      const outputId1 = new OutputId(DUMMY_TXID, 1)
      const outputId2 = new OutputId(DUMMY_TXID, 1)
      expect(outputId1.equals(outputId2)).to.equal(true)
    })

    it('should not be equal when txids are different', () => {
      const outputId1 = new OutputId(DUMMY_TXID, 1)
      const outputId2 = new OutputId(DUMMY_TXID.replace('0', '1'), 1)
      expect(outputId1.equals(outputId2)).to.equal(false)
    })

    it('should not be equal when output indexes are different', () => {
      const outputId1 = new OutputId(DUMMY_TXID, 1)
      const outputId2 = new OutputId(DUMMY_TXID, 2)
      expect(outputId1.equals(outputId2)).to.equal(false)
    })

    it('should be equal for all txId capitalizations', () => {
      const outputId1 = new OutputId(DUMMY_TXID.toLowerCase(), 3)
      const outputId2 = new OutputId(DUMMY_TXID.toUpperCase(), 3)
      expect(outputId1.equals(outputId2)).to.equal(true)
    })
  })
})
