/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Request, Response } from 'express'
import { db } from '../db/db.js'
import { Computer } from '@bitcoin-computer/lib'
import { crypto } from '@bitcoin-computer/nakamotojs'
import { randomBytes } from 'node:crypto'
import cors from 'cors'
import { Chess } from '@bitcoin-computer/chess-contracts'

const app = express()
const PORT = 4000
const computer = new Computer({ chain: 'LTC', network: 'regtest', url: 'http://127.0.0.1:1031' })

app.use(cors())
app.use(express.json())

app.get('/hash', async (_: Request, res: Response) => {
  try {
    const secret = randomBytes(32).toString('hex')
    const buffer = Buffer.from(secret)
    const hash = crypto.sha256(crypto.sha256(buffer)).toString('hex')
    await db.none(
      `INSERT INTO "Secrets" ("secret", "hash") VALUES ($1, $2);`,
      [secret, hash]
    )
    res.status(200).json(hash)
  } catch (error) {
    if (error instanceof Error)
      res.status(500).json({ error: `Internal server error: ${error.message}` })
  }
})

app.get('/secret/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params    
    const [rev] = await computer.query({ ids: [id] })
    const contract = await computer.sync(rev) as any
    const game = new Chess(contract.fen)

    if (game.isGameOver()) {
      const winner = contract._owners[0]
      const hash = winner === contract.publicKeyW ? contract.secretHashW : contract.secretHashB

      const { secret } = await db.one(
        `SELECT secret FROM "Secrets" WHERE "hash"=$1;`,
        [hash]
      )
      res.status(200).json(secret)
    } else {
      res.json('')
    }
  } catch (error) {
    if (error instanceof Error)
      res.status(500).json({ error: `Internal server error: ${error.message}` })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
