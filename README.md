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

1. Start the development server:
```bash
cd frontend
npm run dev
```

2. For API testing, start the development API server:
```bash
cd frontend
npm run dev:api
```

The application will be available at `http://localhost:5174`.

### Deployment

The application is configured for automatic deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## AI Provider Configuration

The application supports multiple AI providers through a flexible abstraction layer:

### OpenAI (Standard)
- Uses `gpt-4o-mini` for text analysis
- Uses `gpt-4o-mini` for vision/OCR tasks

### Azure OpenAI
- Configurable deployment names and models
- Support for custom API versions
- Enterprise-grade security and compliance

### Future Support
The AI client is designed to easily support additional providers like:
- Google Gemini
- Anthropic Claude
- Custom AI models

## Project Structure

```
essay-tutor/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   └── App.tsx     # Main application
│   ├── dist/           # Build output
│   └── package.json
├── api/                # Vercel serverless functions
│   ├── lib/            # Shared AI client
│   ├── upload-multiple.ts
│   └── process-text.ts
├── vercel.json         # Deployment configuration
└── README.md
```

## Development Phases

### Phase 1: Foundation & Core Infrastructure ✅
- [x] React/TypeScript setup
- [x] AI integration (OpenAI/Azure)
- [x] File upload system
- [x] Basic text processing
- [x] Dual input methods

### Phase 2: Enhanced Processing (Planned)
- [ ] PDF support
- [ ] Advanced OCR
- [ ] Page ordering detection
- [ ] Batch processing

### Phase 3: ISEE Rubric Integration (Planned)
- [ ] Comprehensive rubric evaluation
- [ ] Detailed feedback generation
- [ ] Score reporting
- [ ] Export functionality

### Phase 4: Advanced Features (Planned)
- [ ] User authentication
- [ ] Progress tracking
- [ ] Analytics dashboard
- [ ] API for integrations

## API Endpoints

### POST /api/upload-multiple
Upload multiple image files for OCR processing.

### POST /api/process-text
Process text input for topic detection and analysis.

### GET /api/hello
Health check endpoint.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub.