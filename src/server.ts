import cors from 'cors'
import express, { Request, Response } from 'express'
import { Server } from 'http'
import { v4 as uuid } from 'uuid'

import { PATH_RESULTS } from './config/environment'

import { videoGenerator } from './services'
import { initializeSocket } from './socket'

import fs from 'node:fs'
import path from 'node:path'

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

app.use('/', express.static(path.join(process.cwd(), 'client/front-end/dist')))

app.post('/api/generate', async (req: Request, res: Response) => {
  const { feature, programming_language } = req.body

  const id = uuid()

  videoGenerator(feature, programming_language, id)

  res.status(200).json({ video_id: id })
})

app.get('/api/download/:id', (req: Request, res: Response) => {
  const { id } = req.params

  const videoFilePath = path.join(process.cwd(), `${PATH_RESULTS}/${id}/output_final_video.mp4`)
  if (!fs.existsSync(videoFilePath)) {
    return res.status(404).send('Video not found')
  }

  res.setHeader('Content-Type', 'video/mp4')
  res.setHeader('Content-Disposition', `attachment; filename=${id}.mp4`)

  const stream = fs.createReadStream(videoFilePath)
  stream.pipe(res)
})

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd() + '/client/front-end/dist'))
})

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
