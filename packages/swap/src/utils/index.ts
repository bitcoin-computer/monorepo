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

export const meta = {
  _id: (x: any) => typeof x === 'string',
  _rev: (x: any) => typeof x === 'string',
  _root: (x: any) => typeof x === 'string',
  _owners: (x: any) => Array.isArray(x),
  _satoshis: (x: any) => typeof x === 'bigint',
}
