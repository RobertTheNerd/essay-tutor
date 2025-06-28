import { useState } from 'react'
import FileUpload from './components/FileUpload'

function App() {
  const [apiResponse, setApiResponse] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const testAPI = async () => {
    try {
      const response = await fetch('/api/hello?name=EssayTutor')
      const data = await response.json()
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setApiResponse(`Error: ${error}`)
    }
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
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
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Upload Essay</h2>
          <FileUpload onUpload={handleFileUpload} />
          
          {uploadedFile && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium text-blue-900">File Ready for Processing</h3>
              <p className="text-sm text-blue-700 mt-1">
                {uploadedFile.name} - AI processing will be added in Phase 2
              </p>
            </div>
          )}
        </div>

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
              File upload handling
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              AI integration (pending)
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
