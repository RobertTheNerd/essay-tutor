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
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">📝 Text Input Method</h2>
      
      {/* Writing Prompt Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Writing Prompt
        </label>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder={promptPlaceholder || "Enter the writing prompt here..."}
          className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          rows={3}
        />
        <p className="text-xs text-gray-500">
          The writing prompt helps provide context for more accurate evaluation.
        </p>
      </div>

      {/* Essay Text Field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Essay Text
        </label>
        <textarea
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          placeholder={essayPlaceholder || "Write your ISEE essay here. Focus on clear structure with an introduction, body paragraphs with supporting details, and a strong conclusion."}
          className="w-full h-96 p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
          style={{ fontFamily: 'Space Mono, monospace' }}
        />
      </div>

      {/* Essay Statistics */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-6 text-sm text-gray-600">
          <span>
            <strong>Words:</strong> {essayWordCount}
          </span>
          <span>
            <strong>Characters:</strong> {essayCharCount}
          </span>
          <span className={`${essayWordCount > 600 ? 'text-red-600' : essayWordCount > 400 ? 'text-orange-600' : 'text-green-600'}`}>
            <strong>Length:</strong> {
              essayWordCount < 200 ? 'Too short' :
              essayWordCount <= 400 ? 'Good' :
              essayWordCount <= 600 ? 'Long' :
              'Very long'
            }
          </span>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <p><strong>Tip:</strong> ISEE essays typically range from 200-400 words. Focus on clear structure with introduction, body, and conclusion.</p>
      </div>
    </div>
  )
}