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
  - Response includes `essay.writingPrompt.source` for intelligent routing:
    - `'extracted'` - High confidence prompt found in text → Auto-evaluate
    - `'summarized'` - Prompt inferred from content → Manual review required
- `POST /api/evaluate` - Full essay evaluation with rubric selection (Phase 3+)
  - Input: `{text: string, prompt?: string, rubric?: {family: string, level: string}}`
  - Output: Complete evaluation with scores, annotations, and feedback
  - Features: AI-powered ISEE evaluation with context-aware scoring

**Future Endpoints:**
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

### Three-Stage Image Processing Flow
1. **Stage 1: Upload Staging**
   - Multiple image selection with drag-and-drop interface
   - Client-side file validation and preview generation
   - No backend API calls during upload staging
   - User can review, reorder, or remove images before processing

2. **Stage 2: Batch Processing**
   - Single `/api/process` call handles all uploaded images
   - AI-powered OCR extraction with automatic page ordering
   - Text analysis, topic detection, and prompt extraction
   - Returns structured essay data with confidence indicators

3. **Stage 3: Smart Routing**
   - **High Confidence Path**: `writingPrompt.source === 'extracted'`
     - Automatically proceed to `/api/evaluate`
     - Skip manual review for clear prompt extractions
   - **Low Confidence Path**: `writingPrompt.source === 'summarized'`
     - Display ProcessingReview component
     - Allow manual editing of prompt and essay text
     - User confirms before proceeding to evaluation

### Frontend Architecture
- **Enhanced Input Methods**: 
  - Text: Separate prompt and essay fields for better context
  - Image: Three-stage processing with intelligent routing
- **Intelligent UX Flow**: Auto-evaluate vs manual review based on AI confidence
- **ProcessingReview Component**: Manual editing interface for extracted content
  - Editable writing prompt and essay text fields
  - Visual confidence indicators (extracted vs summarized)
  - Validation and error handling for OCR corrections
  - Seamless transition to evaluation workflow
- **Smart Routing Logic**: 
  - `topicSource === 'extracted'` → Auto-evaluate immediately
  - `topicSource === 'summarized'` → Show ProcessingReview for manual editing
- **Real-time Statistics**: Word/character count and validation
- **React Query**: API state management for seamless evaluation
- **Responsive Design**: TailwindCSS with mobile-friendly interface
- **Typography**: Space Mono font optimized for essay display

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

## 🚨 Test File Organization Policy

**CRITICAL: ALL TEST FILES MUST BE CREATED IN THE `frontend/tests/` DIRECTORY STRUCTURE**

- **NEVER** create test files in the frontend root directory
- **ALWAYS** place test files in appropriate subdirectories:
  - API tests → `frontend/tests/api/`
  - Puppeteer E2E tests → `frontend/tests/puppeteer/`
  - Screenshots → `frontend/tests/screenshots/`
- **ALWAYS** update `frontend/tests/README.md` when adding new test files
- **ALWAYS** use provided npm scripts for running tests

This policy ensures a clean, maintainable codebase and prevents cluttering the frontend root directory.

## Current Development Phase

**Phase 1 (Complete)**: Core functionality with dual input methods and AI integration
**Phase 2 (Complete)**: Enhanced document processing with batch AI analysis
**Phase 2.5 (Complete)**: Unified processing architecture refactor
**Phase 3 (Complete)**: Real AI-powered ISEE evaluation system with full backend integration
**Phase 4 (Complete)**: Complete frontend evaluation interface with professional UI
**Phase 5 (Complete)**: Enhanced UX flow with intelligent image processing and manual review capabilities
**Phase 6 (Current)**: Professional report generation matching sample_output.html design

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

## Phase 5 Achievements (Recently Completed)

### Enhanced UX Flow with Intelligent Image Processing
- **Improved Text Input**: Separate writing prompt and essay text fields implemented
- **Three-Stage Image Processing**: Upload staging → Process batch → Smart routing based on AI confidence
- **Intelligent Prompt Detection**: Distinguishes between extracted prompts vs inferred/summarized prompts
- **Manual Review Interface**: ProcessingReview component for editing extracted text and prompts
- **Unified Evaluation Flow**: Both text and image routes converge to same evaluation endpoint

### Smart Image Processing Features
- **Confidence-Based Routing**: 
  - High confidence (extracted prompt) → Auto-evaluate immediately
  - Low confidence (summarized prompt) → Manual review with editable fields
- **ProcessingReview Component**: Full editing interface for both writing prompt and essay text
- **Batch Processing**: Single API call processes multiple images with automatic page ordering
- **Visual Feedback**: Clear status indicators showing extraction confidence and next steps

### Professional Report Features
- **ProfessionalReport React Component**: Embedded professional styling with gradient headers
- **View Toggle Integration**: Seamless switching between Detailed View and Professional Report
- **Print Optimization**: Professional CSS with forced color printing and HTML download
- **Responsive Design**: TailwindCSS integration with mobile-friendly interface
- **Error Handling**: Fixed AI client null check with proper fallback evaluation

### Technical Integration
- **Frontend Integration**: Complete integration with existing EvaluationResults workflow
- **Shared Module Architecture**: Foundation for future PDF service integration
- **Professional Styling**: Typography hierarchy with Inter, Source Serif Pro, and Space Mono fonts
- **Enhanced Server**: Updated startup messages and improved debugging capabilities

## Phase 6: Advanced Professional Reports (Current)

### Goals
- **Color-Coded Text Annotations**: Implement sophisticated text highlighting with embedded markers (✓1, S1, W1, etc.)
- **Annotation Block System**: Detailed annotation blocks with rich explanations and two-column layout
- **Target Design Matching**: Exactly match the sophisticated design shown in samples/screenshot.html.png
- **Mock Annotation System**: Generate demonstration-quality annotations for any evaluation data

### Target Design Analysis
Based on comparison with samples/screenshot.html.png and sample_output.html, the current basic report needs:

#### Missing Features:
1. **Color-Coded Text Annotations**: Rich annotated text with category-specific highlighting
2. **Annotation Markers**: Embedded markers like ✓1, S1, W1, D1, C1 within highlighted text
3. **Annotation Block System**: Detailed explanation blocks with "Advanced technique," "Shows maturity" labels
4. **Two-Column Layout**: Professional annotation blocks in grid format
5. **Sophisticated Styling**: Exact CSS matching target design with gradients and professional typography

#### Implementation Plan:
1. **Text Annotation Engine**: Process essay text to insert color-coded highlights and markers
2. **Annotation Block Generator**: Create detailed explanation blocks with category-specific styling
3. **Mock Data System**: Generate demonstration-quality annotations for any evaluation data
4. **Enhanced Styling**: Update CSS to exactly match sample_output.html design
5. **Text Block Layout**: Implement paragraph separation with annotation sections

### Technical Architecture:
- **Annotation Processor**: Platform-agnostic text highlighting with marker generation
- **Mock Annotation Data**: Rich demonstration annotations when real data unavailable
- **Category-Specific Styling**: grammar-block, word-block, structure-block, etc.
- **Professional Layout**: Text blocks with gradient backgrounds and annotation sections

### Professional Report Architecture
```
Report Generation
├── Text Annotation Engine
│   ├── Color-coded highlighting (6 categories)
│   ├── Marker generation (✓1, S1, W1, D1, C1)
│   ├── Position-based text highlighting
│   └── Category-specific styling
├── Annotation Block System
│   ├── Detailed explanation blocks
│   ├── Two-column grid layout
│   ├── Rich labels and formatting
│   └── Original text → Suggested improvement
├── Mock Data Generation
│   ├── Demonstration-quality annotations
│   ├── Category-specific examples
│   ├── Realistic feedback blocks
│   └── Professional presentation
└── Enhanced Styling
    ├── Exact CSS matching target design
    ├── Text block containers
    ├── Gradient backgrounds
    └── Professional typography
```

## Phase 7: Multi-Level ISEE Support (Next)

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
- **Context-Aware Evaluation**: Improved AI scoring with prompt context
- **Seamless Integration**: Unified workflow regardless of input method

### User Experience Improvements
- **Real-time Statistics**: Word/character count and validation feedback
- **Better Input Validation**: Clear guidance for both text and image inputs
- **Enhanced Processing Flow**: Smart routing based on AI processing results
- **Consistent Results**: Same evaluation quality across all input methods

## Phase 6: Professional Report Generation (Current)

### Goals
- **Shared Report Module**: Platform-agnostic rendering for consistent output
- **Professional Frontend Reports**: Match sample_output.html design quality and sophistication
- **Advanced Styling**: Gradient headers, custom fonts, color-coded annotations
- **Print Optimization**: Perfect browser print-to-PDF functionality
- **Future-Ready Architecture**: Prepare for separate PDF service integration

### Target Implementation
```
Shared Report Architecture
├── /shared/report-renderer.ts
│   ├── Platform-agnostic rendering logic
│   ├── Professional styling system
│   ├── Color-coded annotation processing
│   └── Print optimization
├── Frontend Integration
│   ├── ProfessionalReport component
│   ├── Interactive report display
│   ├── Browser print optimization
│   └── Export preparation
└── Future: PDF Service
    ├── Separate microservice (Railway/Render)
    ├── Puppeteer/chrome-aws-lambda
    └── Professional PDF downloads
```

### Implementation Focus
- **Design Quality**: Match professional standard shown in sample_output.html
- **Shared Logic**: Single source of truth for report rendering
- **User Experience**: Instant report display with professional print capability
- **Scalable Architecture**: Easy integration of future PDF service

### Phase 7: Multi-Level ISEE Support (Next)

### Goals
- **Generic Rubric Framework**: Test families → levels → specific rubrics architecture
- **ISEE Level Support**: All four levels (Elementary, Middle, Upper, High School)
- **Level-Adaptive Evaluation**: Age-appropriate criteria and feedback complexity
- **Institutional Features**: Multi-tenant support and classroom management

### Target Architecture
```
Multi-Level System
├── ISEE (Test Family)
│   ├── Elementary Level (Grades 2-4)
│   ├── Middle Level (Grades 5-6)
│   ├── Upper Level (Grades 7-8) - Current
│   └── High School Level (Grades 9-12)
├── Institutional Features
│   ├── User Authentication
│   ├── Teacher Dashboard
│   └── Student Progress Tracking
└── Future: SAT, AP, Custom rubrics
```