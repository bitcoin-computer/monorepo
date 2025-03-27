import { describe, it, expect } from 'vitest'
import { bigInt2Str, str2BigInt } from '../src/common/utils'

describe('str2BigInt/bigInt2Str', () => {
  it('Should throw if empty string', async () => {
    expect(str2BigInt('')).to.throw
  })

  it('Should parse a string encoding a rounded integer', async () => {
    expect(str2BigInt('1')).to.eq(BigInt(1e8))
    expect(bigInt2Str(BigInt(1e8))).to.eq('1.0')
  })

  it('Should parse a string encoding a floating point number', async () => {
    expect(str2BigInt('1.5')).to.eq(BigInt(1.5 * 1e8))
    expect(bigInt2Str(BigInt(1.5 * 1e8))).to.eq('1.5')
  })

  it('Should parse a string encoding the smallest number in 64 bits', async () => {
    expect(str2BigInt('0.00000001')).to.eq(1n)
    expect(bigInt2Str(1n)).to.eq('0.00000001')
  })

  it('Should parse a string encoding the biggest number in 64 bits', async () => {
    expect(str2BigInt('1000000000000000000000.00000001')).to.eq(
      BigInt('100000000000000000000000000001'),
    )
    expect(bigInt2Str(BigInt('100000000000000000000000000001'))).to.eq(
      '1000000000000000000000.00000001',
    )
  })
})
