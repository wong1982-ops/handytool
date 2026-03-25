// scripts/vblog-server/index.ts
import express from 'express'
import { handleRecord } from './record'
import { handleAssemble } from './assemble'
import { handleAdapt } from './adapt'

const app = express()
app.use(express.json({ limit: '50mb' }))

const PORT = process.env.PORT || 4000
const API_SECRET = process.env.VBLOG_API_SECRET || 'dev-secret'

// Auth middleware
app.use((req, res, next) => {
  const auth = req.headers.authorization
  if (auth !== `Bearer ${API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
})

// Health check
app.get('/health', (_, res) => res.json({ ok: true }))

// Pipeline step endpoints
app.post('/record', handleRecord)
app.post('/assemble', handleAssemble)
app.post('/adapt', handleAdapt)

app.listen(PORT, () => {
  console.log(`[vblog-processor] Running on port ${PORT}`)
})
