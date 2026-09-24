import { describe, it, expect } from 'vitest'
import {
  classNameFromExp,
  classNameFromExports,
  isUsableClassName,
  protoConstructorName,
} from '../src/common/className'

describe('isUsableClassName', () => {
  it('rejects empty, generic, and minified names', () => {
    expect(isUsableClassName('')).toBe(false)
    expect(isUsableClassName('Object')).toBe(false)
    expect(isUsableClassName('Function')).toBe(false)
    expect(isUsableClassName('Contract')).toBe(false)
    expect(isUsableClassName('t')).toBe(false)
    expect(isUsableClassName('fn')).toBe(false)
  })

  it('accepts real class names', () => {
    expect(isUsableClassName('Counter')).toBe(true)
    expect(isUsableClassName('NFT')).toBe(true)
  })
})

describe('protoConstructorName', () => {
  it('reads a usable prototype constructor name', () => {
    class Counter {}
    expect(protoConstructorName(new Counter())).toBe('Counter')
  })

  it('ignores Object and Contract', () => {
    expect(protoConstructorName({})).toBeUndefined()
    class Contract {}
    expect(protoConstructorName(new Contract())).toBeUndefined()
  })
})

describe('classNameFromExp', () => {
  it('parses new ClassName(...)', () => {
    expect(classNameFromExp('new Counter(1, 2)')).toBe('Counter')
    expect(classNameFromExp('const x = new NFT("a")')).toBe('NFT')
  })

  it('ignores unusable names', () => {
    expect(classNameFromExp('new Object()')).toBeUndefined()
    expect(classNameFromExp('new t()')).toBeUndefined()
    expect(classNameFromExp('Counter()')).toBeUndefined()
  })
})

describe('classNameFromExports', () => {
  it('matches an instance to a named export', () => {
    class Token {}
    class Other {}
    expect(classNameFromExports(new Token(), { Other, Token })).toBe('Token')
  })
})
