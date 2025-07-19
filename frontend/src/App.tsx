import { useState } from 'react'
import FileUpload from './components/FileUpload'
import ProcessingReview from './components/ProcessingReview'
import TextEditor from './components/TextEditor'
import EvaluationResults from './components/evaluation/EvaluationResults'
import { evaluationService } from './services/evaluationService'
import type { EvaluationResponse } from './types/evaluation'
export type InputMethod = 'text' | 'images'

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [promptText, setPromptText] = useState<string>('')
  const [essayText, setEssayText] = useState<string>('')
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null)
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false)
  const [processingResult, setProcessingResult] = useState<{
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
      processingTime: number
      confidence: number
      totalPages: number
      pageOrder: number[]
      aiProcessed: boolean
    }
    message?: string
    error?: string
  } | null>(null)
  const [currentView, setCurrentView] = useState<'editor' | 'review' | 'results'>('editor')

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
  }

  const handlePromptChange = (prompt: string) => {
    setPromptText(prompt)
  }

  const handleEssayChange = (essay: string) => {
    setEssayText(essay)
  }

  const handleMethodChange = (method: InputMethod) => {
    setInputMethod(method)
    // Clear previous data when switching methods
    setUploadedFiles([])
    setPromptText('')
    setEssayText('')
    setProcessingResult(null)
    setCurrentView('editor')
  }

  const handleEvaluateEssay = async () => {
    if (!essayText.trim()) {
      alert('Please enter essay text before evaluating.')
      return
    }

    setIsEvaluating(true)

    try {
      const result = await evaluationService.evaluateEssay({
        text: essayText,
        prompt: promptText.trim() || undefined, // Include prompt if provided
        rubric: {
          family: 'isee',
          level: 'upper',
        },
      })

      setEvaluationResult(result)
      setCurrentView('results')
    } catch (error) {
      console.error('Evaluation failed:', error)
      alert(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleBackToEditor = () => {
    setCurrentView('editor')
  }

  const handleProcessImages = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload images before processing.')
      return
    }

    setIsProcessingImages(true)

    try {
      const formData = new FormData()
      uploadedFiles.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const result = await response.json()
      setProcessingResult(result)

      // Check if we should auto-evaluate or show review
      if (result.essay?.writingPrompt?.source === 'extracted') {
        // Auto-evaluate: high confidence prompt extraction
        setPromptText(result.essay.writingPrompt.text)
        setEssayText(result.essay.studentEssay.fullText)
        await handleEvaluateEssay()
      } else {
        // Show review: prompt was summarized/inferred
        setCurrentView('review')
      }
    } catch (error) {
      console.error('Image processing failed:', error)
      alert(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessingImages(false)
    }
  }

  const handleReviewConfirm = async (prompt: string, essay: string) => {
    setPromptText(prompt)
    setEssayText(essay)
    setCurrentView('editor')
    // Auto-evaluate after review
    await handleEvaluateEssay()
  }

  const handleReviewCancel = () => {
    setCurrentView('editor')
    setProcessingResult(null)
  }

  const handlePrintReport = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {currentView === 'results' && evaluationResult ? (
          <EvaluationResults
            evaluation={evaluationResult}
            essayText={essayText}
            prompt={promptText}
            onClose={handleBackToEditor}
            onPrint={handlePrintReport}
          />
        ) : currentView === 'review' && processingResult ? (
          <ProcessingReview
            extractedPrompt={''}
            extractedEssay={processingResult.processing?.extractedText || ''}
            promptSource={'extracted'}
            onConfirm={handleReviewConfirm}
            onCancel={handleReviewCancel}
          />
        ) : (
          <>
            {/* Modern, Minimal Header - Ultra compact */}
            <div className="text-center py-4">
              <h1 className="text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
                Essay Tutor
              </h1>
            </div>

            {/* Main Interface Container - Minimal top spacing */}
            <div className="max-w-5xl mx-auto px-6">
              {/* Modern Tab Design - Close to header */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-1 rounded-xl inline-flex">
                  <button
                    onClick={() => handleMethodChange('text')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      inputMethod === 'text'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Write
                  </button>
                  <button
                    onClick={() => handleMethodChange('images')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      inputMethod === 'images'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {/* Main Content Card - Reduced padding */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                {inputMethod === 'text' ? (
                  <div className="p-6">
                    <TextEditor
                      onPromptChange={handlePromptChange}
                      onEssayChange={handleEssayChange}
                      promptPlaceholder="Enter writing prompt (optional)..."
                      essayPlaceholder="Start writing your essay here..."
                      initialPrompt={promptText}
                      initialEssay={essayText}
                    />
                  </div>
                ) : (
                  <div className="p-6">
                    <FileUpload onUpload={handleFileUpload} maxFiles={10} />
                  </div>
                )}

                {/* Enhanced Action Bar - Reduced padding */}
                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {inputMethod === 'text' ? (
                        <>
                          {essayText.trim() ? (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Ready for analysis
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              Start writing to continue
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {uploadedFiles.length > 0 ? (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}{' '}
                              ready
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                              Upload files to continue
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      {inputMethod === 'text' ? (
                        <button
                          onClick={handleEvaluateEssay}
                          disabled={isEvaluating || !essayText.trim()}
                          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                            isEvaluating || !essayText.trim()
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:scale-105'
                          }`}
                        >
                          {isEvaluating ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-400 rounded-full animate-spin"></div>
                              Analyzing...
                            </span>
                          ) : (
                            'Get feedback'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleProcessImages}
                          disabled={isProcessingImages || uploadedFiles.length === 0}
                          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                            isProcessingImages || uploadedFiles.length === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:scale-105'
                          }`}
                        >
                          {isProcessingImages ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-400 rounded-full animate-spin"></div>
                              Processing...
                            </span>
                          ) : (
                            'Process images'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
