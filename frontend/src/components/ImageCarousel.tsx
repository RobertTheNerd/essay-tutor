import { useEffect, useCallback } from 'react'

interface ImageCarouselProps {
  files: File[]
  isOpen: boolean
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function ImageCarousel({
  files,
  isOpen,
  currentIndex,
  onClose,
  onNavigate,
}: ImageCarouselProps) {
  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : files.length - 1
    onNavigate(newIndex)
  }, [currentIndex, files.length, onNavigate])

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < files.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
  }, [currentIndex, files.length, onNavigate])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return

      switch (event.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    },
    [isOpen, onClose, handlePrevious, handleNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || files.length === 0) {
    return null
  }

  const currentFile = files[currentIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          aria-label="Close carousel"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image Counter */}
        <div className="absolute top-4 left-4 z-20 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium">
          {currentIndex + 1} of {files.length}
        </div>

        {/* Previous Button */}
        {files.length > 1 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Main Image */}
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={URL.createObjectURL(currentFile)}
            alt={`Page ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Next Button */}
        {files.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-colors"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Bottom Navigation Dots */}
        {files.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {files.map((_, index) => (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-white'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}