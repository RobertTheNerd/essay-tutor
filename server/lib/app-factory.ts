// Shared Express app factory to eliminate code duplication
// Used by both local server and Vercel deployment

import express from "express"
import cors from "cors"
import multer from "multer"
import path from "path"

// Import handlers (will be available after compilation)
import { handleHello } from "./simple-handlers"
import { handleImagesToEssay } from "./unified-handlers"
import { handleEvaluation } from "./evaluation/evaluation-handler"
import { adaptExpressRequest, ResponseAdapter } from "./types"

export interface AppOptions {
  isServerless?: boolean
}

export function createApp(options: AppOptions = {}) {
  const { isServerless = false } = options
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

  // API Routes
  app.get("/api/hello", async (req, res) => {
    const platformReq = adaptExpressRequest(req)
    const platformRes = new ResponseAdapter(res, "express")
    await handleHello(platformReq, platformRes)
  })

  // Images-to-essay endpoint (image uploads only)
  app.post("/api/images-to-essay", upload.array("files", 10), async (req, res) => {
    try {
      const platformReq = adaptExpressRequest(req)
      const platformRes = new ResponseAdapter(res, "express")
      await handleImagesToEssay(platformReq, platformRes)
    } catch (error) {
      console.error("Images-to-essay processing error:", error)
      res.status(500).json({
        error: "Processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    }
  })

  // ISEE Evaluation endpoint (Phase 3)
  app.post("/api/evaluate", async (req, res) => {
    try {
      const platformReq = adaptExpressRequest(req)
      const platformRes = new ResponseAdapter(res, "express")
      await handleEvaluation(platformReq, platformRes)
    } catch (error) {
      console.error("Evaluation error:", error)
      res.status(500).json({
        error: "Evaluation failed",
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