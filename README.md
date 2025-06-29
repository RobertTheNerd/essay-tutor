# Essay Tutor - AI-Powered ISEE Essay Evaluation

A comprehensive web application for evaluating ISEE (Independent School Entrance Examination) essays using AI technology.

## Features

- **Dual Input Methods**: Support for both text input and multi-page image uploads
- **AI-Powered OCR**: Extract text from handwritten essay images
- **Topic Detection**: Automatically identify essay topics and prompts
- **Real-time Statistics**: Word count, character count, and writing analysis
- **FERPA Compliant**: Secure handling of student data with automatic cleanup

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Vercel Serverless Functions
- **AI**: OpenAI GPT-4 Vision / Azure OpenAI
- **Deployment**: Vercel + GitHub Actions

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
│   │   ├── components/ # React components
│   │   └── App.tsx     # Main application
│   ├── dist/           # Build output
│   └── package.json
├── api/                # Platform-agnostic API functions
│   ├── lib/
│   │   ├── ai-client.ts    # AI integration layer
│   │   ├── handlers.ts     # Shared business logic
│   │   └── types.ts        # Platform abstractions
│   ├── upload-multiple.ts  # Vercel function wrapper
│   ├── process-text.ts     # Vercel function wrapper
│   └── hello.ts           # Health check endpoint
├── server/             # Express.js self-hosted server
│   ├── express-server.ts   # Full-featured API server
│   ├── package.json
│   └── tsconfig.json
├── vercel.json         # Vercel deployment config
└── README.md
```

### Key Directories

- **`/api/lib/`**: Platform-agnostic business logic used by both Vercel and Express
- **`/api/*.ts`**: Thin Vercel function wrappers
- **`/server/`**: Complete Express.js alternative for self-hosting
- **`/frontend/`**: React application with dual input methods

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

### Phase 2: Enhanced Processing (In Progress)
- [x] AI-powered OCR with GPT-4 Vision
- [x] Topic detection and analysis
- [ ] PDF document support
- [ ] Advanced page ordering detection
- [ ] Batch processing optimization
- [ ] Enhanced error handling and retry logic

### Phase 3: ISEE Rubric Integration (Planned)
- [ ] Complete ISEE rubric implementation
- [ ] Detailed scoring across all rubric categories
- [ ] Comprehensive feedback generation
- [ ] Score reporting and analytics
- [ ] Export functionality (PDF, JSON, CSV)
- [ ] Progress tracking over time

### Phase 4: Advanced Features (Planned)
- [ ] User authentication and accounts
- [ ] Essay history and progress tracking
- [ ] Teacher/student dashboard
- [ ] Analytics and insights
- [ ] REST API for integrations
- [ ] Webhook support for notifications

## API Endpoints

**Available on both Vercel and Express servers:**

### POST /api/upload-multiple
**Upload and process essay images**
- Supports: `.jpg`, `.png` (up to 10 files, 10MB each)
- AI OCR text extraction
- Topic detection from combined text
- Page ordering and statistics

### POST /api/process-text
**Process text essay input**
- AI topic detection
- Text statistics (words, characters, sentences, paragraphs)
- Processing time and confidence metrics

### GET /api/hello
**Health check and configuration**
- Server status and platform information
- Timestamp and method verification

### GET /health (Express only)
**Detailed health check**
- Service status and version
- AI configuration status

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