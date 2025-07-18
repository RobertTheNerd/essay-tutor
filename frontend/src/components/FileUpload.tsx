import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onUpload?: (files: File[]) => void
  maxFiles?: number
}

interface UploadResponse {
  success: boolean
  files?: Array<{
    name: string
    type: string
    size: number
    processed: boolean
    pageNumber?: number
  }>
  processing?: {
    extractedText: string
    detectedTopic?: string
    wordCount: number
    characterCount: number
    processingTime: number
    confidence: number
    totalPages: number
    pageOrder: number[]
    aiProcessed: boolean
  }
  message?: string
  error?: string
}

export default function FileUpload({ onUpload, maxFiles = 10 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [response, setResponse] = useState<UploadResponse | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // Update selected files for preview
    setSelectedFiles(acceptedFiles)
    setUploading(true)
    setResponse(null)
    
    try {
      const formData = new FormData()
      
      // Add all files to form data
      acceptedFiles.forEach((file) => {
        formData.append(`files`, file)
      })

      const uploadResponse = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      // Check if response is ok
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        setResponse({
          success: false,
          error: `HTTP Error ${uploadResponse.status}: ${errorText.substring(0, 500)}`
        })
        return
      }
      
      // Check content type
      const contentType = uploadResponse.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await uploadResponse.text()
        setResponse({
          success: false,
          error: `Invalid content type: ${contentType}\nResponse: ${responseText.substring(0, 500)}`
        })
        return
      }

      const result: UploadResponse = await uploadResponse.json()
      setResponse(result)
      
      if (result.success && onUpload) {
        onUpload(acceptedFiles)
      }
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      })
    } finally {
      setUploading(false)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB per file
    multiple: true,
  })

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📸</span>
          Upload Essay Images
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          Upload images of your handwritten or printed essay for AI analysis
        </p>
      </div>

      <div className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive 
              ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-blue-100 shadow-inner' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="text-6xl">
              {uploading ? '⏳' : isDragActive ? '📥' : '📸'}
            </div>
            
            {uploading ? (
              <div>
                <div className="text-xl font-bold text-gray-900">Processing Images...</div>
                <div className="text-sm text-gray-600 mt-2">
                  Uploading {selectedFiles.length} page{selectedFiles.length !== 1 ? 's' : ''} and extracting text with AI
                </div>
                <div className="mt-4">
                  <div className="animate-pulse bg-blue-200 rounded-full h-2 w-48 mx-auto"></div>
                </div>
              </div>
            ) : isDragActive ? (
              <div>
                <div className="text-xl font-bold text-blue-900">Drop your images here!</div>
                <div className="text-sm text-blue-600 mt-2">Release to start processing</div>
              </div>
            ) : (
              <div>
                <div className="text-xl font-bold text-gray-900">
                  📤 Drag & Drop Essay Images
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  or click to browse and select multiple images
                </div>
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
                  <span className="text-blue-500">📋</span>
                  Supports: JPG, PNG • Max {maxFiles} pages • 10MB each
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Preview */}
      {selectedFiles.length > 0 && !uploading && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-900 mb-2">
            Selected Files ({selectedFiles.length} page{selectedFiles.length !== 1 ? 's' : ''})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Page ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                  Page {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response && (
        <div className="mt-4 space-y-4">
          <div className={`
            p-4 rounded-md border
            ${response.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
            }
          `}>
            {response.success ? (
              <div>
                <div className="font-medium text-green-900">Upload Successful!</div>
                <div className="text-sm text-green-700 mt-1">
                  {response.files?.length || 0} page{(response.files?.length || 0) !== 1 ? 's' : ''} processed
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {response.message}
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium text-red-900">Upload Failed</div>
                <div className="text-sm text-red-700 mt-1">
                  {response.error}
                </div>
              </div>
            )}
          </div>

          {response.processing && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-3">AI Processing Results</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Total Pages:</span>
                  <span className="ml-2 text-blue-700">{response.processing.totalPages}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Word Count:</span>
                  <span className="ml-2 text-blue-700">{response.processing.wordCount}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Characters:</span>
                  <span className="ml-2 text-blue-700">{response.processing.characterCount}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Processing Time:</span>
                  <span className="ml-2 text-blue-700">{response.processing.processingTime}ms</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Confidence:</span>
                  <span className="ml-2 text-blue-700">{(response.processing.confidence * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Page Order:</span>
                  <span className="ml-2 text-blue-700">{response.processing.pageOrder.join(' → ')}</span>
                </div>
              </div>

              {response.processing.detectedTopic && (
                <div className="mb-4">
                  <span className="font-medium text-blue-800">Detected Topic:</span>
                  <p className="text-blue-700 mt-1">{response.processing.detectedTopic}</p>
                </div>
              )}

              <div>
                <span className="font-medium text-blue-800">Extracted Text Preview:</span>
                <div className="mt-2 p-3 bg-white rounded border text-sm text-gray-700 font-mono">
                  {response.processing.extractedText}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}