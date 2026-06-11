import { describe, it, expect } from 'vitest'
import { bigIntToStr, strToBigInt } from '../src/common/utils'

describe('strToBigInt/bigIntToStr', () => {
  it('Should throw if an invalid number is provided', async () => {
    const invalidInputs = [
      '1.1.1',
      '12a.34',
      '12.3z',
      '12$3.45',
      'abc',
      '.',
      '',
      '-',
      '-0',
      '-0.00000000',
    ]

    invalidInputs.forEach((input) => {
      expect(() => strToBigInt(input)).toThrowError('Invalid number')
    })
  })

  it('handles valid numbers correctly', () => {
    const validInputs = ['123', '0.98765432', '123456789.1', '.5', '000123.45', '123.']

    validInputs.forEach((input) => {
      expect(() => strToBigInt(input)).not.toThrow()
    })
  })

  it('Should parse a string encoding a rounded integer', async () => {
    expect(strToBigInt('1')).to.eq(BigInt(1e8))
    expect(strToBigInt('1.')).to.eq(BigInt(1e8))
    expect(strToBigInt('.1')).to.eq(BigInt(1e7))
    expect(bigIntToStr(BigInt(1e8))).to.eq('1.0')
  })

  it('Should parse a string encoding a floating point number', async () => {
    expect(strToBigInt('1.5')).to.eq(BigInt(1.5 * 1e8))
    expect(bigIntToStr(BigInt(1.5 * 1e8))).to.eq('1.5')
  })

  it('Should parse a string encoding the smallest number in 64 bits', async () => {
    expect(strToBigInt('0.00000001')).to.eq(1n)
    expect(bigIntToStr(1n)).to.eq('0.00000001')
  })

  it('Should parse a string encoding the biggest number in 64 bits', async () => {
    expect(strToBigInt('1000000000000000000000.00000001')).to.eq(
      BigInt('100000000000000000000000000001'),
    )
    expect(bigIntToStr(BigInt('100000000000000000000000000001'))).to.eq(
      '1000000000000000000000.00000001',
    )
  })
})
