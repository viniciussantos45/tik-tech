import cors from 'cors'
import express from 'express'
import { Server } from 'http'
import { v4 as uuid } from 'uuid'
import { videoGenerator } from './services'
import { initializeSocket } from './socket'

const app = express()
const PORT = 10000

app.use(
  cors({
    allowedHeaders: '*',
    origin: '*'
  })
)

const httpServer = new Server(app)

initializeSocket(httpServer)

app.use(express.json())

app.post('/generate', async (req, res) => {
  const { feature, programming_language } = req.body

  const id = uuid()

  videoGenerator(feature, programming_language, id)

  res.status(200).json({ video_id: id })
})

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
