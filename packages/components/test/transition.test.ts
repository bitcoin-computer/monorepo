import { describe, it, expect } from 'vitest'
import {
  classifyDecodeFailure,
  classifyTransitionMeta,
  isDecryptionFailure,
  isModuleDeployDecodeError,
  readOnChainMeta,
} from '../src/common/transition'

describe('isDecryptionFailure', () => {
  it('matches the lib Decryption failure message', () => {
    expect(isDecryptionFailure(new Error('Decryption failure'))).to.eq(true)
    expect(isDecryptionFailure('Decryption failure')).to.eq(true)
    expect(isDecryptionFailure(new Error('Failed to load object state'))).to.eq(false)
    expect(isDecryptionFailure(undefined)).to.eq(false)
  })
})

describe('classifyTransitionMeta', () => {
  it('detects public transitions', () => {
    expect(classifyTransitionMeta({ exp: '__bc__.inc()', env: {}, v: '0.0.0', ioMap: [] })).to.eq(
      'public',
    )
  })

  it('detects encrypted transitions without decrypting', () => {
    expect(classifyTransitionMeta({ __cypher: 'abc', __secrets: ['x'], ioMap: [] })).to.eq(
      'encrypted',
    )
  })

  it('detects multisig module deploys', () => {
    expect(classifyTransitionMeta({ ept: 'export class C {}' })).to.eq('module')
  })

  it('treats empty metadata as none', () => {
    expect(classifyTransitionMeta(undefined)).to.eq('none')
    expect(classifyTransitionMeta(null)).to.eq('none')
    expect(classifyTransitionMeta([])).to.eq('none')
    expect(classifyTransitionMeta({})).to.eq('none')
  })
})

describe('classifyDecodeFailure', () => {
  it('labels encrypted metadata as encrypted even without the decrypt error', () => {
    expect(classifyDecodeFailure({ __cypher: 'x', __secrets: [] }, new Error('other'))).to.eq(
      'encrypted',
    )
  })

  it('labels Decryption failure as encrypted', () => {
    expect(classifyDecodeFailure([], new Error('Decryption failure'))).to.eq('encrypted')
  })

  it('labels module deploy decode errors (including taproot with empty meta)', () => {
    expect(
      classifyDecodeFailure(
        [],
        new Error('This transaction deploys a module. Use computer.load() instead of decode().'),
      ),
    ).to.eq('module')
    expect(classifyDecodeFailure({ ept: 'export const x = 1' }, new Error('nope'))).to.eq('module')
  })

  it('keeps plain payments as none', () => {
    expect(
      classifyDecodeFailure([], new Error('Cannot convert undefined or null to object')),
    ).to.eq('none')
  })

  it('surfaces unexpected decode errors when metadata looks like a public transition', () => {
    expect(classifyDecodeFailure({ exp: 'new C()' }, new Error('unconfirmed'))).to.eq('error')
  })
})

describe('readOnChainMeta / isModuleDeployDecodeError', () => {
  it('returns metadata or undefined when the getter throws', () => {
    expect(readOnChainMeta({ onChainMetaData: { exp: '1' } })).to.deep.eq({ exp: '1' })
    expect(readOnChainMeta(undefined)).to.eq(undefined)
    expect(
      readOnChainMeta({
        get onChainMetaData() {
          throw new Error('parse')
        },
      }),
    ).to.eq(undefined)
  })

  it('detects module deploy decode errors', () => {
    expect(isModuleDeployDecodeError(new Error('This transaction deploys a module.'))).to.eq(true)
    expect(isModuleDeployDecodeError(new Error('Decryption failure'))).to.eq(false)
  })
})
