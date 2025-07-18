import { useState, useEffect } from 'react'

interface TextEditorProps {
  onPromptChange?: (prompt: string) => void
  onEssayChange?: (essay: string) => void
  promptPlaceholder?: string
  essayPlaceholder?: string
}

export default function TextEditor({ 
  onPromptChange, 
  onEssayChange, 
  promptPlaceholder,
  essayPlaceholder 
}: TextEditorProps) {
  const [promptText, setPromptText] = useState('')
  const [essayText, setEssayText] = useState('')
  const [essayWordCount, setEssayWordCount] = useState(0)
  const [essayCharCount, setEssayCharCount] = useState(0)

  useEffect(() => {
    if (onPromptChange) {
      onPromptChange(promptText)
    }
  }, [promptText, onPromptChange])

  useEffect(() => {
    const words = essayText.trim().split(/\s+/).filter(word => word.length > 0)
    setEssayWordCount(words.length)
    setEssayCharCount(essayText.length)
    
    if (onEssayChange) {
      onEssayChange(essayText)
    }
  }, [essayText, onEssayChange])

  // Remove the old submit handler - evaluation is now handled in App.tsx

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✍️</span>
          Write Your Essay
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Enter your writing prompt and essay text below for professional evaluation
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Writing Prompt Field */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-blue-500">💭</span>
            Writing Prompt
            <span className="text-xs text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={promptPlaceholder || "What is your favorite hobby and why? (Example: helps provide context for more accurate evaluation)"}
            className="w-full h-24 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-gray-50 hover:bg-white text-sm"
            rows={3}
          />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="text-blue-500">💡</span>
            The writing prompt helps provide context for more accurate evaluation.
          </p>
        </div>

        {/* Essay Text Field */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-green-500">📝</span>
            Your Essay
            <span className="text-xs text-red-500 font-normal">*required</span>
          </label>
          <textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder={essayPlaceholder || "Write your ISEE essay here. Focus on clear structure with:\n\n• Strong introduction with thesis statement\n• Body paragraphs with supporting details and examples\n• Smooth transitions between ideas\n• Compelling conclusion\n\nStart writing your essay here..."}
            className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none leading-relaxed text-sm"
            style={{ fontFamily: 'Space Mono, monospace' }}
          />
        </div>

        {/* Essay Statistics */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📊</span>
                <span className="font-medium text-gray-700">Words:</span>
                <span className="font-bold text-blue-600">{essayWordCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">🔢</span>
                <span className="font-medium text-gray-700">Characters:</span>
                <span className="font-bold text-purple-600">{essayCharCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${essayWordCount > 600 ? 'text-red-500' : essayWordCount > 400 ? 'text-orange-500' : essayWordCount >= 200 ? 'text-green-500' : 'text-gray-500'}`}>
                  {essayWordCount >= 200 ? '✅' : essayWordCount > 0 ? '⚠️' : '📝'}
                </span>
                <span className="font-medium text-gray-700">Length:</span>
                <span className={`font-bold ${essayWordCount > 600 ? 'text-red-600' : essayWordCount > 400 ? 'text-orange-600' : essayWordCount >= 200 ? 'text-green-600' : 'text-gray-600'}`}>
                  {
                    essayWordCount < 200 ? 'Too short' :
                    essayWordCount <= 400 ? 'Perfect' :
                    essayWordCount <= 600 ? 'Long' :
                    'Very long'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">ISEE Writing Tips:</p>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• Aim for 200-400 words for optimal evaluation</li>
                <li>• Use clear paragraph structure with smooth transitions</li>
                <li>• Include specific examples and supporting details</li>
                <li>• Check grammar, spelling, and punctuation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}