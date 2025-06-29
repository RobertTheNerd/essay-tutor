# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Essay Tutor is an AI-powered web application for evaluating ISEE essays. It features a unified platform-agnostic architecture that supports both serverless (Vercel) and self-hosted (Express) deployments with identical functionality.

## Architecture

### Unified API Architecture
The project implements a unique **platform-agnostic design** where business logic is shared across deployment platforms:

- **Shared Logic**: `/server/lib/` contains all core business logic
  - `handlers.ts` - API endpoint implementations
  - `ai-client.ts` - AI integration abstraction
  - `types.ts` - Platform abstraction interfaces
- **Platform Adapters**: 
  - Express server: `/server/express-server.ts`
  - Vercel functions: `/api/*.ts` (thin wrappers around shared handlers)

### Project Structure
```
essay-tutor/
├── frontend/     # React 19 + TypeScript + Vite (port 5174 in dev)
├── server/       # Express.js self-hosted server (port 3001)
├── api/          # Vercel serverless functions (mirrors server endpoints)
└── samples/      # Test data and examples
```

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS 4.x, TanStack React Query
- **Backend**: Express.js + Vercel Functions, TypeScript, OpenAI/Azure OpenAI
- **AI**: GPT-4o-mini for text analysis and OCR processing

## Development Commands

### Setup and Installation
```bash
# Install dependencies for both frontend and server
cd frontend && npm install
cd ../server && npm install
```

### Development Server
```bash
# Start both frontend and API server (recommended)
cd frontend && npm run dev

# Start only frontend (port 5174)
cd frontend && npm run dev:frontend

# Start only API server (port 3001)
cd server && npm run dev
```

### Build and Production
```bash
# Build frontend
cd frontend && npm run build

# Build and start server
cd server && npm run build && npm start

# Linting and formatting
cd frontend && npm run lint && npm run format
```

## API Endpoints

All endpoints work identically on both platforms:
- `GET /api/hello` - Health check and AI configuration status
- `POST /api/process-text` - Process text essays with AI analysis
- `POST /api/upload-multiple` - Upload and OCR image files (up to 10 files, 10MB each)

## Environment Configuration

**OpenAI (Standard):**
```bash
OPENAI_API_KEY=your_key
```

**Azure OpenAI:**
```bash
OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_VISION_MODEL=gpt-4o-mini
AZURE_OPENAI_TEXT_MODEL=gpt-4o-mini
```

## Key Implementation Details

### AI Integration
- Automatic provider detection (OpenAI vs Azure OpenAI)
- OCR processing using GPT-4 Vision for image uploads
- Text analysis and topic detection
- Error handling for missing API keys (graceful degradation)

### File Handling
- FERPA-compliant automatic file cleanup
- Multi-page image upload with drag-and-drop
- Support for JPG/PNG files up to 10MB each
- Temporary file storage with automatic cleanup

### Frontend Architecture
- Dual input methods: rich text editor and image upload
- Real-time text statistics (word/character count)
- React Query for API state management
- Responsive design with TailwindCSS
- Typography optimized with Space Mono font for essay display

### Development Features
- Hot reload for both frontend and backend during development
- API proxy configuration in Vite for seamless development
- TypeScript strict mode with comprehensive type definitions
- ESLint and Prettier configuration for code quality

## Important Notes

- The unified architecture allows zero-downtime migration between Vercel and self-hosted deployments
- All AI functionality works during local development (no mocking required)
- Business logic is platform-agnostic and thoroughly testable
- File uploads are automatically cleaned up for privacy compliance
- The app gracefully handles missing AI API keys with appropriate user feedback

## Current Development Phase

**Phase 1 (Complete)**: Core functionality with dual input methods and AI integration
**Phase 2 (In Progress)**: Enhanced OCR and topic detection
**Phase 3 (Planned)**: Full ISEE rubric implementation with scoring system