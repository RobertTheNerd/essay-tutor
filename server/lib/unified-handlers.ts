// Images-to-essay handler using the MultiPageDocument → StructuredEssay pipeline
// Clean API design focused on image uploads only

import formidable from 'formidable' 
import { promises as fs } from 'fs'
import { processImagesToStructuredEssay } from './document-processor'
import type { PlatformRequest, PlatformResponse, ImagesToEssayResponse } from './types'

export interface ImagesToEssayRequest {
  files?: any[]
}

/**
 * Images-to-essay processing endpoint (image uploads only)
 */
export async function handleImagesToEssay(
  req: PlatformRequest,
  res: PlatformResponse,
  rawReq?: any // For Vercel formidable parsing
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()

  try {

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

    const { document: processedDocument, essay } = await processImagesToStructuredEssay(imageFiles)
    
    const totalProcessingTime = Date.now() - startTime

    const response: ImagesToEssayResponse = {
      success: true,
      document: processedDocument,
      essay,
      message: generateSuccessMessage(processedDocument, essay),
      timestamp: new Date().toISOString(),
      processingTime: totalProcessingTime
    }

    return res.status(200).json(response)

  } catch (error) {
    console.error('Images-to-essay processing error:', error)
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
function generateSuccessMessage(document: any, essay: any): string {
  const promptSource = essay.writingPrompt.source
  const iseeCategory = essay.writingPrompt.iseeCategory
  const aiProcessed = document.metadata.aiProcessed
  const pageCount = document.metadata.totalPages
  const pageText = pageCount === 1 ? 'page' : 'pages'

  if (aiProcessed) {
    return `Successfully processed ${pageCount} ${pageText} with automatic ordering! Detected ${iseeCategory} essay with ${promptSource} topic.`
  }
  return `${pageCount} ${pageText} uploaded successfully. Set OPENAI_API_KEY for AI processing.`
}
