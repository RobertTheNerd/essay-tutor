
export type InputMethod = 'text' | 'images'

interface InputMethodSelectorProps {
  selectedMethod: InputMethod
  onMethodChange: (method: InputMethod) => void
}

export default function InputMethodSelector({ selectedMethod, onMethodChange }: InputMethodSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          How would you like to submit your essay?
        </h2>
        <p className="text-green-100 text-sm mt-1">
          Choose your preferred method to get started with professional evaluation
        </p>
      </div>

      <div className="p-6">      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onMethodChange('text')}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden
              ${selectedMethod === 'text' 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg transform scale-105' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-center mb-3">
              <div className="text-3xl mr-3">✏️</div>
              <h3 className="text-lg font-semibold text-gray-800">Type Your Essay</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Type or paste your essay directly into a text editor. Perfect for digital essays or when you want to make quick edits.
            </p>
            {selectedMethod === 'text' && (
              <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Selected
              </div>
            )}
          </button>

          <button
            onClick={() => onMethodChange('images')}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden
              ${selectedMethod === 'images' 
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg transform scale-105' 
                : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-50 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-center mb-3">
              <div className="text-3xl mr-3">📷</div>
              <h3 className="text-lg font-semibold text-gray-800">Upload Images</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Upload photos of handwritten essays. Supports multiple pages and automatic page ordering using AI.
            </p>
            {selectedMethod === 'images' && (
              <div className="absolute top-3 right-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Selected
              </div>
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            {selectedMethod === 'text' ? (
              <>
                <span className="text-blue-600">📝</span>
                Text Input Features:
              </>
            ) : (
              <>
                <span className="text-purple-600">📸</span>
                Image Upload Features:
              </>
            )}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            {selectedMethod === 'text' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Rich text editor with formatting
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Real-time word and character count
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Copy/paste support
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Instant processing and feedback
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Multiple image support (up to 10 pages)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  AI-powered text extraction (OCR)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Automatic page ordering detection
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Supports JPG, PNG formats
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}