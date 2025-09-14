export const mockRev = () => `mock-${'0'.repeat(64)}:${Math.floor(Math.random() * 1000000)}`
export const mockPublicKey = '023a06bc3ca20170b8202737316a29923f5b0e47f39c6517990f3c75f3b3d4484c'

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
