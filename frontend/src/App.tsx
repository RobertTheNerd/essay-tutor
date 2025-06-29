import { useState } from 'react'
import FileUpload from './components/FileUpload'
import InputMethodSelector, { type InputMethod } from './components/InputMethodSelector'
import TextEditor from './components/TextEditor'

function App() {
  const [apiResponse, setApiResponse] = useState<string>('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [inputMethod, setInputMethod] = useState<InputMethod>('text')
  const [, setEssayText] = useState<string>('')

  const testAPI = async () => {
    try {
      const response = await fetch('/api/hello?name=EssayTutor')
      const data = await response.json()
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setApiResponse(`Error: ${error}`)
    }
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
  }

  const handleTextChange = (text: string) => {
    setEssayText(text)
  }

  const handleMethodChange = (method: InputMethod) => {
    setInputMethod(method)
    // Clear previous data when switching methods
    setUploadedFiles([])
    setEssayText('')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
          <TextEditor 
            onTextChange={handleTextChange}
            placeholder="Write your ISEE essay here. Focus on clear structure with an introduction, body paragraphs with supporting details, and a strong conclusion."
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Upload Essay Images</h2>
            <FileUpload onUpload={handleFileUpload} maxFiles={10} />
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-900">Files Ready for Processing</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {uploadedFiles.length} page{uploadedFiles.length !== 1 ? 's' : ''} selected - AI will extract text and detect page ordering
                </p>
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
          <h2 className="text-2xl font-semibold mb-4">Phase 1 Features</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              React + TypeScript + Vite setup
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              TailwindCSS styling
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Vercel serverless functions
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Multiple input methods (text + images)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Multi-page image upload with OCR
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              AI integration with GPT-4 Vision
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
