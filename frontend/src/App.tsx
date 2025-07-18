import { useState } from 'react'
import FileUpload from './components/FileUpload'
import InputMethodSelector, { type InputMethod } from './components/InputMethodSelector'
import TextEditor from './components/TextEditor'
import ProcessingReview from './components/ProcessingReview'
import EvaluationResults from './components/evaluation/EvaluationResults'
import { evaluationService } from './services/evaluationService'
import type { EvaluationResponse } from './types/evaluation'

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [promptText, setPromptText] = useState<string>('')
  const [essayText, setEssayText] = useState<string>('')
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null)
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false)
  const [processingResult, setProcessingResult] = useState<any>(null)
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
          level: 'upper'
        }
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
        body: formData
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
            extractedPrompt={processingResult.essay?.writingPrompt?.text || ''}
            extractedEssay={processingResult.essay?.studentEssay?.fullText || ''}
            promptSource={processingResult.essay?.writingPrompt?.source || 'summarized'}
            onConfirm={handleReviewConfirm}
            onCancel={handleReviewCancel}
          />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center pt-12 pb-8 animate-fade-in">
              <div className="card-professional mx-auto max-w-5xl">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-12 relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <span className="text-4xl">📝</span>
                      </div>
                      <div className="text-left">
                        <h1 className="text-5xl font-bold text-white text-shadow mb-2">
                          Essay Tutor
                        </h1>
                        <p className="text-xl text-blue-100 font-medium">
                          AI-Powered Excellence
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                      Transform your ISEE essay writing with professional AI evaluation, detailed feedback, and personalized improvement strategies
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-8 text-blue-100">
                      <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white">🎯</span>
                        </div>
                        <span className="font-semibold">Professional Scoring</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white">📊</span>
                        </div>
                        <span className="font-semibold">Detailed Analytics</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-white">⚡</span>
                        </div>
                        <span className="font-semibold">Instant Results</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        
        <InputMethodSelector 
          selectedMethod={inputMethod}
          onMethodChange={handleMethodChange}
        />

        {inputMethod === 'text' ? (
          <div className="space-y-4">
            <TextEditor 
              onPromptChange={handlePromptChange}
              onEssayChange={handleEssayChange}
              promptPlaceholder="Enter the writing prompt here..."
              essayPlaceholder="Write your ISEE essay here. Focus on clear structure with an introduction, body paragraphs with supporting details, and a strong conclusion."
            />
            
            {/* Evaluation Button */}
            {essayText.trim() && (
              <div className="animate-scale-in">
                <div className="card-professional p-8 hover-lift">
                  <div className="text-center">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to evaluate your essay?</h3>
                      <p className="text-gray-600 text-lg">Get professional AI-powered feedback and detailed scoring</p>
                    </div>
                    
                    <button
                      onClick={handleEvaluateEssay}
                      disabled={isEvaluating}
                      className={`group relative px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                        isEvaluating
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-white'
                      }`}
                    >
                      {isEvaluating ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Evaluating Your Essay...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                            🎯
                          </div>
                          Evaluate Essay
                        </span>
                      )}
                    </button>
                    
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">📊</span>
                          </div>
                          <span>Detailed Analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">🔍</span>
                          </div>
                          <span>Professional Scoring</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">⚡</span>
                          </div>
                          <span>Instant Results</span>
                        </div>
                      </div>
                      
                      {promptText.trim() && (
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-green-700 font-medium">Writing prompt provided for enhanced evaluation</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <FileUpload onUpload={handleFileUpload} maxFiles={10} />
            
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    Files Ready for Processing
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {uploadedFiles.length} page{uploadedFiles.length !== 1 ? 's' : ''} selected - AI will extract text and detect page ordering
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleProcessImages}
                    disabled={isProcessingImages}
                    className={`group relative px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      isProcessingImages
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 text-white'
                    }`}
                  >
                    {isProcessingImages ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Images...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                          🔍
                        </div>
                        Process Images
                      </span>
                    )}
                  </button>
                  <p className="text-sm text-gray-600 mt-3">
                    AI will extract text and automatically evaluate if writing prompt is found
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
