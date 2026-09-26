import { parseListPrice } from './price'

describe('parseListPrice', () => {
  it('converts prices exactly', () => {
    // Number(x) * 1e8 is not an integer for these, so BigInt() used to throw.
    expect(parseListPrice('0.29')).toBe(29_000_000n)
    expect(parseListPrice('0.07')).toBe(7_000_000n)
    expect(parseListPrice('1.1')).toBe(110_000_000n)
    expect(parseListPrice('2.3')).toBe(230_000_000n)
    expect(parseListPrice('0.00000001')).toBe(1n)
    expect(parseListPrice(' 12 ')).toBe(1_200_000_000n)
    expect(parseListPrice('.5')).toBe(50_000_000n)
  })

  it('rejects amounts that are not positive', () => {
    expect(() => parseListPrice('0')).toThrow('greater than zero')
    expect(() => parseListPrice('0.000000000')).toThrow('at most 8 decimal places')
    expect(() => parseListPrice('0.00000000')).toThrow('greater than zero')
    expect(() => parseListPrice('-1')).toThrow('valid amount')
  })

  it('rejects more than 8 decimals instead of rounding', () => {
    expect(() => parseListPrice('0.123456789')).toThrow('at most 8 decimal places')
  })

  it('rejects exponent notation, which a number input can produce', () => {
    expect(() => parseListPrice('1e-7')).toThrow('plain decimal')
    expect(() => parseListPrice('2E3')).toThrow('plain decimal')
  })

  it('rejects amounts that do not fit in a transaction output', () => {
    expect(parseListPrice('92233720368.54775807')).toBe(2n ** 63n - 1n)
    expect(() => parseListPrice('92233720368.54775808')).toThrow('too large')
  })

  it('rejects input that is not a decimal number', () => {
    for (const bad of ['', ' ', 'abc', '+1', '1,5', '1.2.3', '.', 'NaN', 'Infinity']) {
      expect(() => parseListPrice(bad), bad).toThrow('valid amount')
    }
  })
})
