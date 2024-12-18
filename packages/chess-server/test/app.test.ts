import { expect } from 'chai'
import { db } from '../db/db.js'
import axios from 'axios'
import * as crypto from 'node:crypto'
import dotenv from "dotenv"

dotenv.config()

export const authenticatedGet = async (
  route: string,
  baseUrl: string,
): Promise<any> =>
  axios.get(`${baseUrl}${route}`)

export const authenticatedPost = async (
  route: string,
  data: Record<string, unknown>,
  baseUrl: string,
): Promise<any> =>
  axios.post(`${baseUrl}${route}`, data)

describe('Route /hash', () => {
  it('Should create a post request', async () => {
    const { data } = await axios.get('http://127.0.0.1:4000/hash')
    expect(typeof data).eq('string')

    const { secret } = await db.one(
      `SELECT secret FROM "Secrets" WHERE "hash"=$1;`,
      [data]
    )

    const firstHash = crypto.createHash('sha256').update(Buffer.from(secret)).digest()
    const hash = crypto.createHash('sha256').update(firstHash).digest('hex')
    expect(hash).eq(data)
  })
})
