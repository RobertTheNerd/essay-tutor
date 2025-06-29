import type { VercelRequest, VercelResponse } from '@vercel/node'
import formidable from 'formidable'
import { promises as fs } from 'fs'
import { aiClient } from '../lib/ai-client'

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
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
      allowEmptyFiles: false,
      multiples: true,
      maxFiles: 10, // Maximum 10 pages
    })

    const [, files] = await form.parse(req)
    
    if (!files.files || files.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files]
    const supportedTypes = ['image/jpeg', 'image/png']
    
    // Validate all files
    for (const file of uploadedFiles) {
      if (!supportedTypes.includes(file.mimetype || '')) {
        return res.status(400).json({ 
          error: `Unsupported file type: ${file.originalFilename}. Please upload JPG or PNG images only.` 
        })
      }
    }

    let processingResults = []
    let processingError = null
    let combinedText = ''
    let totalProcessingTime = 0

    // Process each image if OpenAI API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const file = uploadedFiles[i]
          const fileContent = await fs.readFile(file.filepath)
          
          const result = await aiClient.extractTextFromDocument(
            fileContent,
            file.mimetype || 'image/jpeg',
            file.originalFilename || `page-${i + 1}`
          )
          
          processingResults.push({
            pageNumber: i + 1,
            filename: file.originalFilename,
            extractedText: result.extractedText,
            processingTime: result.processingTime,
            confidence: result.confidence
          })
          
          combinedText += `\n\n--- Page ${i + 1} ---\n${result.extractedText}`
          totalProcessingTime += result.processingTime
          
          // Clean up temporary file (FERPA compliance)
          await fs.unlink(file.filepath)
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
            name: file.originalFilename,
            type: file.mimetype,
            size: file.size,
            processed: true,
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
            pageOrder
          },
          message: `Successfully processed ${uploadedFiles.length} page${uploadedFiles.length !== 1 ? 's' : ''} with AI text extraction!`,
          timestamp: new Date().toISOString(),
        }

        return res.status(200).json(response)

      } catch (aiError) {
        console.error('AI processing error:', aiError)
        processingError = aiError instanceof Error ? aiError.message : 'AI processing failed'
        
        // Clean up files even if AI processing fails
        for (const file of uploadedFiles) {
          try {
            await fs.unlink(file.filepath)
          } catch (unlinkError) {
            console.error('File cleanup error:', unlinkError)
          }
        }
      }
    } else {
      // Clean up files when no API key
      for (const file of uploadedFiles) {
        await fs.unlink(file.filepath)
      }
    }

    // Response when AI processing is not available or failed
    const response = {
      success: true,
      files: uploadedFiles.map((file, index) => ({
        name: file.originalFilename,
        type: file.mimetype,
        size: file.size,
        processed: false,
        pageNumber: index + 1,
      })),
      processing: null,
      message: processingError 
        ? `Files uploaded but AI processing failed: ${processingError}`
        : `${uploadedFiles.length} page${uploadedFiles.length !== 1 ? 's' : ''} uploaded successfully. Set OPENAI_API_KEY to enable AI processing.`,
      timestamp: new Date().toISOString(),
    }

    return res.status(200).json(response)

  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}