import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import ImageCarousel from './ImageCarousel'

interface FileUploadProps {
  onUpload?: (files: File[]) => void
  maxFiles?: number
  initialFiles?: File[]
}


export default function FileUpload({ onUpload, maxFiles = 10, initialFiles = [] }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles)
  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Update selectedFiles when initialFiles changes
  useEffect(() => {
    setSelectedFiles(initialFiles)
  }, [initialFiles])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

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
            <div className="text-4xl">{isDragActive ? '📥' : '📸'}</div>

            {isDragActive ? (
              <div>
                <div className="text-lg font-bold text-blue-900">Drop your images here!</div>
                <div className="text-sm text-blue-600 mt-1">Release to start processing</div>
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
