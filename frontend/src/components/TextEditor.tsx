import { useEffect, useState } from 'react'

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
  essayPlaceholder,
}: TextEditorProps) {
  const [promptText, setPromptText] = useState('')
  const [essayText, setEssayText] = useState('')

  useEffect(() => {
    if (onPromptChange) {
      onPromptChange(promptText)
    }
  }, [promptText, onPromptChange])

  useEffect(() => {
    if (onEssayChange) {
      onEssayChange(essayText)
    }
  }, [essayText, onEssayChange])

  return (
    <div className="space-y-10">
      {/* Enhanced Writing Prompt Field */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-gray-800">
          Writing Prompt{' '}
          <span className="text-gray-500 font-normal text-base">
            (optional - helps our AI provide more targeted feedback)
          </span>
        </label>
        <div className="relative">
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            placeholder={promptPlaceholder || 'Enter the writing prompt if provided...'}
            className="w-full h-24 px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border-0 rounded-2xl focus:outline-none focus:bg-white focus:shadow-lg focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none text-base placeholder-gray-400 hover:shadow-md"
            rows={3}
          />
          {promptText && (
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Enhanced Essay Text Field */}
      <div className="space-y-4">
        <label className="block text-lg font-semibold text-gray-800 flex items-center gap-3">
          <span>Your Essay</span>
          {essayText.trim() && (
            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
              {essayText.trim().split(/\s+/).length} words
            </span>
          )}
        </label>
        <div className="relative group">
          <textarea
            value={essayText}
            onChange={e => setEssayText(e.target.value)}
            placeholder={
              essayPlaceholder ||
              'Start writing your essay here...\n\nTake your time and focus on:\n• Clear introduction with your main idea\n• Well-developed body paragraphs\n• Strong conclusion that ties everything together'
            }
            className="w-full h-[500px] px-6 py-6 bg-gradient-to-br from-gray-50 to-gray-100/50 border-0 rounded-2xl focus:outline-none focus:bg-white focus:shadow-xl focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none text-base leading-relaxed placeholder-gray-400 hover:shadow-md group-hover:shadow-lg"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.8',
            }}
          />

          {/* Enhanced status indicators */}
          {essayText.trim().length > 50 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-700 font-medium">Ready for analysis</span>
            </div>
          )}

          {essayText.trim().length === 0 && (
            <div className="absolute bottom-4 right-4 bg-gray-100/90 backdrop-blur-sm rounded-full px-4 py-2 text-xs text-gray-500">
              Start typing to begin...
            </div>
          )}

          {/* Focus indicator */}
          <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      </div>
    </div>
  )
}
