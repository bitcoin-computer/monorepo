import { Bitcoin } from '../bitcoin'

const { Random } = Bitcoin.crypto

describe('Random', () => {
  describe('@getRandomBuffer', () => {
    it('should return a buffer', () => {
      const bytes = Random.getRandomBuffer(8)
      bytes.length.should.equal(8)
      Buffer.isBuffer(bytes).should.equal(true)
    })

    it('should not equate two 256 bit random buffers', () => {
      const bytes1 = Random.getRandomBuffer(32)
      const bytes2 = Random.getRandomBuffer(32)
      bytes1.toString('hex').should.not.equal(bytes2.toString('hex'))
    })

    it('should generate 100 8 byte buffers in a row that are not equal', () => {
      const hexs = []
      for (let i = 0; i < 100; i++) {
        hexs[i] = Random.getRandomBuffer(8).toString('hex')
      }
      for (let i = 0; i < 100; i++) {
        for (let j = i + 1; j < 100; j++) {
          hexs[i].should.not.equal(hexs[j])
        }
      }
    })
  })
})
