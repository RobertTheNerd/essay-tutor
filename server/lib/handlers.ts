// Platform-agnostic handler implementations
// These contain the core business logic without platform-specific dependencies

import formidable from 'formidable'
import { promises as fs } from 'fs'
import { aiClient } from './ai-client.js'
import type { PlatformRequest, PlatformResponse } from './types.js'

export interface ProcessTextRequest {
  text: string
  wordCount?: number
  charCount?: number
}

export interface ProcessTextResponse {
  success: boolean
  processing: {
    detectedTopic: string
    wordCount: number
    characterCount: number
    sentences: number
    paragraphs: number
    processingTime: number
    confidence: number
    textPreview: string
    analysisReady: boolean
    aiProcessed: boolean
  }
  message: string
  timestamp: string
  nextSteps: string[]
}

export async function handleProcessText(
  req: PlatformRequest,
  res: PlatformResponse
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, wordCount, charCount } = req.body as ProcessTextRequest

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' })
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content cannot be empty' })
    }

    const startTime = Date.now()
    let detectedTopic = null
    let processingError = null
    let aiProcessed = false

    // Process with AI client
    try {
      detectedTopic = await aiClient.detectTopic(text)
      aiProcessed = !detectedTopic.includes('not available') && !detectedTopic.includes('failed')
    } catch (aiError) {
      console.error('AI processing error:', aiError)
      processingError = aiError instanceof Error ? aiError.message : 'AI processing failed'
      detectedTopic = 'Topic detection failed'
    }

    const processingTime = Date.now() - startTime
    
    // Calculate text statistics
    const actualWordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
    const actualCharCount = text.length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

    const response: ProcessTextResponse = {
      success: true,
      processing: {
        detectedTopic: detectedTopic || 'Topic detection not available',
        wordCount: actualWordCount,
        characterCount: actualCharCount,
        sentences,
        paragraphs,
        processingTime,
        confidence: aiProcessed ? 0.9 : 0.0,
        textPreview: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        analysisReady: true,
        aiProcessed
      },
      message: processingError 
        ? `Text processed but AI analysis failed: ${processingError}`
        : aiProcessed 
          ? 'Text processed successfully with AI topic detection!'
          : 'Text processed successfully. Set OPENAI_API_KEY for AI topic detection.',
      timestamp: new Date().toISOString(),
      nextSteps: [
        'Review your essay text and statistics',
        'Proceed to detailed ISEE rubric analysis (Phase 3)',
        'Generate comprehensive feedback report'
      ]
    }

    return res.status(200).json(response)

  } catch (error) {
    console.error('Text processing error:', error)
    return res.status(500).json({ 
      error: 'Text processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function handleUploadMultiple(
  req: PlatformRequest,
  res: PlatformResponse,
  rawReq?: any // For platforms that need raw request access (like Vercel with formidable)
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    let uploadedFiles: any[] = []

    // Handle different platforms
    if (rawReq && !req.files) {
      // Vercel/formidable parsing
      const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB per file
        allowEmptyFiles: false,
        multiples: true,
        maxFiles: 10, // Maximum 10 pages
      })

      const [, files] = await form.parse(rawReq)
      
      if (!files.files) {
        return res.status(400).json({ error: 'No files uploaded' })
      }

      uploadedFiles = Array.isArray(files.files) ? files.files : [files.files]
      
      if (uploadedFiles.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' })
      }
    } else if (req.files) {
      // Express/multer parsed files
      uploadedFiles = Array.isArray(req.files) ? req.files : Object.values(req.files).flat()
    } else {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const supportedTypes = ['image/jpeg', 'image/png']
    
    // Validate all files
    for (const file of uploadedFiles) {
      const mimeType = file.mimetype || file.type
      if (!supportedTypes.includes(mimeType || '')) {
        return res.status(400).json({ 
          error: `Unsupported file type: ${file.originalFilename || file.name}. Please upload JPG or PNG images only.` 
        })
      }
    }

    let processingResults = []
    let processingError = null
    let combinedText = ''
    let totalProcessingTime = 0
    let anyAiProcessed = false

    // Process each image with AI client
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        const filePath = file.filepath || file.path
        const fileName = file.originalFilename || file.name
        const mimeType = file.mimetype || file.type
        
        const fileContent = await fs.readFile(filePath)
        
        const result = await aiClient.extractTextFromDocument(
          fileContent,
          mimeType || 'image/jpeg',
          fileName || `page-${i + 1}`
        )
        
        processingResults.push({
          pageNumber: i + 1,
          filename: fileName,
          extractedText: result.extractedText,
          processingTime: result.processingTime,
          confidence: result.confidence,
          aiProcessed: result.aiProcessed
        })
        
        combinedText += `\n\n--- Page ${i + 1} ---\n${result.extractedText}`
        totalProcessingTime += result.processingTime
        anyAiProcessed = anyAiProcessed || result.aiProcessed
        
        // Clean up temporary file (FERPA compliance)
        await fs.unlink(filePath)
      }

      // Detect page ordering and topic from combined text
      const detectedTopic = await aiClient.detectTopic(combinedText)
      
      // Simple page ordering (in future, implement AI-based ordering)
      const pageOrder = Array.from({ length: uploadedFiles.length }, (_, i) => i + 1)
      
      const wordCount = combinedText.trim().split(/\s+/).filter(word => word.length > 0).length
      const characterCount = combinedText.length

      const response = {
        success: true,
        files: uploadedFiles.map((file, index) => ({
          name: file.originalFilename || file.name,
          type: file.mimetype || file.type,
          size: file.size,
          processed: processingResults[index]?.aiProcessed || false,
          pageNumber: index + 1,
        })),
        processing: {
          extractedText: combinedText.substring(0, 1000) + '...', // Preview only
          detectedTopic,
          wordCount,
          characterCount,
          processingTime: totalProcessingTime,
          confidence: processingResults.reduce((sum, r) => sum + r.confidence, 0) / processingResults.length,
          totalPages: uploadedFiles.length,
          pageOrder,
          aiProcessed: anyAiProcessed
        },
        message: anyAiProcessed 
          ? `Successfully processed ${uploadedFiles.length} page${uploadedFiles.length !== 1 ? 's' : ''} with AI text extraction!`
          : `${uploadedFiles.length} page${uploadedFiles.length !== 1 ? 's' : ''} uploaded successfully. Set OPENAI_API_KEY to enable AI processing.`,
        timestamp: new Date().toISOString(),
      }

      return res.status(200).json(response)

    } catch (aiError) {
      console.error('AI processing error:', aiError)
      processingError = aiError instanceof Error ? aiError.message : 'AI processing failed'
      
      // Clean up files even if AI processing fails
      for (const file of uploadedFiles) {
        try {
          const filePath = file.filepath || file.path
          await fs.unlink(filePath)
        } catch (unlinkError) {
          console.error('File cleanup error:', unlinkError)
        }
      }

      // Response when AI processing failed
      const response = {
        success: true,
        files: uploadedFiles.map((file, index) => ({
          name: file.originalFilename || file.name,
          type: file.mimetype || file.type,
          size: file.size,
          processed: false,
          pageNumber: index + 1,
        })),
        processing: null,
        message: `Files uploaded but processing failed: ${processingError}`,
        timestamp: new Date().toISOString(),
      }

      return res.status(200).json(response)
    }

  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function handleHello(
  req: PlatformRequest,
  res: PlatformResponse
): Promise<void> {
  const name = (req.query.name as string) || 'World'
  
  const response = {
    message: `Hello ${name}! Essay Tutor API is running.`,
    timestamp: new Date().toISOString(),
    method: req.method,
    platform: process.env.VERCEL ? 'Vercel' : 'Self-hosted'
  }

  return res.status(200).json(response)
}