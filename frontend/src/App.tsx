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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4">
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
            {/* Professional Header */}
            <div className="text-center mb-8 pt-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-4xl">📝</span>
                    <h1 className="text-4xl font-bold text-white">Essay Tutor</h1>
                  </div>
                  <p className="text-blue-100 text-lg">
                    AI-powered ISEE essay evaluation with automated scoring and feedback
                  </p>
                  <div className="mt-4 flex justify-center gap-6 text-sm text-blue-100">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-200">🎯</span>
                      <span>Professional Scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-200">📊</span>
                      <span>Detailed Feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-200">⚡</span>
                      <span>Instant Results</span>
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
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Ready to evaluate your essay?</h3>
                  <button
                    onClick={handleEvaluateEssay}
                    disabled={isEvaluating}
                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                      isEvaluating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isEvaluating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Evaluating...
                      </span>
                    ) : (
                      '🎯 Evaluate Essay'
                    )}
                  </button>
                  <p className="text-sm text-gray-600 mt-3">
                    Get detailed AI-powered feedback and scoring
                    {promptText.trim() && (
                      <span className="block text-green-600 font-medium mt-2 flex items-center justify-center gap-2">
                        <span className="text-green-500">✓</span>
                        Writing prompt provided for enhanced evaluation
                      </span>
                    )}
                  </p>
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
                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                      isProcessingImages
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isProcessingImages ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Images...
                      </span>
                    ) : (
                      '🔍 Process Images'
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
