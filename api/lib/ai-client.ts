import OpenAI from 'openai'

// Initialize OpenAI client with Azure configuration if available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}` : undefined,
  defaultQuery: process.env.AZURE_OPENAI_ENDPOINT ? { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' } : undefined,
  defaultHeaders: process.env.AZURE_OPENAI_ENDPOINT ? {
    'api-key': process.env.OPENAI_API_KEY,
  } : undefined,
}) : null

export interface DocumentProcessingResult {
  extractedText: string
  detectedTopic?: string
  confidence: number
  processingTime: number
  aiProcessed: boolean
  metadata: {
    fileType: string
    wordCount: number
    characterCount: number
  }
}

export interface EssayAnalysisResult {
  rubricScores: {
    grammarMechanics: number
    wordChoiceVocabulary: number
    structureOrganization: number
    developmentSupport: number
    clarityFocus: number
  }
  overallScore: number
  feedback: string[]
  strengths: string[]
  areasForImprovement: string[]
}

export class AIClient {
  /**
   * Extract text from various document formats using GPT-4 Vision
   */
  async extractTextFromDocument(
    fileBuffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now()

    try {
      let extractedText = ''
      let aiProcessed = false

      if (mimeType === 'text/plain') {
        // Direct text extraction
        extractedText = fileBuffer.toString('utf-8')
        aiProcessed = false
      } else if (mimeType.startsWith('image/')) {
        if (openai) {
          // Use GPT-4 Vision for OCR
          const base64Image = fileBuffer.toString('base64')
          const response = await openai.chat.completions.create({
            model: process.env.AZURE_OPENAI_VISION_MODEL || 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extract all text from this image. Return only the text content, maintaining the original structure and formatting as much as possible.',
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${mimeType};base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 2000,
          })

          extractedText = response.choices[0]?.message?.content || ''
          aiProcessed = true
        } else {
          extractedText = `[AI OCR not available - API key required to extract text from ${fileName}]`
          aiProcessed = false
        }
      } else if (mimeType === 'application/pdf') {
        // For Phase 1, we'll use basic text extraction
        // In Phase 2, we'll add proper PDF parsing with pdf-parse
        extractedText = 'PDF text extraction will be enhanced in Phase 2'
        aiProcessed = false
      }

      // Basic topic detection
      const topic = await this.detectTopic(extractedText)

      const processingTime = Date.now() - startTime
      const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length
      const characterCount = extractedText.length

      return {
        extractedText,
        detectedTopic: topic,
        confidence: aiProcessed ? 0.85 : 0.0,
        processingTime,
        aiProcessed,
        metadata: {
          fileType: mimeType,
          wordCount,
          characterCount,
        },
      }
    } catch (error) {
      console.error('Document processing error:', error)
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Detect the topic/prompt from essay content
   */
  async detectTopic(text: string): Promise<string> {
    if (!openai) {
      return 'Topic detection not available - AI API key required'
    }

    try {
      const response = await openai.chat.completions.create({
        model: process.env.AZURE_OPENAI_TEXT_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at identifying essay topics and prompts. Analyze the given text and identify the main topic or prompt the essay is addressing. Return a concise topic description in 1-2 sentences.',
          },
          {
            role: 'user',
            content: `Identify the main topic or prompt of this essay:\n\n${text.substring(0, 1000)}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.3,
      })

      return response.choices[0]?.message?.content || 'Unable to detect topic'
    } catch (error) {
      console.error('Topic detection error:', error)
      return 'Topic detection failed'
    }
  }

  /**
   * Analyze essay using ISEE rubric (Phase 3 implementation)
   */
  async analyzeEssay(text: string, topic?: string): Promise<EssayAnalysisResult> {
    // Phase 1: Basic structure, will be fully implemented in Phase 3
    return {
      rubricScores: {
        grammarMechanics: 0,
        wordChoiceVocabulary: 0,
        structureOrganization: 0,
        developmentSupport: 0,
        clarityFocus: 0,
      },
      overallScore: 0,
      feedback: ['Essay analysis will be implemented in Phase 3'],
      strengths: ['Analysis pending'],
      areasForImprovement: ['Full rubric evaluation coming in Phase 3'],
    }
  }
}

export const aiClient = new AIClient()