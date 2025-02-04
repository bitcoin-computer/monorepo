export const getMockedRev = () => `mock-${'0'.repeat(64)}:${Math.floor(Math.random() * 10000)}`

export const RLTC: {
  network: 'regtest'
  chain: 'LTC'
  url: string
} = {
  network: 'regtest',
  chain: 'LTC',
  url: 'http://localhost:1031',
}

const isString = (x: any) => typeof x === 'string'
const isNumber = (x: any) => typeof x === 'number'
const isArray = (x: any) => Array.isArray(x)

export const meta = {
  _id: isString,
  _rev: isString,
  _root: isString,
  _owners: isArray,
  _amount: isNumber,
}
