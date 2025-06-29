// Load environment variables FIRST - before any imports
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Express.js server for self-hosted deployment
// Provides the same API endpoints as Vercel functions with real functionality

import cors from "cors";
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  handleHello,
  handleProcessText,
  handleUploadMultiple,
} from "./lib/handlers.js";
import { adaptExpressRequest, ResponseAdapter } from "./lib/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Multer configuration for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Serve static files from frontend (if built)
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// API Routes
app.get("/api/hello", async (req, res) => {
  const platformReq = adaptExpressRequest(req);
  const platformRes = new ResponseAdapter(res, "express");

  await handleHello(platformReq, platformRes);
});

app.post("/api/process-text", async (req, res) => {
  const platformReq = adaptExpressRequest(req);
  const platformRes = new ResponseAdapter(res, "express");

  await handleProcessText(platformReq, platformRes);
});

app.post(
  "/api/upload-multiple",
  upload.array("files", 10),
  async (req, res) => {
    try {
      const platformReq = adaptExpressRequest(req);
      const platformRes = new ResponseAdapter(res, "express");

      await handleUploadMultiple(platformReq, platformRes);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "File upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    platform: "Express.js Self-hosted",
    version: process.env.npm_package_version || "1.0.0",
  });
});

// Serve frontend for all other routes (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Express error:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File too large. Maximum size is 10MB per file." });
      }
      if (error.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json({ error: "Too many files. Maximum is 10 files." });
      }
    }

    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Essay Tutor Express Server running on port ${PORT}`);
  console.log(`📁 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/hello`);
  console.log(`   POST http://localhost:${PORT}/api/process-text`);
  console.log(`   POST http://localhost:${PORT}/api/upload-multiple`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`💡 Environment: ${process.env.NODE_ENV || "development"}`);

  // Check for AI configuration
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAzure = !!(
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME
  );

  if (hasAzure) {
    console.log(
      `🤖 AI: Azure OpenAI configured (${process.env.AZURE_OPENAI_DEPLOYMENT_NAME})`
    );
  } else if (hasOpenAI) {
    console.log(`🤖 AI: OpenAI configured`);
  } else {
    console.log(
      `⚠️  AI: No API key configured - set OPENAI_API_KEY or Azure OpenAI environment variables`
    );
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});

export default app;
