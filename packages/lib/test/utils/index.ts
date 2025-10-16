import dotenv from 'dotenv'
import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import path from 'path'

// possible env paths
const envPaths = [
  path.resolve(process.cwd(), './packages/node/.env'), // monorepo root
  '../node/.env', // when running from lib
]

for (const envPath of envPaths) {
  dotenv.config({ path: envPath })
}

chai.use(chaiAsPromised)

export const expect = chai.expect

export const url = process.env.BCN_URL
export const chain = process.env.BCN_CHAIN
export const network = process.env.BCN_NETWORK

if (!url || !chain || !network)
  throw new Error('Please create a .env file, see README file of node package.')

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
