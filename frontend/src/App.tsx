import { useState } from 'react'
import FileUpload from './components/FileUpload'
import InputMethodSelector, { type InputMethod } from './components/InputMethodSelector'
import TextEditor from './components/TextEditor'
import ProcessingReview from './components/ProcessingReview'
import EvaluationResults from './components/evaluation/EvaluationResults'
import { evaluationService } from './services/evaluationService'
import type { EvaluationResponse } from './types/evaluation'

function App() {
  const [apiResponse, setApiResponse] = useState<string>('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [promptText, setPromptText] = useState<string>('')
  const [essayText, setEssayText] = useState<string>('')
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResponse | null>(null)
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false)
  const [processingResult, setProcessingResult] = useState<any>(null)
  const [currentView, setCurrentView] = useState<'editor' | 'review' | 'results'>('editor')

  const testAPI = async () => {
    try {
      const response = await fetch('/api/hello?name=EssayTutor')
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text()
        setApiResponse(`HTTP Error ${response.status}: ${errorText.substring(0, 500)}`)
        return
      }
      
      // Check content type
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text()
        setApiResponse(`Invalid content type: ${contentType}\nResponse: ${responseText.substring(0, 500)}`)
        return
      }
      
      const data = await response.json()
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

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
    <div className="min-h-screen bg-gray-50 py-8">
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
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Essay Tutor
              </h1>
              <p className="text-lg text-gray-600">
                AI-powered ISEE essay evaluation with automated scoring and feedback
              </p>
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Ready to evaluate your essay?</h3>
                  <button
                    onClick={handleEvaluateEssay}
                    disabled={isEvaluating}
                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                      isEvaluating
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isEvaluating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Evaluating...
                      </span>
                    ) : (
                      '🎯 Evaluate Essay'
                    )}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    Get detailed AI-powered feedback and scoring
                    {promptText.trim() && (
                      <span className="block text-green-600 font-medium mt-1">
                        ✓ Writing prompt provided for enhanced evaluation
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">📸 Image Upload Method</h2>
            <FileUpload onUpload={handleFileUpload} maxFiles={10} />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-blue-50 rounded-md">
                  <h3 className="font-medium text-blue-900">Files Ready for Processing</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {uploadedFiles.length} page{uploadedFiles.length !== 1 ? 's' : ''} selected - AI will extract text and detect page ordering
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={handleProcessImages}
                    disabled={isProcessingImages}
                    className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
                      isProcessingImages
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
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
                  <p className="text-sm text-gray-600 mt-2">
                    AI will extract text and automatically evaluate if writing prompt is found
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">API Test</h2>
          <button 
            onClick={testAPI}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Test API Connection
          </button>
          
          {apiResponse && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">API Response:</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm font-mono overflow-auto">
                {apiResponse}
              </pre>
            </div>
          )}
        </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Current Features</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Real AI-powered ISEE evaluation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  6-category scoring with detailed feedback
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Color-coded annotations and highlights
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Professional evaluation reports
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Multi-page image upload with OCR
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  AI integration with GPT-4o-mini
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
