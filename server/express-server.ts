// Load environment variables FIRST - before any imports
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Express.js server for self-hosted deployment
// Uses shared app factory to eliminate code duplication

import path from "path";
import { fileURLToPath } from "url";
import { createApp } from "./lib/app-factory";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

// Create Express app using shared factory  
const frontendPath = path.join(__dirname, "../frontend/dist");
const app = createApp({ 
  isServerless: false,
  staticPath: frontendPath 
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Essay Tutor Express Server running on port ${PORT}`);
  console.log(`📁 API endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/hello`);
  console.log(`   POST http://localhost:${PORT}/api/process (unified - text & files)`);
  console.log(`   POST http://localhost:${PORT}/api/evaluate (essay evaluation)`);
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