import { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import TextEditor from './components/TextEditor'
import EvaluationResults from './components/evaluation/EvaluationResults'
import { evaluationService } from './services/evaluationService'
import type { EvaluationResponse } from './types/evaluation'
function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processedFiles, setProcessedFiles] = useState<File[]>([])
  const [promptText, setPromptText] = useState<string>('')
  const [essayText, setEssayText] = useState<string>('')
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null)
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false)
  const [processingResult, setProcessingResult] = useState<{
    success: boolean
    document?: {
      metadata: {
        totalPages: number
        processingTime: number
        confidence: number
        aiProcessed: boolean
      }
    }
    essay?: {
      writingPrompt: {
        text: string
        source: 'extracted' | 'summarized' | 'user_provided'
        confidence: number
      }
      studentEssay: {
        fullText: string
      }
    }
    message?: string
    error?: string
  } | null>(null)
  const [currentView, setCurrentView] = useState<'editor' | 'results'>('editor')

  // Clear processing results when files change
  useEffect(() => {
    // If we have processing results but files have changed, clear them
    if (processingResult && uploadedFiles !== processedFiles) {
      // Check if the file arrays are actually different
      const filesChanged = uploadedFiles.length !== processedFiles.length ||
        uploadedFiles.some((file, index) => file !== processedFiles[index])
      
      if (filesChanged) {
        setProcessingResult(null)
      }
    }
  }, [uploadedFiles, processedFiles, processingResult])


  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
  }

  const handlePromptChange = (prompt: string) => {
    setPromptText(prompt)
  }

  const handleEssayChange = (essay: string) => {
    setEssayText(essay)
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
      setProcessedFiles([...uploadedFiles]) // Store the files that were processed

      // Always overwrite text fields with extracted content
      if (result.essay) {
        setPromptText(result.essay.writingPrompt?.text || '')
        setEssayText(result.essay.studentEssay?.fullText || '')
        // Clear any previous evaluation since content has changed
        setEvaluationResult(null)
      }
    } catch (error) {
      console.error('Image processing failed:', error)
      alert(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessingImages(false)
    }
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
              {/* Image Upload Section - Optional helper at top */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                <div className="p-6">
                  <FileUpload 
                    onUpload={handleFileUpload} 
                    maxFiles={10} 
                    initialFiles={uploadedFiles}
                    onProcess={handleProcessImages}
                    isProcessing={isProcessingImages}
                  />
                </div>
              </div>

              {/* Text Input Section - Main content */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                <div className="p-6">
                  <TextEditor
                    onPromptChange={handlePromptChange}
                    onEssayChange={handleEssayChange}
                    promptPlaceholder="Enter writing prompt (optional)..."
                    essayPlaceholder="Write your essay here..."
                    initialPrompt={promptText}
                    initialEssay={essayText}
                  />
                </div>

                {/* Action Bar - Unified for all input methods */}
                <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {essayText.trim() ? (
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Ready for analysis
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          Enter essay text to continue
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Show View Report button if we have a previous evaluation */}
                      {evaluationResult && (
                        <button
                          onClick={() => setCurrentView('results')}
                          className="px-4 py-2.5 rounded-lg font-medium transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                        >
                          📄 View Report
                        </button>
                      )}
                      
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
                          evaluationResult ? 'Re-evaluate' : 'Get feedback'
                        )}
                      </button>
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
