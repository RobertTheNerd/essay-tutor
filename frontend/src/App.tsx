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
            {/* Enhanced Header with Visual Interest */}
            <div className="text-center py-12 relative">
              {/* Subtle background decoration */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-transparent rounded-3xl"></div>
              <div className="relative z-10">
                <h1 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">
                  Essay Tutor
                </h1>
              </div>
            </div>

            {/* Main Writing Interface */}
            <div className="max-w-4xl mx-auto">
              {/* Enhanced Tab Design */}
              <div className="flex justify-center mb-16">
                <div className="bg-white border border-gray-200 rounded-2xl p-1.5 inline-flex shadow-lg">
                  <button
                    onClick={() => handleMethodChange('text')}
                    className={`px-10 py-4 rounded-xl font-semibold transition-all duration-300 relative ${
                      inputMethod === 'text'
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {inputMethod === 'text' && (
                      <div className="absolute inset-0 bg-blue-400 rounded-xl blur-sm opacity-30"></div>
                    )}
                    <span className="relative">Type essay</span>
                  </button>
                  <button
                    onClick={() => handleMethodChange('images')}
                    className={`px-10 py-4 rounded-xl font-semibold transition-all duration-300 relative ${
                      inputMethod === 'images'
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {inputMethod === 'images' && (
                      <div className="absolute inset-0 bg-blue-400 rounded-xl blur-sm opacity-30"></div>
                    )}
                    <span className="relative">Upload images</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Writing Interface */}
              {inputMethod === 'text' ? (
                <div className="space-y-10">
                  {/* Writing card with enhanced styling */}
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 relative overflow-hidden">
                    {/* Subtle decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50"></div>
                    <div className="relative z-10">
                      <TextEditor
                        onPromptChange={handlePromptChange}
                        onEssayChange={handleEssayChange}
                        promptPlaceholder="Enter the writing prompt (optional)..."
                        essayPlaceholder="Start writing your essay here..."
                      />
                    </div>
                  </div>

                  {/* Enhanced Action Section */}
                  <div className="text-center py-12">
                    <div className="mb-8">
                      <button
                        onClick={handleEvaluateEssay}
                        disabled={isEvaluating || !essayText.trim()}
                        className={`px-16 py-5 rounded-2xl font-bold text-xl transition-all duration-300 relative overflow-hidden ${
                          isEvaluating || !essayText.trim()
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                        }`}
                      >
                        {!isEvaluating && !essayText.trim() && (
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200"></div>
                        )}
                        <span className="relative flex items-center justify-center gap-3">
                          {isEvaluating ? (
                            <>
                              <div className="w-6 h-6 border-3 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                              Analyzing your essay...
                            </>
                          ) : (
                            <>
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                ✨
                              </div>
                              Get AI feedback
                            </>
                          )}
                        </span>
                      </button>
                    </div>

                    {essayText.trim() && !isEvaluating && (
                      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 max-w-md mx-auto">
                        <p className="text-sm text-green-800 flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          Your essay is ready for AI analysis!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                    <FileUpload onUpload={handleFileUpload} maxFiles={10} />
                  </div>

                  <div className="text-center py-12">
                    <button
                      onClick={handleProcessImages}
                      disabled={isProcessingImages || uploadedFiles.length === 0}
                      className={`px-16 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${
                        isProcessingImages || uploadedFiles.length === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
                      }`}
                    >
                      {isProcessingImages ? (
                        <span className="flex items-center justify-center gap-3">
                          <div className="w-6 h-6 border-3 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
                          Processing images...
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            🔍
                          </div>
                          Process images
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
