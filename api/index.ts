// Vercel serverless function wrapper for Express app
// This allows our Express server to run as a Vercel function

import { VercelRequest, VercelResponse } from '@vercel/node'
import express from 'express'
import cors from 'cors'
import multer from 'multer'

export const runtime = 'nodejs'

// Import handlers using dynamic imports to avoid ES module issues
let handleHello: any
let handleUnifiedProcessing: any
let adaptExpressRequest: any
let ResponseAdapter: any

async function initializeHandlers() {
  if (!handleHello) {
    const simpleHandlers = await import('../server/lib/simple-handlers.js')
    const unifiedHandlers = await import('../server/lib/unified-handlers.js')
    const types = await import('../server/lib/types.js')
    
    handleHello = simpleHandlers.handleHello
    handleUnifiedProcessing = unifiedHandlers.handleUnifiedProcessing
    adaptExpressRequest = types.adaptExpressRequest
    ResponseAdapter = types.ResponseAdapter
  }
}

// Create Express app (similar to express-server.ts but for Vercel)
const app = express()

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5174",
  credentials: true,
}))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Multer configuration for file uploads
const upload = multer({
  dest: "/tmp", // Use /tmp in serverless environment
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`))
    }
  },
})

// API Routes
app.get("/api/hello", async (req, res) => {
  await initializeHandlers()
  const platformReq = adaptExpressRequest(req)
  const platformRes = new ResponseAdapter(res, "express")
  await handleHello(platformReq, platformRes)
})

app.post("/api/process", upload.array("files", 10), async (req, res) => {
  try {
    await initializeHandlers()
    const platformReq = adaptExpressRequest(req)
    const platformRes = new ResponseAdapter(res, "express")
    await handleUnifiedProcessing(platformReq, platformRes)
  } catch (error) {
    console.error("Unified processing error:", error)
    res.status(500).json({
      error: "Processing failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    platform: "Vercel Serverless",
    version: "2.0.0",
  })
})

// Catch-all handler for SPA routing
app.get("*", (req, res) => {
  res.sendFile("index.html", { root: "frontend/dist" })
})

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express error:", error)

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Maximum size is 10MB per file." })
  }
  if (error.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({ error: "Too many files. Maximum is 10 files." })
  }

  res.status(500).json({
    error: "Internal server error",
    details: error.message,
  })
})

// Export the Express app as a Vercel function
export default app