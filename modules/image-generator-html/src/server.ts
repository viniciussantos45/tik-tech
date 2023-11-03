import express from 'express'
import { capture } from './capture'

import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT ?? 2000

// Serve arquivos estáticos da pasta 'public'
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.get('/capture', async (req, res) => {
  const paramsDefault = {
    title: 'useState',
    tags: ['tag1', 'tag2'],
    language: 'nodejs',
    username: 'novousuario'
  }

  const params = { ...paramsDefault, ...req.query }

  const png = await capture(params)

  res.setHeader('Content-Type', 'image/png')
  res.statusCode = 200
  res.end(png)
})

app.listen(port, () => {
  console.log(`O servidor está rodando na porta ${port}`)
})
