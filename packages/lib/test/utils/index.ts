import dotenv from 'dotenv'
import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

dotenv.config({ path: '../node/.env' })

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
