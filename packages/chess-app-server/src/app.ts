import express, { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { db } from '../db/db.js'
import cors from 'cors'

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

app.get('/games/:gameId', async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId

    const data = await db.query(`SELECT * FROM "Games" WHERE "gameId" = $1`, [gameId])

    if (data) {
      res.json(data)
    } else {
      res.status(404).json({ message: 'Data not found' })
    }
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/games', async (req, res) => {
  try {
    const { gameId, publicKeyW, publicKeyB } = req.body

    // You can perform validation here before updating the data
    const id = uuidv4()

    await db.none(
      `INSERT INTO "Games" (id, "gameId", "publicKeyW", "publicKeyB", "secretW", "secretB") VALUES ($1, $2, $3, $4, $5, $6);`,
      [id, gameId, publicKeyW, publicKeyB, 'hash1', 'hash2']
    )

    res.status(201).json({ message: 'Game added successfully' })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
