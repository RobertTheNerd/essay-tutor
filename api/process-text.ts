import type { VercelRequest, VercelResponse } from '@vercel/node'
import { aiClient } from './lib/ai-client'

export const runtime = 'nodejs';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, wordCount, charCount } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' })
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content cannot be empty' })
    }

    const startTime = Date.now()
    let detectedTopic = null
    let processingError = null

    // Process with AI if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        detectedTopic = await aiClient.detectTopic(text)
      } catch (aiError) {
        console.error('AI processing error:', aiError)
        processingError = aiError instanceof Error ? aiError.message : 'AI processing failed'
      }
    }

    const processingTime = Date.now() - startTime
    
    // Calculate text statistics
    const actualWordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
    const actualCharCount = text.length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length

    const response = {
      success: true,
      processing: {
        detectedTopic: detectedTopic || 'Topic detection not available',
        wordCount: actualWordCount,
        characterCount: actualCharCount,
        sentences,
        paragraphs,
        processingTime,
        confidence: detectedTopic ? 0.9 : 0.0,
        textPreview: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
        analysisReady: true,
      },
      message: processingError 
        ? `Text processed but AI analysis failed: ${processingError}`
        : detectedTopic 
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