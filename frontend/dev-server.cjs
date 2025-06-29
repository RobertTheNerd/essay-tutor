const express = require('express')

const app = express()
const PORT = 3000

// Middleware for parsing JSON and handling CORS
app.use(express.json())
app.use((req, res, next) => {
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
app.get('/api/hello', (req, res) => {
  const { name = 'World' } = req.query
  res.json({
    message: `Hello ${name}! Essay Tutor API is running.`,
    timestamp: new Date().toISOString(),
    method: req.method
  })
})

// Multiple image upload endpoint for testing
app.post('/api/upload-multiple', (req, res) => {
  res.json({
    success: true,
    files: [
      { name: 'page1.jpg', type: 'image/jpeg', size: 1024000, processed: false, pageNumber: 1 },
      { name: 'page2.jpg', type: 'image/jpeg', size: 1048000, processed: false, pageNumber: 2 }
    ],
    message: 'Multiple image upload endpoint working! (Full AI processing requires Vercel deployment)',
    timestamp: new Date().toISOString(),
  })
})

// Text processing endpoint for testing
app.post('/api/process-text', (req, res) => {
  const { text } = req.body || {}
  const wordCount = text ? text.trim().split(/\s+/).filter(w => w.length > 0).length : 0
  
  res.json({
    success: true,
    processing: {
      detectedTopic: 'Sample topic detection (requires OpenAI API for full functionality)',
      wordCount: wordCount,
      characterCount: text ? text.length : 0,
      sentences: text ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0,
      paragraphs: text ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0,
      processingTime: 150,
      confidence: 0.0,
      textPreview: text ? text.substring(0, 200) + '...' : '',
      analysisReady: true,
    },
    message: 'Text processing endpoint working! (Full AI analysis requires Vercel deployment with OpenAI API)',
    timestamp: new Date().toISOString(),
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`)
  console.log(`📁 API routes:`)
  console.log(`   GET  http://localhost:${PORT}/api/hello`)
  console.log(`   POST http://localhost:${PORT}/api/upload-multiple`)
  console.log(`   POST http://localhost:${PORT}/api/process-text`)
  console.log(`💡 For full functionality, deploy to Vercel with OpenAI API key`)
})