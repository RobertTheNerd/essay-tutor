
export type InputMethod = 'text' | 'images'

interface InputMethodSelectorProps {
  selectedMethod: InputMethod
  onMethodChange: (method: InputMethod) => void
}

export default function InputMethodSelector({ selectedMethod, onMethodChange }: InputMethodSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4">How would you like to submit your essay?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onMethodChange('text')}
          className={`
            p-6 rounded-lg border-2 transition-all duration-200 text-left
            ${selectedMethod === 'text' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-center mb-3">
            <div className="text-3xl mr-3">✏️</div>
            <h3 className="text-lg font-medium">Type Your Essay</h3>
          </div>
          <p className="text-sm text-gray-600">
            Type or paste your essay directly into a text editor. Perfect for digital essays or when you want to make quick edits.
          </p>
        </button>

        <button
          onClick={() => onMethodChange('images')}
          className={`
            p-6 rounded-lg border-2 transition-all duration-200 text-left
            ${selectedMethod === 'images' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-center mb-3">
            <div className="text-3xl mr-3">📷</div>
            <h3 className="text-lg font-medium">Upload Images</h3>
          </div>
          <p className="text-sm text-gray-600">
            Upload photos of handwritten essays. Supports multiple pages and automatic page ordering using AI.
          </p>
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="font-medium text-gray-800 mb-2">
          {selectedMethod === 'text' ? '📝 Text Input Features:' : '📸 Image Upload Features:'}
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {selectedMethod === 'text' ? (
            <>
              <li>• Rich text editor with formatting</li>
              <li>• Real-time word and character count</li>
              <li>• Copy/paste support</li>
              <li>• Instant processing and feedback</li>
            </>
          ) : (
            <>
              <li>• Multiple image support (up to 10 pages)</li>
              <li>• AI-powered text extraction (OCR)</li>
              <li>• Automatic page ordering detection</li>
              <li>• Supports JPG, PNG formats</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}