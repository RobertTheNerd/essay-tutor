import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onUpload?: (file: File) => void
}

interface UploadResponse {
  success: boolean
  file?: {
    name: string
    type: string
    size: number
    processed: boolean
  }
  processing?: {
    extractedText: string
    detectedTopic?: string
    wordCount: number
    characterCount: number
    processingTime: number
    confidence: number
  }
  message?: string
  error?: string
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [response, setResponse] = useState<UploadResponse | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setResponse(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result: UploadResponse = await uploadResponse.json()
      setResponse(result)
      
      if (result.success && onUpload) {
        onUpload(file)
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
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          
          {uploading ? (
            <div>
              <div className="text-lg font-medium text-gray-900">Uploading...</div>
              <div className="text-sm text-gray-500">Processing your file</div>
            </div>
          ) : isDragActive ? (
            <div>
              <div className="text-lg font-medium text-blue-900">Drop your file here</div>
              <div className="text-sm text-blue-600">Release to upload</div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium text-gray-900">
                Drag & drop your essay file here
              </div>
              <div className="text-sm text-gray-500">
                or click to select a file
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Supports: .txt, .pdf, .jpg, .png (max 10MB)
              </div>
            </div>
          )}
        </div>
      </div>

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
                  {response.file?.name} ({((response.file?.size || 0) / 1024).toFixed(1)}KB)
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