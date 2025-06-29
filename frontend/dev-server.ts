const express = require('express')
const path = require('path')

const app = express()
const PORT = 3000

// Middleware for parsing JSON and handling CORS
app.use(express.json())
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5174')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Simple hello endpoint for testing
app.get('/api/hello', (req: any, res: any) => {
  const { name = 'World' } = req.query
  res.json({
    message: `Hello ${name}! Essay Tutor API is running.`,
    timestamp: new Date().toISOString(),
    method: req.method
  })
})

// Simple upload endpoint for testing (without AI for now)
app.post('/api/upload', (req: any, res: any) => {
  res.json({
    success: true,
    message: 'File upload endpoint working! (Full functionality requires Vercel deployment)',
    timestamp: new Date().toISOString(),
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`)
  console.log(`📁 API routes:`)
  console.log(`   GET  http://localhost:${PORT}/api/hello`)
  console.log(`   POST http://localhost:${PORT}/api/upload`)
  console.log(`💡 For full functionality, deploy to Vercel`)
})