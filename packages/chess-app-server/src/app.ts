import express, { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/db.js'
import * as crypto from 'node:crypto'
import cors from 'cors'

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

app.get('/secret', async (req: Request, res: Response) => {
  try {
    const secret = crypto.randomBytes(16).toString('hex')
    const firstHash = crypto.createHash('sha256').update(Buffer.from(secret)).digest()
    const hash = crypto.createHash('sha256').update(firstHash).digest('hex')

    await db.none(
      `INSERT INTO "Secrets" ("secret", "hash") VALUES ($1, $2);`,
      [secret, hash]
    )
    res.json(hash)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
