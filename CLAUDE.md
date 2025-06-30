# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Essay Tutor is a hierarchical AI-powered essay evaluation platform that supports multiple standardized tests and grade levels. It features a unified platform-agnostic architecture with a sophisticated evaluation engine, currently focused on ISEE (Independent School Entrance Examination) across all grade levels (Elementary, Middle, Upper, High School).

## Architecture

### Unified API Architecture
The project implements a unique **platform-agnostic design** where business logic is shared across deployment platforms:

- **Shared Logic**: `/server/lib/` contains all core business logic (CommonJS)
  - `unified-handlers.ts` - Unified API endpoint implementations
  - `document-processor.ts` - Document processing pipeline (MultiPageDocument → StructuredEssay)
  - `ai-client.ts` - AI integration abstraction
  - `app-factory.ts` - Express app factory for platform compatibility
  - `evaluation/` - Hierarchical evaluation engine
    - `rubric-system.ts` - Generic rubric framework
    - `evaluation-engine.ts` - Level-adaptive evaluation logic
    - `rubrics/isee/` - ISEE level configurations (Elementary, Middle, Upper, High School)
  - `types.ts` - Platform abstraction interfaces
- **Platform Adapters**: 
  - Express server: `/server/express-server.ts`
  - Vercel functions: `/api/index.ts` (single unified wrapper)

### Project Structure
```
essay-tutor/
├── frontend/     # React 19 + TypeScript + Vite (port 5174 in dev)
│   └── src/components/evaluation/  # Hierarchical evaluation UI components
├── server/       # Unified backend (Express + Vercel compatible, CommonJS)
│   ├── lib/evaluation/             # Hierarchical evaluation engine
│   │   └── rubrics/isee/          # ISEE level configurations
│   └── express-server.ts          # Self-hosted server (port 3001)
├── api/          # Vercel serverless wrapper (single unified endpoint)
└── samples/      # Target designs (sample_output.html) and test data
```

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS 4.x, TanStack React Query
- **Backend**: Unified Express.js + Vercel Functions, CommonJS, Node.js
- **Evaluation Engine**: Hierarchical rubric system with level-adaptive scoring
- **AI**: GPT-4o-mini for text analysis, OCR processing, and evaluation
- **Reports**: Professional HTML with print optimization and color-coded annotations

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
- `POST /api/process` - Unified processing endpoint for text and files
  - Text input: JSON with `text` field for direct essay processing
  - File input: FormData with `files` for multi-page image upload
  - Features: AI OCR, topic detection, text analysis, ISEE categorization

**Future Endpoints (Phase 3+):**
- `POST /api/evaluate` - Full essay evaluation with rubric selection
- `GET /api/rubrics` - Available rubric configurations
- `POST /api/generate-report` - Professional report generation

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
**Phase 2 (Complete)**: Enhanced document processing with batch AI analysis
**Phase 2.5 (Complete)**: Unified processing architecture refactor
**Phase 3 (Complete)**: Real AI-powered ISEE evaluation system with full backend integration
**Phase 4 (Complete)**: Complete frontend evaluation interface with professional UI
**Phase 5 (Next)**: Multi-level ISEE support and advanced features

## Phase 2 Achievements (Recently Completed)

### Enhanced Document Processing
- **Batch Image Processing**: Single AI request processes multiple pages simultaneously
- **Automatic Page Ordering**: AI determines correct sequence even when uploaded out of order
- **Enhanced Topic Detection**: Distinguishes between extracted prompts vs summarized topics
- **Advanced Text Analysis**: Comprehensive statistics, structure detection, and ISEE categorization

### Technical Improvements
- **Environment Configuration**: Moved to server directory with proper dotenv loading
- **Error Handling**: Comprehensive fallback processing with graceful degradation
- **Performance**: Reduced API calls through intelligent batch processing
- **Type Safety**: Enhanced interfaces for topic source detection and document structure

### Sample Organization
- Organized test images into "with writing prompt" and "without writing prompt" folders
- Comprehensive validation of AI processing capabilities
- Real-world testing with actual student essay samples

## Phase 2.5 Achievements (Recently Completed)

### Unified Architecture Refactor
- **Unified Processing Pipeline**: Complete `MultiPageDocument` → `StructuredEssay` workflow
- **CommonJS Conversion**: Full conversion from ES modules to CommonJS for Vercel compatibility
- **Zero Code Duplication**: Eliminated ~400 lines of duplicate code between platforms
- **Clean API Design**: Single `/api/process` endpoint handling both text and file inputs
- **Foundation for Evaluation**: Prepared architecture for hierarchical evaluation engine

### Technical Improvements
- **Platform Compatibility**: Seamless operation on both Vercel and self-hosted environments
- **Import Simplification**: Removed file extensions from imports after CommonJS conversion
- **Error Handling**: Comprehensive fallback processing for missing AI configuration
- **Performance**: Optimized batch processing with intelligent AI request management

## Phase 3 Achievements (Recently Completed)

### Real AI-Powered ISEE Evaluation System
- **Complete AI Integration**: Replaced placeholder implementation with real ChatGPT/Azure OpenAI evaluation
- **ISEE Upper Level Rubric**: Full 6-category scoring system (Grammar, Vocabulary, Structure, Development, Clarity, Strengths)
- **AI-Generated Annotations**: Real text-specific feedback with improvement suggestions
- **Comprehensive Prompting**: Detailed ISEE rubric instructions for accurate AI evaluation
- **Robust Error Handling**: Intelligent fallback to basic text analysis when AI unavailable

### Backend API Implementation
- **`/api/evaluate` Endpoint**: Complete evaluation API returning structured JSON data
- **Frontend-Ready Data**: Clean separation from HTML generation for React component consumption
- **Performance Validated**: Real testing shows 4.1/5 scores with 4 annotations and 13 feedback blocks
- **Production Ready**: Committed and deployed with full Azure OpenAI integration

## Phase 4 Achievements (Recently Completed)

### Complete Frontend Evaluation Interface
- **Professional UI Components**: ScoreSummary, AnnotatedText, FeedbackSection, EvaluationResults
- **Interactive Annotations**: Color-coded text highlighting with click-to-expand details
- **Real-time Evaluation**: Complete workflow from text input to professional results display
- **Print-Optimized Reports**: Professional HTML reports with forced color printing support
- **Responsive Design**: Mobile-friendly interface with TailwindCSS 4.x styling

### Technical Integration
- **Evaluation Service**: Complete API integration with proper error handling and loading states
- **TypeScript Interfaces**: Comprehensive type definitions for all evaluation data structures
- **End-to-End Workflow**: Seamless flow from essay input to professional evaluation display
- **Production Quality**: Build-tested and deployment-ready frontend interface

## Phase 5: Multi-Level ISEE Support (Next)

### Goals
- **Generic Rubric Framework**: Test families → levels → specific rubrics architecture
- **ISEE Level Support**: All four levels (Elementary, Middle, Upper, High School)
- **Level-Adaptive Evaluation**: Age-appropriate criteria and feedback complexity
- **Professional Annotation System**: Color-coded highlights matching sample_output.html
- **Comprehensive Scoring**: Multi-category evaluation with detailed improvement guidance

### Target Architecture
```
Evaluation System
├── ISEE (Test Family)
│   ├── Elementary Level (Grades 2-4)
│   ├── Middle Level (Grades 5-6)
│   ├── Upper Level (Grades 7-8)
│   └── High School Level (Grades 9-12)
└── Future: SAT, AP, Custom rubrics
```

### Implementation Focus
- **Grade-Appropriate Feedback**: Vocabulary and complexity matched to student level
- **Extensible Design**: Easy addition of new test families and levels
- **Sample-Driven Development**: Target UI quality shown in samples/sample_output.html