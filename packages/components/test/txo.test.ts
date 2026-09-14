import { describe, it, expect } from 'vitest'
import { lookupIsObject, type TxoLookupClient } from '../src/common/txo'

function client(rows: Array<{ isObject?: boolean }> | Error): TxoLookupClient {
  return {
    getTXOs: async () => {
      if (rows instanceof Error) throw rows
      return rows
    },
  }
}

describe('lookupIsObject', () => {
  it('returns true when the index row is an object', async () => {
    expect(await lookupIsObject(client([{ isObject: true }]), 'aa:0')).to.eq(true)
  })

  it('returns false when the index row is not an object', async () => {
    expect(await lookupIsObject(client([{ isObject: false }]), 'aa:0')).to.eq(false)
  })

  it('returns undefined when the output is not indexed', async () => {
    expect(await lookupIsObject(client([]), 'aa:0')).to.eq(undefined)
  })

  it('returns undefined when isObject is missing on the row', async () => {
    expect(await lookupIsObject(client([{}]), 'aa:0')).to.eq(undefined)
  })

  it('returns undefined when getTXOs throws', async () => {
    expect(await lookupIsObject(client(new Error('network')), 'aa:0')).to.eq(undefined)
  })

  it('returns undefined for an empty rev without calling the node', async () => {
    let called = false
    const c: TxoLookupClient = {
      getTXOs: async () => {
        called = true
        return [{ isObject: true }]
      },
    }
    expect(await lookupIsObject(c, '')).to.eq(undefined)
    expect(called).to.eq(false)
  })
})
