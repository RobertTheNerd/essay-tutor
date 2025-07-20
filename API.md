# Essay Tutor API Documentation

## Overview

The Essay Tutor API provides endpoints for hierarchical essay evaluation across multiple standardized tests and grade levels. All endpoints work identically on both Vercel serverless and self-hosted Express deployments.

## Base URLs

- **Development**: `http://localhost:3001` (Express server)
- **Development Frontend Proxy**: `http://localhost:5174/api` (Vite dev proxy)
- **Production**: Your deployed URL + `/api`

## Authentication

Currently no authentication required. Future versions will support:
- API keys for institutional access
- JWT tokens for user sessions
- OAuth integration for educational platforms

## Current API Endpoints

### GET /api/hello

Health check and configuration validation.

**Parameters:**
- `name` (optional): Name to include in greeting

**Response:**
```json
{
  "message": "Hello World! Essay Tutor API is running.",
  "timestamp": "2025-06-30T12:00:00.000Z",
  "method": "GET",
  "platform": "Self-hosted",
  "version": "2.0.0"
}
```

### POST /api/process

Unified processing endpoint for both text and file inputs.

#### Text Input

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "text": "Essay content to be processed..."
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "writingPrompt": {
      "text": "Detected or summarized prompt",
      "source": "extracted|summarized",
      "confidence": 0.95,
      "iseeCategory": "Creative Expression",
      "promptType": "personal_narrative"
    },
    "studentEssay": {
      "fullText": "Student essay content...",
      "structure": {
        "hasIntroduction": true,
        "hasBodyParagraphs": true,
        "hasConclusion": true,
        "paragraphCount": 4,
        "estimatedWordCount": 287
      },
      "statistics": {
        "normalizedText": "Clean essay text...",
        "paragraphs": 4,
        "sentences": 18,
        "words": 287,
        "characters": 1456,
        "charactersNoSpaces": 1169,
        "averageWordsPerSentence": 15.9,
        "averageSentencesPerParagraph": 4.5,
        "averageCharactersPerWord": 5.1,
        "longSentences": 3,
        "shortSentences": 2,
        "complexWords": 45,
        "complexityScore": 15.7
      },
      "enhancedTopic": {
        "detectedTopic": "My perfect day",
        "confidence": 0.92,
        "topicSource": "extracted",
        "iseeCategory": "Creative Expression",
        "promptType": "personal_narrative"
      }
    },
    "metadata": {
      "processingTime": 1250,
      "timestamp": "2025-06-30T12:00:00.000Z"
    }
  }
}
```

#### File Input

**Content-Type:** `multipart/form-data`

**Request Body:**
- `files`: Multiple image files (JPG/PNG, max 10 files, 10MB each)

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "name": "essay_page1.jpg",
      "type": "image/jpeg",
      "size": 2048576,
      "processed": true,
      "pageNumber": 1
    }
  ],
  "processing": {
    "extractedText": "Combined text from all pages...",
    "detectedTopic": "Essay topic",
    "wordCount": 287,
    "characterCount": 1456,
    "processingTime": 2150,
    "confidence": 0.88,
    "totalPages": 2,
    "pageOrder": [1, 2],
    "aiProcessed": true
  },
  "result": {
    // Same structure as text input response
  }
}
```

### GET /health (Express only)

Detailed health check for self-hosted deployments.

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "platform": "Express",
  "ai": {
    "provider": "Azure OpenAI",
    "configured": true,
    "model": "gpt-4o-mini"
  },
  "timestamp": "2025-06-30T12:00:00.000Z"
}
```

## Future API Endpoints (Phase 3+)

### POST /api/evaluate

Full essay evaluation with rubric selection.

**Request Body:**
```json
{
  "text": "Essay content..." OR "fileIds": ["uploaded-file-id"],
  "rubric": {
    "family": "isee",
    "level": "upper"
  }
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "rubric": {
      "family": "isee",
      "level": "upper",
      "name": "ISEE Upper Level"
    },
    "scores": {
      "grammar": 4,
      "vocabulary": 4,
      "structure": 5,
      "development": 4,
      "clarity": 4,
      "overall": 4.2
    },
    "annotations": [
      {
        "type": "grammar",
        "startIndex": 45,
        "endIndex": 52,
        "category": "punctuation",
        "severity": "minor",
        "suggestion": "Add comma before coordinating conjunction",
        "originalText": "I went to the store and bought milk",
        "suggestedText": "I went to the store, and bought milk"
      }
    ],
    "feedback": {
      "strengths": [
        "Clear thesis statement",
        "Good use of examples"
      ],
      "improvements": [
        "Vary sentence structure",
        "Expand conclusion"
      ],
      "nextSteps": "Focus on adding transitional phrases between paragraphs"
    }
  }
}
```

### GET /api/rubrics

Available rubric configurations.

**Response:**
```json
{
  "families": [
    {
      "id": "isee",
      "name": "Independent School Entrance Examination",
      "description": "Standardized test for private school admissions",
      "levels": [
        {
          "id": "elementary",
          "name": "Elementary Level",
          "gradeRange": "Grades 2-4",
          "description": "Basic writing skills assessment"
        },
        {
          "id": "middle",
          "name": "Middle Level", 
          "gradeRange": "Grades 5-6",
          "description": "Intermediate writing skills assessment"
        },
        {
          "id": "upper",
          "name": "Upper Level",
          "gradeRange": "Grades 7-8", 
          "description": "Advanced writing skills assessment"
        },
        {
          "id": "high_school",
          "name": "High School Level",
          "gradeRange": "Grades 9-12",
          "description": "College-preparatory writing assessment"
        }
      ]
    }
  ]
}
```

### POST /api/generate-report

Professional HTML report generation.

**Request Body:**
```json
{
  "evaluationId": "eval-123",
  "format": "html",
  "options": {
    "includeAnnotations": true,
    "printOptimized": true,
    "studentInfo": {
      "name": "Student Name",
      "grade": "7th Grade",
      "date": "2025-06-30"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "html": "<html>Professional report HTML...</html>",
    "downloadUrl": "/api/reports/download/report-123.html",
    "expiresAt": "2025-07-01T12:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return consistent error formats:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE",
  "timestamp": "2025-06-30T12:00:00.000Z"
}
```

### Common Error Codes

- `MISSING_API_KEY`: AI service not configured
- `INVALID_INPUT`: Request validation failed
- `PROCESSING_ERROR`: AI processing failed
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `UNSUPPORTED_FORMAT`: File format not supported
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limits

- **Development**: No limits
- **Production**: 100 requests per minute per IP
- **Institutional**: Custom limits based on agreement

## Platform Compatibility

All endpoints work identically across deployment platforms:

- ✅ **Vercel Serverless Functions**
- ✅ **Self-hosted Express Server**
- ✅ **Docker Containers**
- ✅ **Local Development**

## Environment Configuration

Required environment variables:

```bash
# OpenAI Configuration (choose one)
OPENAI_API_KEY=your_openai_key

# OR Azure OpenAI Configuration
OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_VISION_MODEL=gpt-4o-mini
AZURE_OPENAI_TEXT_MODEL=gpt-4o-mini
```

## SDK and Integration Examples

### JavaScript/TypeScript

```typescript
// Basic processing
const response = await fetch('/api/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Essay content...' })
});

const result = await response.json();

// File upload
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

const response = await fetch('/api/process', {
  method: 'POST',
  body: formData
});
```

### cURL Examples

```bash
# Text processing
curl -X POST http://localhost:3001/api/process \
  -H "Content-Type: application/json" \
  -d '{"text":"Sample essay content for processing."}'

# File upload
curl -X POST http://localhost:3001/api/process \
  -F "files=@essay_page1.jpg" \
  -F "files=@essay_page2.jpg"

# Health check
curl http://localhost:3001/api/hello?name=TestUser
```

## Changelog

### Version 2.0.0 (Phase 2.5 - Current)
- ✅ Unified `/api/process` endpoint
- ✅ CommonJS compatibility for Vercel
- ✅ Enhanced topic detection with source attribution
- ✅ Advanced text statistics and structure analysis

### Version 3.0.0 (Phase 3 - Planned)
- 🔄 Hierarchical evaluation engine
- 🔄 ISEE level support (Elementary/Middle/Upper/High School)
- 🔄 Professional annotation system
- 🔄 `/api/evaluate` and `/api/rubrics` endpoints

### Version 4.0.0 (Phase 4 - Planned)
- 📋 Advanced annotation UI
- 📋 Professional report generation
- 📋 `/api/generate-report` endpoint
- 📋 Print-optimized HTML reports