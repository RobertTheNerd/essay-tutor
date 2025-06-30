// Unified handlers using the new MultiPageDocument → StructuredEssay pipeline
// Clean API design without legacy constraints

import formidable from 'formidable'
import { promises as fs } from 'fs'
import { convertTextToDocument, convertImagesToDocument, extractStructuredEssay } from './document-processor'
import type { PlatformRequest, PlatformResponse, UnifiedProcessingResponse } from './types'

export interface ProcessRequest {
  text?: string
  files?: any[]
}

/**
 * Unified processing endpoint for both text and file inputs
 */
export async function handleUnifiedProcessing(
  req: PlatformRequest,
  res: PlatformResponse,
  rawReq?: any // For Vercel formidable parsing
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()

  try {
    let document
    let inputType: 'text' | 'files'

    // Determine input type and process accordingly
    if (req.body?.text) {
      // Text input
      inputType = 'text'
      const { text } = req.body as { text: string }
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text content is required and cannot be empty' })
      }
      
      document = await convertTextToDocument(text)
      
    } else {
      // File input
      inputType = 'files'
      const uploadedFiles = await parseUploadedFiles(req, rawReq)
      
      if (uploadedFiles.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' })
      }
      
      // Validate file types
      const supportedTypes = ['image/jpeg', 'image/png']
      for (const file of uploadedFiles) {
        const mimeType = file.mimetype || file.type
        if (!supportedTypes.includes(mimeType || '')) {
          return res.status(400).json({ 
            error: `Unsupported file type: ${file.originalFilename || file.name}. Please upload JPG or PNG images only.` 
          })
        }
      }
      
      // Convert files to image processing format
      const imageFiles = []
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i]
        const filePath = file.filepath || file.path
        const fileName = file.originalFilename || file.name
        const mimeType = file.mimetype || file.type
        
        const fileContent = await fs.readFile(filePath)
        
        imageFiles.push({
          buffer: fileContent,
          filename: fileName || `page-${i + 1}`,
          mimeType: mimeType || 'image/jpeg'
        })
        
        // Clean up temporary file (FERPA compliance)
        await fs.unlink(filePath)
      }
      
      document = await convertImagesToDocument(imageFiles)
    }

    // Extract structured essay from document
    const essay = await extractStructuredEssay(document)
    
    const totalProcessingTime = Date.now() - startTime

    const response: UnifiedProcessingResponse = {
      success: true,
      document,
      essay,
      message: generateSuccessMessage(inputType, document, essay),
      timestamp: new Date().toISOString(),
      processingTime: totalProcessingTime
    }

    return res.status(200).json(response)

  } catch (error) {
    console.error('Unified processing error:', error)
    return res.status(500).json({ 
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    })
  }
}

/**
 * Parse uploaded files (handles both Express and Vercel)
 */
async function parseUploadedFiles(req: PlatformRequest, rawReq?: any): Promise<any[]> {
  let uploadedFiles: any[] = []

  if (rawReq && !req.files) {
    // Vercel/formidable parsing
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB per file
      allowEmptyFiles: false,
      multiples: true,
      maxFiles: 10, // Maximum 10 pages
    })

    const [, files] = await form.parse(rawReq)
    
    if (files.files) {
      uploadedFiles = Array.isArray(files.files) ? files.files : [files.files]
    }
  } else if (req.files) {
    // Express/multer parsed files
    uploadedFiles = Array.isArray(req.files) ? req.files : Object.values(req.files).flat()
  }

  return uploadedFiles
}

/**
 * Generate appropriate success message
 */
function generateSuccessMessage(
  inputType: 'text' | 'files',
  document: any,
  essay: any
): string {
  const promptSource = essay.writingPrompt.source
  const iseeCategory = essay.writingPrompt.iseeCategory
  const aiProcessed = document.metadata.aiProcessed

  if (inputType === 'text') {
    if (aiProcessed) {
      return `Text analysis complete! Detected ${iseeCategory} essay with ${promptSource} topic.`
    } else {
      return 'Text processed successfully. Set OPENAI_API_KEY for AI analysis.'
    }
  } else {
    const pageCount = document.metadata.totalPages
    const pageText = pageCount === 1 ? 'page' : 'pages'
    
    if (aiProcessed) {
      return `Successfully processed ${pageCount} ${pageText} with automatic ordering! Detected ${iseeCategory} essay with ${promptSource} topic.`
    } else {
      return `${pageCount} ${pageText} uploaded successfully. Set OPENAI_API_KEY for AI processing.`
    }
  }
}
