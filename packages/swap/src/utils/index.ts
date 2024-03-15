import * as chai from 'chai'
import chaiMatchPattern from 'chai-match-pattern'

chai.use(chaiMatchPattern)
const _ = chaiMatchPattern.getLodashModule()

export function getTestTxId(i = 0): string {
  if (i === 0) return 'mock:0000000000000000000000000000000000000000000000000000000000000000'
  if (i === 1) return 'mock:1111111111111111111111111111111111111111111111111111111111111111'
  if (i === 2) return 'mock:2222222222222222222222222222222222222222222222222222222222222222'
  if (i === 3) return 'mock:3333333333333333333333333333333333333333333333333333333333333333'
  if (i === 4) return 'mock:4444444444444444444444444444444444444444444444444444444444444444'
  if (i === 5) return 'mock:5555555555555555555555555555555555555555555555555555555555555555'
  throw new Error('getTestTxId is only defined for parameters smaller than 6.')
}

export function getTestRev(txId = 0, outNum = 0): string {
  return `${getTestTxId(txId)}:${outNum}`
}

export const RLTC: {
  network: 'regtest'
  chain: 'LTC'
  url: string
} = {
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
}

export const meta = {
  _id: _.isString,
  _rev: _.isString,
  _root: _.isString,
  _owners: _.isArray,
  _amount: _.isNumber,
}