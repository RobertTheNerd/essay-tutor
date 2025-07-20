import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import ImageCarousel from './ImageCarousel'

interface FileUploadProps {
  onUpload?: (files: File[]) => void
  maxFiles?: number
  initialFiles?: File[]
  onProcess?: () => void
  isProcessing?: boolean
}


export default function FileUpload({ onUpload, maxFiles = 10, initialFiles = [], onProcess, isProcessing = false }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles)
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  // Update selectedFiles when initialFiles changes and auto-expand if files exist
  useEffect(() => {
    setSelectedFiles(initialFiles)
    if (initialFiles.length > 0) {
      setIsExpanded(true)
    }
  }, [initialFiles])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      // Auto-expand when files are uploaded
      setIsExpanded(true)

      // Update selected files for preview (no API call yet)
      setSelectedFiles(prev => {
        const combined = [...prev, ...acceptedFiles]
        // Limit to maxFiles
        const limited = combined.slice(0, maxFiles)
        
        // Notify parent of file selection
        if (onUpload) {
          onUpload(limited)
        }
        
        return limited
      })
    },
    [onUpload, maxFiles]
  )

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (onUpload) {
        onUpload(updated)
      }
      return updated
    })
  }

  const clearAllFiles = () => {
    setSelectedFiles([])
    if (onUpload) {
      onUpload([])
    }
  }

  const openCarousel = (index: number) => {
    setCurrentImageIndex(index)
    setIsCarouselOpen(true)
  }

  const closeCarousel = () => {
    setIsCarouselOpen(false)
  }

  const navigateCarousel = (index: number) => {
    setCurrentImageIndex(index)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB per file
    multiple: true,
  })

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with collapse toggle */}
      <div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <div>
              <h2 className="text-xl font-bold text-white">
                Extract from Images (Optional)
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Upload images to automatically extract writing prompt and essay text
              </p>
            </div>
          </div>
          <div className="text-white text-2xl transform transition-transform duration-200">
            {isExpanded ? '−' : '+'}
          </div>
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <>
          <div className="p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200
                ${
                  isDragActive
                    ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-blue-100 shadow-inner'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }
              `}
            >
              <input {...getInputProps()} />

              <div className="space-y-2">
                <div className="text-4xl">{isDragActive ? '📥' : '📄'}</div>

                {isDragActive ? (
                  <div>
                    <div className="text-lg font-bold text-blue-900">Drop your images here!</div>
                    <div className="text-sm text-blue-600 mt-1">Release to add images.</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-lg font-bold text-gray-900">📤 Drag & Drop Essay Images</div>
                    <div className="text-sm text-gray-600 mt-1">
                      or click to browse and select multiple images
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded text-xs">
                      <span className="text-blue-500">📋</span>
                      JPG, PNG • Max {maxFiles} pages • 10MB each
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6 bg-gray-50/30 -mx-6 px-6 pb-6 rounded-b-xl">
              <div className="flex items-center justify-between mb-6 gap-4">
                <h3 className="font-semibold text-gray-900 flex-1 text-lg">
                  Selected Files ({selectedFiles.length} page{selectedFiles.length !== 1 ? 's' : ''})
                </h3>
                <button
                  onClick={clearAllFiles}
                  className="text-sm text-red-600 hover:text-red-700 font-medium whitespace-nowrap px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Page ${index + 1}`}
                      className="w-full h-auto max-h-48 object-contain bg-gray-50 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 hover:scale-105 transition-all duration-200 shadow-sm"
                      onClick={() => openCarousel(index)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 rounded-b-lg">
                      Page {index + 1}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Images Button */}
          {selectedFiles.length > 0 && onProcess && (
            <div className="px-6 pb-6">
              <button
                onClick={onProcess}
                disabled={isProcessing}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isProcessing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                    Processing images...
                  </span>
                ) : (
                  '🔄 Process Images & Extract Text'
                )}
              </button>
            </div>
          )}
        </>
      )}


      {/* Image Carousel Modal */}
      <ImageCarousel
        files={selectedFiles}
        isOpen={isCarouselOpen}
        currentIndex={currentImageIndex}
        onClose={closeCarousel}
        onNavigate={navigateCarousel}
      />
    </div>
  )
}
