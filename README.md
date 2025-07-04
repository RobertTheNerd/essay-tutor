# Essay Tutor - Hierarchical AI-Powered Essay Evaluation Platform

A comprehensive web application for evaluating essays across multiple standardized tests and grade levels, with initial focus on ISEE (Independent School Entrance Examination) using advanced AI technology.

## Features

### Core Evaluation System
- **Hierarchical Rubric Support**: Test families → levels → specific rubrics (ISEE Elementary/Middle/Upper/High School)
- **Level-Adaptive Analysis**: Age-appropriate evaluation criteria and feedback complexity
- **Professional Annotation System**: Color-coded feedback with inline highlights and detailed suggestions
- **Comprehensive Scoring**: Multi-category evaluation with detailed breakdown and improvement recommendations

### Input and Processing
- **Dual Input Methods**: Support for both text input and multi-page image uploads
- **Advanced AI-Powered OCR**: Extract text from handwritten essay images with page ordering detection
- **Smart Topic Detection**: Automatically identify essay topics and distinguish prompts from student content
- **Real-time Statistics**: Advanced text analysis with complexity metrics and structure detection
- **FERPA Compliant**: Secure handling of student data with automatic cleanup

### Professional Reports
- **Print-Optimized Reports**: Professional HTML reports with forced color printing support
- **Grade-Appropriate Feedback**: Vocabulary and suggestions matched to student level
- **Detailed Analytics**: Comprehensive evaluation across all rubric categories with specific improvement guidance

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + React Query
- **Backend**: Unified Express.js + Vercel Serverless Functions (CommonJS)
- **Evaluation Engine**: Hierarchical rubric system with level-adaptive scoring
- **AI**: OpenAI GPT-4 Vision / Azure OpenAI for text analysis and OCR
- **Deployment**: Vercel + Self-hosted Docker + GitHub Actions

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key or Azure OpenAI access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/RobertTheNerd/essay-tutor.git
cd essay-tutor
```

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your AI configuration:

**For Standard OpenAI:**
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**For Azure OpenAI:**
```env
OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_VISION_MODEL=gpt-4o-mini
AZURE_OPENAI_TEXT_MODEL=gpt-4o-mini
```

### Development

#### Quick Start
```bash
# 1. Install dependencies
cd frontend && npm install
cd ../server && npm install

# 2. Configure environment (copy your Azure OpenAI settings)
cp ../.env.local frontend/.env.local

# 3. Start development with full AI functionality
cd frontend
npm run dev
```

#### Development Modes

**Full Development (Recommended):**
```bash
cd frontend
npm run dev  # Starts both frontend (5174) and API server (3001)
```

**Frontend Only:**
```bash
cd frontend
npm run dev:frontend  # Frontend only on port 5174
```

**API Server Only:**
```bash
cd server
npm run dev  # Express server with real AI processing on port 3001
```

#### What You Get
- **Real AI Processing**: Test actual OpenAI/Azure OpenAI integration locally
- **File Uploads**: Upload and process essay images with OCR
- **Topic Detection**: AI-powered essay topic identification
- **No Mocks**: Same functionality as production

### Deployment Options

#### 1. Vercel (Serverless)

**Automatic (Recommended):**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Manual:**
```bash
vercel --prod
```

#### 2. Self-Hosted with Docker

```bash
# Quick deployment
docker-compose up -d

# Or build manually
docker build -t essay-tutor .
docker run -p 3001:3001 --env-file .env essay-tutor
```

#### 3. Self-Hosted with Node.js

```bash
# Build and start
cd frontend && npm run build
cd ../server && npm run build && npm start
```

## Architecture

### Unified API Implementation
The application uses a **platform-agnostic architecture**:

- **Shared Business Logic**: Core API handlers work on both Vercel and Express
- **Platform Adapters**: Abstract away differences between Vercel and Express
- **No Vendor Lock-in**: Same codebase runs anywhere
- **Real Development**: Full AI functionality during local development

### AI Provider Support

**Current Support:**
- **OpenAI**: Standard GPT models for text and vision
- **Azure OpenAI**: Enterprise deployments with custom models
- **Automatic Detection**: Configures based on environment variables

**Supported Models:**
- `gpt-4o-mini` for text analysis and OCR
- `gpt-4-turbo` for advanced processing
- Custom Azure deployments (your choice)

**Future Providers:**
- Google Gemini (planned)
- Anthropic Claude (planned)
- Custom AI endpoints

## Project Structure

```
essay-tutor/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── evaluation/ # Evaluation system components
│   │   │   ├── FileUpload.tsx
│   │   │   └── TextEditor.tsx
│   │   └── App.tsx         # Main application
│   ├── dist/               # Build output
│   └── package.json
├── server/             # Unified backend (Express + Vercel compatible)
│   ├── lib/                # Shared business logic
│   │   ├── ai-client.ts         # AI integration layer
│   │   ├── document-processor.ts # Document processing pipeline
│   │   ├── unified-handlers.ts   # API endpoint handlers
│   │   ├── app-factory.ts       # Express app factory
│   │   ├── evaluation/          # Hierarchical evaluation engine
│   │   │   ├── rubric-system.ts     # Rubric definitions
│   │   │   ├── evaluation-engine.ts # Level-aware evaluation
│   │   │   ├── annotation-generator.ts # Annotation system
│   │   │   └── rubrics/
│   │   │       └── isee/            # ISEE level configurations
│   │   │           ├── elementary.ts
│   │   │           ├── middle.ts
│   │   │           ├── upper.ts
│   │   │           └── high-school.ts
│   │   └── types.ts             # Platform abstractions
│   ├── express-server.ts        # Self-hosted Express server
│   ├── package.json (CommonJS)
│   └── tsconfig.json
├── api/                # Vercel serverless function wrappers
│   └── index.ts            # Main Vercel handler
├── samples/            # Sample outputs and test data
│   ├── sample_output.html  # Target UI design
│   └── sample_data/        # Test essays and images
├── vercel.json         # Vercel deployment config
└── README.md
```

### Key Directories

- **`/server/lib/`**: Unified business logic for all platforms (CommonJS)
- **`/server/lib/evaluation/`**: Hierarchical evaluation engine with ISEE rubrics
- **`/api/`**: Thin Vercel serverless function wrapper
- **`/server/`**: Complete Express.js server for self-hosting
- **`/frontend/src/components/evaluation/`**: Evaluation UI components
- **`/samples/`**: Target designs and test data for development

## Platform Migration

### Easy Migration Between Platforms

The unified architecture enables seamless platform switching:

**Development → Production:**
- Same codebase and API endpoints
- Environment variables work across platforms
- No code changes needed

**Vercel ↔ Self-Hosted:**
```bash
# To self-hosted
git clone [repo]
cd server && npm install && npm start

# To Vercel
git push  # Automatic deployment
```

**Benefits:**
- ✅ **Zero vendor lock-in**
- ✅ **Consistent behavior** across environments
- ✅ **Easy A/B testing** of deployment platforms
- ✅ **Cost optimization** - switch based on usage
- ✅ **Risk mitigation** - multiple deployment options

### Configuration Compatibility

All platforms use the same environment variables:
```bash
# Works everywhere
OPENAI_API_KEY=your_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment
```

## Development Phases

### Phase 1: Foundation & Core Infrastructure ✅
- [x] React/TypeScript setup with Vite
- [x] AI integration (OpenAI/Azure OpenAI)
- [x] Platform-agnostic API architecture
- [x] File upload system with multi-page support
- [x] Real-time text processing and statistics
- [x] Dual input methods (text editor + image upload)
- [x] Express.js development server
- [x] Vercel serverless deployment
- [x] Docker containerization support

### Phase 2: Enhanced Document Processing ✅
- [x] AI-powered OCR with GPT-4 Vision
- [x] Topic detection and analysis with source attribution
- [x] Advanced page ordering detection using AI
- [x] Batch processing optimization (single AI request for multiple pages)
- [x] Enhanced error handling and retry logic
- [x] Comprehensive text statistics and structure analysis

### Phase 2.5: Unified Architecture Refactor ✅
- [x] Unified processing pipeline (MultiPageDocument → StructuredEssay)
- [x] CommonJS conversion for Vercel compatibility
- [x] Zero code duplication between platforms
- [x] Clean separation of prompts vs. student content
- [x] Foundation for hierarchical evaluation system

### Phase 3: Hierarchical Evaluation Engine (In Progress)
- [ ] Generic rubric framework with test family hierarchy
- [ ] ISEE level implementations (Elementary/Middle/Upper/High School)
- [ ] Level-adaptive evaluation criteria and feedback complexity
- [ ] Professional annotation system with color-coded highlights
- [ ] Comprehensive scoring across all rubric categories
- [ ] Grade-appropriate feedback generation and vocabulary

### Phase 4: Advanced Annotation UI (Planned)
- [ ] Dynamic annotation display adapting to rubric configuration
- [ ] Print-optimized professional HTML reports
- [ ] Level-specific report templates and styling
- [ ] Export functionality (PDF, HTML, JSON)
- [ ] Mobile-responsive annotation interface

### Phase 5: Platform Expansion (Planned)
- [ ] Additional test family support (SAT, AP, custom rubrics)
- [ ] User authentication and multi-tenant support
- [ ] Progress tracking and analytics dashboard
- [ ] REST API for institutional integrations
- [ ] Advanced administrative features

## API Endpoints

**Available on both Vercel and Express servers:**

### POST /api/process
**Unified processing endpoint for text and files**
- **Text Input**: JSON with `text` field for direct essay processing
- **File Input**: FormData with `files` for multi-page image upload
- **Features**:
  - AI OCR text extraction with page ordering detection
  - Enhanced topic detection with source attribution (extracted vs. summarized)
  - Comprehensive text statistics and structure analysis
  - ISEE categorization with confidence scoring
  - Processing time and performance metrics

### GET /api/hello
**Health check and configuration**
- Server status and platform information (Vercel vs. Self-hosted)
- AI configuration validation
- Version and timestamp information

### GET /health (Express only)
**Detailed health check for self-hosted deployments**
- Service status and detailed version information
- AI provider configuration status
- Environment validation

**Future API Endpoints (Phase 3+):**
- `POST /api/evaluate` - Full essay evaluation with rubric selection
- `GET /api/rubrics` - Available rubric configurations
- `POST /api/generate-report` - Professional report generation

## Testing

### Development Testing
```bash
# Test with real AI processing
cd frontend && npm run dev
# Upload images or enter text to test full functionality
```

### API Testing
```bash
# Health check
curl http://localhost:3001/api/hello

# Text processing
curl -X POST http://localhost:3001/api/process-text \
  -H "Content-Type: application/json" \
  -d '{"text":"Sample essay text for testing topic detection and statistics."}'
```

### Production Testing
- **Vercel**: Automatic deployment testing on every push
- **Self-hosted**: Use same API endpoints with your domain

## Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Test** with both Vercel and Express servers
4. **Commit** your changes (`git commit -m 'Add amazing feature'`)
5. **Push** to the branch (`git push origin feature/amazing-feature`)
6. **Submit** a pull request

### Development Guidelines
- Use the shared handlers in `/api/lib/` for business logic
- Test on both platforms (Express dev server + Vercel)
- Follow TypeScript strict mode
- Maintain platform abstraction

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/RobertTheNerd/essay-tutor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RobertTheNerd/essay-tutor/discussions)
- **Documentation**: This README and inline code comments

For enterprise support or custom implementations, please open an issue with your requirements.