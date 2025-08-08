// Platform-agnostic request/response interfaces
// These work with both Vercel functions and Express.js

export interface PlatformRequest {
  method?: string
  body: any
  query: { [key: string]: string | string[] | undefined }
  headers: { [key: string]: string | string[] | undefined }
  // For file uploads
  files?: { [key: string]: any }
}

export interface PlatformResponse {
  status(code: number): PlatformResponse
  json(data: any): void | Promise<void>
  send(data: string): void | Promise<void>
  setHeader(name: string, value: string): void
}

// Adapter functions to convert between platforms
export function adaptVercelRequest(req: any): PlatformRequest {
  return {
    method: req.method,
    body: req.body,
    query: req.query || {},
    headers: req.headers || {},
  }
}

export function adaptExpressRequest(req: any): PlatformRequest {
  return {
    method: req.method,
    body: req.body,
    query: req.query || {},
    headers: req.headers || {},
    files: req.files,
  }
}

// Response adapter wrapper
export class ResponseAdapter {
  constructor(private res: any, private platform: 'vercel' | 'express') {}

  status(code: number): ResponseAdapter {
    this.res.status(code)
    return this
  }

  json(data: any): void {
    this.res.json(data)
  }

  send(data: string): void {
    this.res.send(data)
  }

  setHeader(name: string, value: string): void {
    this.res.setHeader(name, value)
  }
}

// Enhanced topic detection types for Phase 2
export interface EnhancedTopicResult {
  detectedTopic: string
  promptType: 'describe' | 'explain' | 'persuade' | 'narrative' | 'compare' | 'other'
  iseeCategory: 'narrative' | 'expository' | 'persuasive' | 'creative' | 'analytical'
  confidence: number
  keywords: string[]
  suggestedStructure: string[]
  relatedTopics: string[]
  topicSource: 'extracted' | 'summarized' // Whether topic was found in text or summarized from content
}

export interface EssayStructure {
  hasIntroduction: boolean
  hasBodyParagraphs: boolean
  hasConclusion: boolean
  paragraphCount: number
  estimatedWordCount: number
}

export interface AdvancedTextStatistics {
  normalizedText: string
  paragraphs: number
  sentences: number
  words: number
  characters: number
  charactersNoSpaces: number
  averageWordsPerSentence: number
  averageSentencesPerParagraph: number
  averageCharactersPerWord: number
  longSentences: number
  shortSentences: number
  complexWords: number
  complexityScore: number
}

// Unified Architecture Data Structures

export interface DocumentPage {
  pageNumber: number
  content: string
  confidence: number
  metadata?: {
    originalFilename?: string
    originalIndex?: number // For reordered pages
    processingTime?: number
  }
}

export interface MultiPageDocument {
  pages: DocumentPage[]
  metadata: {
    source: 'text' | 'images' | 'pdf'
    totalPages: number
    processingTime: number
    confidence: number
    aiProcessed: boolean
    // Optional topic metadata when available from upstream processing
    detectedTopic?: string
    topicSource?: 'extracted' | 'summarized'
    enhancedTopic?: EnhancedTopicResult
  }
}

export interface WritingPrompt {
  text: string
  source: 'extracted' | 'summarized' | 'user_provided'
  confidence: number
  iseeCategory?: 'narrative' | 'expository' | 'persuasive' | 'creative' | 'analytical'
  promptType?: 'describe' | 'explain' | 'persuade' | 'narrative' | 'compare' | 'other'
}

export interface StructuredEssay {
  writingPrompt: WritingPrompt
  studentEssay: {
    fullText: string
    structure: EssayStructure
    statistics: AdvancedTextStatistics
    enhancedTopic: EnhancedTopicResult
  }
  metadata: {
    originalDocument: MultiPageDocument
    processingTime: number
    timestamp: string
  }
}

// Unified API Response Structure
export interface UnifiedProcessingResponse {
  success: boolean
  document: MultiPageDocument
  essay: StructuredEssay
  message: string
  timestamp: string
  processingTime: number
}