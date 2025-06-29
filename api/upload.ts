import type { VercelRequest, VercelResponse } from '@vercel/node'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import { aiClient } from '../lib/ai-client'

export const runtime = 'nodejs';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      allowEmptyFiles: false,
      multiples: false,
    })

    const [, files] = await form.parse(req)
    
    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const file = files.file[0]
    const supportedTypes = ['text/plain', 'application/pdf', 'image/jpeg', 'image/png']
    
    if (!supportedTypes.includes(file.mimetype || '')) {
      return res.status(400).json({ 
        error: 'Unsupported file type. Please upload text, PDF, or image files.' 
      })
    }

    // Read file content for AI processing
    const fileContent = await fs.readFile(file.filepath)
    
    let processingResult = null
    let processingError = null

    // Attempt AI processing if OpenAI API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        processingResult = await aiClient.extractTextFromDocument(
          fileContent,
          file.mimetype || 'text/plain',
          file.originalFilename || 'unknown'
        )
      } catch (aiError) {
        console.error('AI processing error:', aiError)
        processingError = aiError instanceof Error ? aiError.message : 'AI processing failed'
      }
    }

    const response = {
      success: true,
      file: {
        name: file.originalFilename,
        type: file.mimetype,
        size: file.size,
        processed: !!processingResult,
      },
      processing: processingResult ? {
        extractedText: processingResult.extractedText.substring(0, 500) + '...', // Preview only
        detectedTopic: processingResult.detectedTopic,
        wordCount: processingResult.metadata.wordCount,
        characterCount: processingResult.metadata.characterCount,
        processingTime: processingResult.processingTime,
        confidence: processingResult.confidence,
      } : null,
      message: processingResult 
        ? 'File uploaded and processed successfully!' 
        : processingError 
          ? `File uploaded but AI processing failed: ${processingError}`
          : 'File uploaded successfully. Set OPENAI_API_KEY to enable AI processing.',
      timestamp: new Date().toISOString(),
    }

    // Clean up temporary file (FERPA compliance - no persistent storage)
    await fs.unlink(file.filepath)

    return res.status(200).json(response)
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}