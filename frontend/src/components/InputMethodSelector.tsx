
export type InputMethod = 'text' | 'images'

interface InputMethodSelectorProps {
  selectedMethod: InputMethod
  onMethodChange: (method: InputMethod) => void
}

export default function InputMethodSelector({ selectedMethod, onMethodChange }: InputMethodSelectorProps) {
  return (
    <div className="animate-slide-up">
      <div className="card-professional mb-8 hover-lift">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-8 py-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">🚀</span>
              </div>
              How would you like to submit your essay?
            </h2>
            <p className="text-emerald-100 text-lg">
              Choose your preferred method to get started with professional evaluation
            </p>
          </div>
        </div>

        <div className="p-8">      
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <button
              onClick={() => onMethodChange('text')}
              className={`
                group p-8 rounded-2xl border-2 transition-all duration-500 text-left relative overflow-hidden hover-lift
                ${selectedMethod === 'text' 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-blue-100 to-purple-50 shadow-2xl transform scale-105' 
                  : 'border-gray-200 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:shadow-xl'
                }
              `}
            >
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  ✏️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Type Your Essay</h3>
                  <p className="text-sm text-blue-600 font-medium">Perfect for digital essays</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Type or paste your essay directly into our advanced text editor. Perfect for digital essays or when you want to make quick edits with real-time feedback.
              </p>
              {selectedMethod === 'text' && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-scale-in">
                  ✓ Selected
                </div>
              )}
            </button>

            <button
              onClick={() => onMethodChange('images')}
              className={`
                group p-8 rounded-2xl border-2 transition-all duration-500 text-left relative overflow-hidden hover-lift
                ${selectedMethod === 'images' 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50 shadow-2xl transform scale-105' 
                  : 'border-gray-200 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:shadow-xl'
                }
              `}
            >
              <div className="flex items-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                  📷
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Upload Images</h3>
                  <p className="text-sm text-purple-600 font-medium">Perfect for handwritten essays</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Upload photos of handwritten essays with our advanced AI recognition. Supports multiple pages with automatic ordering and intelligent text extraction.
              </p>
              {selectedMethod === 'images' && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-scale-in">
                  ✓ Selected
                </div>
              )}
            </button>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 rounded-2xl border border-gray-200/50">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-3 text-lg">
              {selectedMethod === 'text' ? (
                <>
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  Text Input Features:
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📸</span>
                  </div>
                  Image Upload Features:
                </>
              )}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              {selectedMethod === 'text' ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">Rich text editor with formatting</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">Real-time word and character count</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">Copy/paste support</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">Instant processing and feedback</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">Multiple image support (up to 10 pages)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">AI-powered text extraction (OCR)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">Automatic page ordering detection</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">Supports JPG, PNG formats</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}