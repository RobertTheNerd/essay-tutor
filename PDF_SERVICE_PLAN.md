# PDF Service Architecture Plan

## Overview

This document outlines the architecture and implementation plan for a separate PDF generation service that will integrate with the Essay Tutor platform to provide professional downloadable reports.

## Architecture Decision

### Why Separate PDF Service?

1. **Vercel Limitations**: Puppeteer exceeds Vercel's 50MB function size limit
2. **Performance**: Dedicated service optimized for PDF generation
3. **Scalability**: Independent scaling based on PDF generation demand
4. **Reliability**: Isolated PDF failures don't affect main application
5. **Cost Optimization**: Pay only for PDF generation resources when used

### Service Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Main App       │    │  PDF Service    │
│   (React)       │───▶│   (Vercel)       │───▶│   (Railway/     │
│                 │    │                  │    │    Render)      │
│                 │    │   /api/evaluate  │    │                 │
│                 │    │   /api/images-to-essay   │    │   /generate-pdf │
│                 │    │   /api/pdf-proxy │───▶│   /health       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Technology Stack

### PDF Generation Engine
- **Primary**: Puppeteer with chrome-aws-lambda
- **Alternative**: Playwright (if performance issues)
- **Fallback**: wkhtmltopdf (lightweight backup)

### Deployment Platform Options

#### Option 1: Railway (Recommended)
- ✅ **Docker support**: Easy Puppeteer deployment
- ✅ **Auto-scaling**: Based on CPU/memory usage
- ✅ **Simple deployment**: Git-based deployments
- ✅ **Cost-effective**: ~$5-10/month for typical usage
- ✅ **Fast cold starts**: Better than other serverless options

#### Option 2: Render.com
- ✅ **Docker support**: Full Puppeteer compatibility
- ✅ **Reliable**: Good uptime and performance
- ✅ **Simple pricing**: Predictable costs
- ❌ **Slower deployment**: Longer build times

#### Option 3: DigitalOcean App Platform
- ✅ **Docker support**: Full compatibility
- ✅ **Predictable pricing**: Fixed monthly costs
- ❌ **Less flexible**: Limited auto-scaling

## Service Implementation

### Core Service Structure
```
pdf-service/
├── src/
│   ├── server.ts              # Express server
│   ├── pdf-generator.ts       # Puppeteer implementation
│   ├── report-processor.ts    # Report HTML processing
│   └── utils/
│       ├── cache.ts           # PDF caching (Redis)
│       └── validation.ts      # Input validation
├── Dockerfile                 # Container configuration
├── package.json              # Dependencies
└── README.md                 # Service documentation
```

### API Endpoints

#### `POST /generate-pdf`
Generate PDF from HTML content
```typescript
interface GeneratePDFRequest {
  html: string
  css: string
  metadata: {
    title: string
    filename: string
    studentName?: string
  }
  options?: {
    format: 'A4' | 'Letter'
    margin: string
    orientation: 'portrait' | 'landscape'
  }
}

interface GeneratePDFResponse {
  success: boolean
  pdfData?: Buffer
  downloadUrl?: string
  error?: string
  processingTime: number
}
```

#### `POST /generate-from-evaluation`
Generate PDF directly from evaluation data
```typescript
interface GenerateFromEvaluationRequest {
  evaluationData: EvaluationResult
  essayText: string
  prompt?: string
  studentInfo?: StudentInfo
  options?: PDFOptions
}
```

#### `GET /health`
Health check endpoint
```typescript
interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  puppeteer: {
    available: boolean
    version: string
  }
}
```

### Implementation Details

#### PDF Generator Class
```typescript
export class ProfessionalPDFGenerator {
  private browser: Browser | null = null
  
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
      headless: true
    })
  }
  
  async generatePDF(html: string, options: PDFOptions): Promise<Buffer> {
    if (!this.browser) await this.initialize()
    
    const page = await this.browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: options.format || 'A4',
      margin: {
        top: '0.75in',
        right: '0.75in', 
        bottom: '0.75in',
        left: '0.75in'
      },
      printBackground: true,
      preferCSSPageSize: true
    })
    
    await page.close()
    return pdf
  }
  
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}
```

#### Docker Configuration
```dockerfile
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Set Puppeteer to use installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

EXPOSE 3000

CMD ["npm", "start"]
```

## Integration with Main Application

### API Proxy in Main App
```typescript
// server/lib/pdf-proxy.ts
export async function handlePDFProxy(
  req: PlatformRequest,
  res: PlatformResponse
): Promise<void> {
  try {
    const pdfServiceResponse = await fetch(`${process.env.PDF_SERVICE_URL}/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PDF_SERVICE_API_KEY}`
      },
      body: JSON.stringify(req.body)
    })
    
    if (pdfServiceResponse.ok) {
      const pdf = await pdfServiceResponse.arrayBuffer()
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"')
      res.send(Buffer.from(pdf))
    } else {
      throw new Error('PDF service failed')
    }
  } catch (error) {
    console.error('PDF proxy error:', error)
    res.status(500).json({ error: 'PDF generation failed' })
  }
}
```

### Frontend Integration
```typescript
// Frontend PDF download
const handleDownloadPDF = async () => {
  try {
    const response = await fetch('/api/pdf-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: reportHtml,
        css: reportCss,
        metadata: { title: 'ISEE Essay Report', filename: 'essay-report' }
      })
    })
    
    if (response.ok) {
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'essay-report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('PDF download failed:', error)
  }
}
```

## Performance Optimization

### Caching Strategy
- **Report Caching**: Cache generated PDFs for 24 hours
- **Template Caching**: Cache common report templates
- **Browser Reuse**: Keep browser instance alive for multiple requests

### Scaling Considerations
- **Horizontal Scaling**: Multiple PDF service instances
- **Load Balancing**: Distribute requests across instances
- **Queue System**: Redis-based queue for high-volume periods

## Security & Compliance

### Security Measures
- **API Authentication**: Secure communication between services
- **Input Validation**: Sanitize all HTML/CSS inputs
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Content Security**: Validate report content before processing

### FERPA Compliance
- **No Data Persistence**: PDFs generated and immediately returned
- **Secure Transmission**: HTTPS for all communications
- **Access Logging**: Audit trail for PDF generation requests
- **Data Cleanup**: Ensure no temporary files remain

## Cost Estimation

### Railway Deployment
- **Base Service**: $5/month (512MB RAM, 1 vCPU)
- **Scaling**: Additional $5/month per 500MB RAM
- **Bandwidth**: $0.10/GB (outbound)

### Typical Usage Costs
- **100 PDFs/month**: ~$5-7/month
- **500 PDFs/month**: ~$8-12/month  
- **1000+ PDFs/month**: ~$15-25/month

## Implementation Timeline

### Phase 1: Basic Service (Week 1)
- [ ] Create PDF service repository
- [ ] Implement basic Puppeteer PDF generation
- [ ] Create Docker configuration
- [ ] Deploy to Railway

### Phase 2: Integration (Week 2)
- [ ] Add API proxy to main application
- [ ] Implement frontend PDF download
- [ ] Add error handling and fallbacks
- [ ] Test end-to-end workflow

### Phase 3: Optimization (Week 3)
- [ ] Add caching for improved performance
- [ ] Implement proper scaling configuration
- [ ] Add monitoring and logging
- [ ] Security hardening and API authentication

### Phase 4: Production Ready (Week 4)
- [ ] Load testing and performance optimization
- [ ] Documentation and operational procedures
- [ ] Backup and disaster recovery procedures
- [ ] FERPA compliance verification

## Future Enhancements

### Advanced Features
- **Batch Processing**: Generate multiple reports simultaneously
- **Custom Templates**: Support for different report layouts
- **Watermarking**: Add institutional branding to reports
- **Analytics**: Track PDF generation usage and performance

### Alternative Approaches
- **Serverless PDF**: Investigate serverless PDF options as they mature
- **Client-Side PDF**: Consider WebAssembly-based PDF generation
- **Hybrid Approach**: Combine browser print with server PDF for different use cases

---

**Document Version**: 1.0  
**Last Updated**: 2025-07-18  
**Status**: Future Implementation (Phase 8)  
**Dependencies**: Shared report module (Phase 6)