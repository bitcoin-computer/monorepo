/* eslint-disable no-unused-expressions */
import { expect } from 'chai'
import { Computer } from '@bitcoin-computer/lib'
import { List } from '../src'

describe('List', () => {
  it('Should work', async () => {
    const computer = new Computer()
    await computer.faucet(1e8)
    const list = await computer.new(List)
    expect(list.elements).deep.eq([])
    await list.add('k')
    expect(list.elements).deep.eq(['k'])
    await list.delete('k')
    expect(list.elements).deep.eq([])
  })
})
