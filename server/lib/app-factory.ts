// Shared Express app factory to eliminate code duplication
// Used by both local server and Vercel deployment

import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"

// Import handlers (will be available after compilation)
import { handleHello } from "./simple-handlers"
import { handleUnifiedProcessing } from "./unified-handlers"
import { adaptExpressRequest, ResponseAdapter } from "./types"

export interface AppOptions {
  isServerless?: boolean
  staticPath?: string
}

export function createApp(options: AppOptions = {}) {
  const { isServerless = false, staticPath } = options
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
    dest: isServerless ? "/tmp" : "uploads/", // Use /tmp for serverless, uploads/ for local
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

  // Serve static files from frontend (if path provided)
  if (staticPath) {
    app.use(express.static(staticPath))
  }

  // API Routes
  app.get("/api/hello", async (req, res) => {
    const platformReq = adaptExpressRequest(req)
    const platformRes = new ResponseAdapter(res, "express")
    await handleHello(platformReq, platformRes)
  })

  // Unified processing endpoint (handles both text and files)
  app.post("/api/process", upload.array("files", 10), async (req, res) => {
    try {
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
      platform: isServerless ? "Vercel Serverless" : "Express.js Self-hosted",
      version: "2.0.0",
    })
  })

  // Serve frontend for all other routes (SPA fallback) - only if static path provided
  if (staticPath) {
    app.get("*", (req, res) => {
      res.sendFile(path.join(staticPath, "index.html"))
    })
  }

  // Error handling middleware
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express error:", error)

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large. Maximum size is 10MB per file." })
      }
      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: "Too many files. Maximum is 10 files." })
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    })
  })

  return app
}