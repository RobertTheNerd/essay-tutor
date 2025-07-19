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
    <div className="space-y-5">
      {/* Enhanced Writing Prompt Field - More compact */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Writing prompt <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="relative">
          <textarea
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            placeholder={promptPlaceholder || 'Enter writing prompt...'}
            className="w-full h-16 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 resize-none text-base placeholder-gray-400 hover:border-gray-300"
            rows={2}
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          />
        </div>
      </div>

      {/* Enhanced Essay Text Field - More compact */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Essay</label>
          {essayText.trim() && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              {essayText.trim().split(/\s+/).length} words
            </span>
          )}
        </div>

        <div className="relative">
          <textarea
            value={essayText}
            onChange={e => setEssayText(e.target.value)}
            placeholder={
              essayPlaceholder ||
              'Start writing your essay...\n\nFocus on:\n• Clear introduction\n• Well-developed body paragraphs\n• Strong conclusion'
            }
            className="w-full h-80 px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 resize-none text-base leading-relaxed placeholder-gray-400 hover:border-gray-300"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: '1.7',
            }}
          />
        </div>
      </div>
    </div>
  )
}
